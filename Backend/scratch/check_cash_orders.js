import mongoose from 'mongoose';

const uri = 'mongodb+srv://buddy:buddys@cluster0.6ykakvc.mongodb.net/?appName=Cluster0';

const FoodOrder = mongoose.model('FoodOrder', new mongoose.Schema({}, { strict: false, collection: 'food_orders' }));
const FoodTransaction = mongoose.model('FoodTransaction', new mongoose.Schema({}, { strict: false, collection: 'food_transactions' }));
const FoodDeliveryCashDeposit = mongoose.model('FoodDeliveryCashDeposit', new mongoose.Schema({}, { strict: false, collection: 'food_delivery_cash_deposits' }));

mongoose.connect(uri).then(async () => {
  // Get all orders, not just recent 20
  const orders = await FoodOrder.find({
    orderStatus: { $in: ['delivered', 'completed'] }
  }).select('orderId orderStatus pricing payment paymentMethod amountToCollect dispatch riderEarning').lean();

  console.log(`\nTotal delivered orders: ${orders.length}`);

  const orderIds = orders.map(o => o._id);
  const txs = await FoodTransaction.find({ orderId: { $in: orderIds } }).lean();
  const txMap = {};
  txs.forEach(t => { txMap[t.orderId.toString()] = t; });

  // Check payment methods across all orders
  let cashOrders = 0, onlineOrders = 0, missingMethod = 0;
  let totalCashFromOrders = 0, totalCashFromTx = 0;

  orders.forEach(o => {
    const tx = txMap[o._id.toString()] || {};
    const orderMethod = (o.payment?.method || o.paymentMethod || '').toLowerCase();
    const txMethod = (tx.payment?.method || tx.paymentMethod || '').toLowerCase();
    const method = txMethod || orderMethod;

    if (method === 'cash' || method === 'cod') {
      cashOrders++;
      totalCashFromOrders += (o.pricing?.total || 0);
      totalCashFromTx += (tx.amounts?.totalCustomerPaid || tx.pricing?.total || tx.payment?.amountDue || o.pricing?.total || 0);
    } else if (!method) {
      missingMethod++;
    } else {
      onlineOrders++;
    }
  });

  console.log(`\nCash orders: ${cashOrders}, Online: ${onlineOrders}, Missing method: ${missingMethod}`);
  console.log(`Total Cash from FoodOrder.pricing.total: ${totalCashFromOrders}`);
  console.log(`Total Cash from FoodTransaction amounts: ${totalCashFromTx}`);

  // Now check deposits
  const deposits = await FoodDeliveryCashDeposit.find({ status: 'Completed' }).lean();
  const totalDeposited = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
  console.log(`\nTotal deposited (all partners): ${totalDeposited}`);
  console.log(`Total deposits count: ${deposits.length}`);

  // Check per partner
  const partnerDeposits = {};
  deposits.forEach(d => {
    const pid = d.deliveryPartnerId?.toString();
    partnerDeposits[pid] = (partnerDeposits[pid] || 0) + d.amount;
  });
  console.log('\nDeposits per partner:', partnerDeposits);

  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
