import mongoose from 'mongoose';
import { FoodOrder } from '../../orders/models/order.model.js';
import { FoodTransaction } from '../../orders/models/foodTransaction.model.js';
import { FoodDeliveryWithdrawal } from '../models/foodDeliveryWithdrawal.model.js';
import { FoodDeliveryCashDeposit } from '../models/foodDeliveryCashDeposit.model.js';
import { FoodDeliveryPartner } from '../models/deliveryPartner.model.js';
import { DeliveryBonusTransaction } from '../../admin/models/deliveryBonusTransaction.model.js';
import { getDeliveryCashLimitSettings } from '../../admin/services/admin.service.js';
import { ValidationError } from '../../../../core/auth/errors.js';
import { createRazorpayOrder, getRazorpayKeyId, isRazorpayConfigured, verifyPaymentSignature } from '../../orders/helpers/razorpay.helper.js';

/**
 * Enhanced wallet fetch for delivery partners.
 * Integrates:
 * 1. Historical orders (earnings)
 * 2. Admin bonuses
 * 3. Withdrawals (pending/payout)
 * 4. Cash collected vs limit
 */
export const getDeliveryPartnerWalletEnhanced = async (deliveryPartnerId) => {
    if (!deliveryPartnerId || !mongoose.Types.ObjectId.isValid(deliveryPartnerId)) {
        throw new ValidationError('Invalid delivery partner ID');
    }

    const partnerId = new mongoose.Types.ObjectId(deliveryPartnerId);
    const partner = await FoodDeliveryPartner.findById(partnerId).lean();
    if (!partner) throw new ValidationError('Delivery partner not found');

    const [cashLimitSettings, ordersRes, cashCollectedRes, depositsRes, bonusRes, withdrawalsRes] = await Promise.all([
        getDeliveryCashLimitSettings(),
        FoodOrder.aggregate([
            { 
                $match: { 
                    $or: [
                        { 'dispatch.deliveryPartnerId': partnerId },
                        { 'dispatch.sharedPartnerId': partnerId }
                    ],
                    orderStatus: 'delivered' 
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    totalEarned: { 
                        $sum: { 
                            $cond: [
                                { $eq: ["$dispatch.deliveryPartnerId", partnerId] },
                                { 
                                    $cond: [
                                        { $gt: [{ $ifNull: ["$riderEarning", 0] }, 0] },
                                        "$riderEarning",
                                        { $ifNull: ["$pricing.deliveryFee", 0] }
                                    ]
                                },
                                { $ifNull: ["$sharedRiderEarning", 0] }
                            ]
                        } 
                    },
                    count: { $sum: 1 }
                } 
            }
        ]),
        FoodOrder.aggregate([
            { 
                $match: { 
                    $or: [
                        { 'dispatch.deliveryPartnerId': partnerId },
                        { 'dispatch.sharedPartnerId': partnerId }
                    ],
                    orderStatus: { $in: ['accepted', 'preparing', 'ready_for_pickup', 'picked_up', 'reached_drop', 'delivered'] }, 
                    'payment.method': 'cash'
                } 
            },
            { $group: { _id: null, cashCollected: { $sum: { $ifNull: ['$pricing.total', 0] } } } }
        ]),
        FoodDeliveryCashDeposit.aggregate([
            { $match: { deliveryPartnerId: partnerId, status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        DeliveryBonusTransaction.aggregate([
            { $match: { deliveryPartnerId: partnerId, status: 'credited' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        FoodDeliveryWithdrawal.aggregate([
            { $match: { deliveryPartnerId: partnerId, status: { $in: ['pending', 'approved', 'processed'] } } },
            { $group: { _id: '$status', total: { $sum: '$amount' } } }
        ]),
    ]);

    const totalEarned = Number(ordersRes[0]?.totalEarned || 0);
    const totalOrders = Number(ordersRes[0]?.count || 0);
    const totalCashCollected = Number(cashCollectedRes[0]?.cashCollected || 0);
    const totalCashDeposited = Number(depositsRes[0]?.total || 0);
    const totalBonus = Number(bonusRes[0]?.total || 0);

    const withdrawalsMap = (withdrawalsRes || []).reduce((acc, curr) => {
        acc[curr._id] = curr.total;
        return acc;
    }, {});

    const totalWithdrawn = Number(withdrawalsMap['approved'] || 0);
    const pendingWithdrawals = Number(withdrawalsMap['pending'] || 0);

    // Lifetime Earnings = Total from orders + bonuses
    const lifetimeEarnings = totalEarned + totalBonus;
    
    // Pocket balance = Total Earned + Bonuses - All non-rejected withdrawals
    const pocketBalance = Math.max(0, lifetimeEarnings - (totalWithdrawn + pendingWithdrawals));
    
    // Cash in hand = Total cash collected from customers - Total cash deposited to admin
    const cashInHand = Math.max(0, totalCashCollected - totalCashDeposited);

    const totalCashLimit = Number(cashLimitSettings?.deliveryCashLimit) || 2000;
    const deliveryWithdrawalLimit = Number(cashLimitSettings?.deliveryWithdrawalLimit) || 100;

    // Get transactions for UI (Orders, Bonuses, Withdrawals)
    const [ordersTx, withdrawalsList, depositList] = await Promise.all([
        FoodOrder.find({ 
            $or: [
                { 'dispatch.deliveryPartnerId': partnerId },
                { 'dispatch.sharedPartnerId': partnerId }
            ],
            orderStatus: 'delivered' 
        })
            .sort({ createdAt: -1 })
            .select('orderId riderEarning payment orderStatus createdAt')
            .limit(20)
            .lean(),
        FoodDeliveryWithdrawal.find({ deliveryPartnerId: partnerId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean(),
        FoodDeliveryCashDeposit.find({ deliveryPartnerId: partnerId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
    ]);

    const transactions = [
        ...(ordersTx || []).map(o => ({
            id: o._id,
            type: 'payment',
            amount: String(o.dispatch?.deliveryPartnerId || '') === String(partnerId) 
                ? (o.riderEarning || o.pricing?.deliveryFee || 0)
                : (o.sharedRiderEarning || 0),
            status: 'Completed',
            date: o.createdAt,
            description: o.payment?.method === 'cash' ? 'COD delivery earning' : 'Online delivery earning',
            orderId: o.orderId
        })),
        ...(withdrawalsList || []).map(w => ({
            id: w._id,
            type: 'withdrawal',
            amount: w.amount,
            status: w.status === 'pending' ? 'Pending' : (w.status === 'approved' ? 'Completed' : 'Rejected'),
            date: w.createdAt,
            description: `Withdrawal Request - ${w.paymentMethod}`,
            payoutMethod: w.paymentMethod
        })),
        ...(depositList || []).map(d => ({
            id: d._id,
            type: 'deposit',
            amount: d.amount,
            status: d.status || 'Pending',
            date: d.createdAt,
            description: 'Cash limit settlement',
            paymentMethod: d.paymentMethod || 'cash'
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Get last payout
    const lastWithdrawal = await FoodDeliveryWithdrawal.findOne({ 
        deliveryPartnerId: partnerId, 
        status: 'processed' 
    }).sort({ updatedAt: -1 }).lean();

    return {
        totalBalance: lifetimeEarnings,
        pocketBalance: Number(pocketBalance.toFixed(2)),
        cashInHand: Number(cashInHand.toFixed(2)),
        totalEarned: Number(totalEarned.toFixed(2)),
        totalBonus: Number(totalBonus.toFixed(2)),
        totalWithdrawn: Number(totalWithdrawn.toFixed(2)),
        pendingWithdrawals: Number(pendingWithdrawals.toFixed(2)),
        totalOrders,
        lastPayout: lastWithdrawal ? {
            amount: lastWithdrawal.amount,
            date: lastWithdrawal.updatedAt
        } : null,
        totalCashLimit,
        availableCashLimit: Math.max(0, totalCashLimit - cashInHand),
        deliveryWithdrawalLimit,
        transactions: transactions.slice(0, 50)
    };
};

/**
 * Submits a new withdrawal request for a delivery partner.
 */
export const requestDeliveryWithdrawal = async (deliveryPartnerId, payload) => {
    const { amount, bankDetails, paymentMethod = 'bank_transfer' } = payload;

    if (!amount || amount < 1) throw new ValidationError('Invalid amount');

    const wallet = await getDeliveryPartnerWalletEnhanced(deliveryPartnerId);
    if (amount < wallet.deliveryWithdrawalLimit) {
        throw new ValidationError(`Minimum withdrawal amount is ₹${wallet.deliveryWithdrawalLimit}`);
    }
    if (amount > wallet.pocketBalance) {
        throw new ValidationError('Insufficient balance for this withdrawal');
    }

    const partner = await FoodDeliveryPartner.findById(deliveryPartnerId).lean();
    if (!partner) throw new ValidationError('Delivery partner not found');

    const withdrawal = await FoodDeliveryWithdrawal.create({
        deliveryPartnerId,
        amount,
        paymentMethod,
        bankDetails: bankDetails || {
            accountNumber: partner.bankAccountNumber,
            ifscCode: partner.bankIfscCode,
            bankName: partner.bankName,
            accountHolderName: partner.bankAccountHolderName
        },
        upiId: partner.upiId,
        upiQrCode: partner.upiQrCode,
        status: 'pending'
    });

    return withdrawal;
};

export const createDeliveryCashDepositOrder = async (deliveryPartnerId, amountInr) => {
    const amount = Number(amountInr);
    if (!Number.isFinite(amount) || amount < 1) {
        throw new ValidationError('Amount must be at least ₹1');
    }
    if (amount > 500000) {
        throw new ValidationError('Maximum deposit is ₹5,00,000');
    }

    const wallet = await getDeliveryPartnerWalletEnhanced(deliveryPartnerId);
    if (amount > wallet.cashInHand) {
        throw new ValidationError('Deposit amount cannot exceed cash in hand');
    }

    const amountPaise = Math.round(amount * 100);
    const receipt = `cash_deposit_${String(deliveryPartnerId).slice(-8)}_${Date.now()}`;

    if (!isRazorpayConfigured()) {
        return {
            razorpay: {
                key: getRazorpayKeyId() || 'rzp_test_dummy',
                orderId: `order_dev_${Date.now()}`,
                amount: amountPaise,
                currency: 'INR'
            }
        };
    }

    const order = await createRazorpayOrder(amountPaise, 'INR', receipt);
    return {
        razorpay: {
            key: getRazorpayKeyId(),
            orderId: String(order.id),
            amount: Number(order.amount) || amountPaise,
            currency: order.currency || 'INR'
        }
    };
};

export const verifyDeliveryCashDepositPayment = async (deliveryPartnerId, payload = {}) => {
    const orderId = String(payload?.razorpayOrderId || '').trim();
    const paymentId = String(payload?.razorpayPaymentId || '').trim();
    const signature = String(payload?.razorpaySignature || '').trim();
    const amount = Number(payload?.amount);

    if (!orderId) throw new ValidationError('razorpayOrderId is required');
    if (!paymentId) throw new ValidationError('razorpayPaymentId is required');
    if (!signature) throw new ValidationError('razorpaySignature is required');
    if (!Number.isFinite(amount) || amount < 1) throw new ValidationError('amount is required');

    const existing = await FoodDeliveryCashDeposit.findOne({
        deliveryPartnerId,
        $or: [
            { razorpayPaymentId: paymentId },
            { razorpayOrderId: orderId }
        ]
    }).lean();

    if (existing?.status === 'Completed') {
        return { deposit: existing, wallet: await getDeliveryPartnerWalletEnhanced(deliveryPartnerId) };
    }

    const wallet = await getDeliveryPartnerWalletEnhanced(deliveryPartnerId);
    if (amount > wallet.cashInHand) {
        throw new ValidationError('Deposit amount cannot exceed cash in hand');
    }

    const isValid = isRazorpayConfigured()
        ? verifyPaymentSignature(orderId, paymentId, signature)
        : true;

    if (!isValid) {
        throw new ValidationError('Payment verification failed');
    }

    const deposit = existing
        ? await FoodDeliveryCashDeposit.findByIdAndUpdate(
            existing._id,
            {
                $set: {
                    amount,
                    paymentMethod: isRazorpayConfigured() ? 'razorpay' : 'cash',
                    status: 'Completed',
                    razorpayOrderId: orderId,
                    razorpayPaymentId: paymentId
                }
            },
            { new: true }
        )
        : await FoodDeliveryCashDeposit.create({
            deliveryPartnerId,
            amount,
            paymentMethod: isRazorpayConfigured() ? 'razorpay' : 'cash',
            status: 'Completed',
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId
        });

    return {
        deposit,
        wallet: await getDeliveryPartnerWalletEnhanced(deliveryPartnerId)
    };
};
