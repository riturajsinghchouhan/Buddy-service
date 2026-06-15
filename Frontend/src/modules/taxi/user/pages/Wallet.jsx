import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, History, Gift } from 'lucide-react';
import { userAuthService } from '../services/authService';
import { useSettings } from '../../../shared/context/SettingsContext';
import { openExternalCheckout } from '../../../shared/utils/externalNavigation';
import { rememberPendingPhonePeRedirect } from '../../../shared/utils/phonePeResume';
import AddMoneyModal from '@food/components/user/AddMoneyModal';

const PHONEPE_USER_WALLET_FLOW_KEY = 'user-wallet-topup';

const Wallet = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const appName = settings.general?.app_name || 'App';
  const activePaymentGateway = settings.paymentGateway || null;

  const [showAddMoney, setShowAddMoney] = React.useState(false);
  const [walletLoading, setWalletLoading] = React.useState(true);
  const [walletError, setWalletError] = React.useState('');
  const [wallet, setWallet] = React.useState({ balance: 0, currency: 'INR', recentTransactions: [] });

  const basePath = useMemo(
    () => (window.location.pathname.startsWith('/taxi/user') ? '/taxi/user' : ''),
    [],
  );

  const formatInr = (value) => {
    const amountValue = Number(value || 0);
    const fixed = Math.round(amountValue * 100) / 100;
    return fixed.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const splitMoney = (formatted) => {
    const [whole, decimals = '00'] = String(formatted).split('.');
    return { whole, decimals: (decimals || '00').padEnd(2, '0').slice(0, 2) };
  };

  const balanceText = useMemo(() => splitMoney(formatInr(wallet.balance)), [wallet.balance]);
  const walletTopUpGatewayLabel = activePaymentGateway?.label || 'payment gateway';
  const supportsWalletTopUp = activePaymentGateway?.supportsWalletTopUp === true;
  const walletTopUpMode = activePaymentGateway?.walletTopUpMode || '';
  const canTopUpWallet = supportsWalletTopUp && ['razorpay_checkout', 'phonepe_redirect'].includes(walletTopUpMode);

  const refreshWallet = async () => {
    setWalletError('');
    setWalletLoading(true);

    try {
      const response = await userAuthService.getWallet();
      const data = response?.data || {};
      setWallet({
        balance: Number(data.balance || 0),
        currency: data.currency || 'INR',
        recentTransactions: Array.isArray(data.recentTransactions) ? data.recentTransactions : [],
      });
    } catch (err) {
      setWalletError(err?.message || 'Failed to load wallet');
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    refreshWallet();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 max-w-lg mx-auto flex flex-col font-sans pb-24 relative overflow-x-hidden">
      <AddMoneyModal 
        open={showAddMoney} 
        onOpenChange={setShowAddMoney} 
        onSuccess={refreshWallet}
        createOrder={async (amount) => {
          const res = await userAuthService.createWalletTopupOrder(amount);
          return {
            data: {
              data: {
                razorpay: {
                  key: res.data?.keyId,
                  orderId: res.data?.orderId,
                  amount: res.data?.amount,
                  currency: res.data?.currency || 'INR'
                }
              }
            }
          };
        }}
        verifyPayment={async (data) => {
          return await userAuthService.verifyWalletTopup({
            razorpay_order_id: data.razorpayOrderId,
            razorpay_payment_id: data.razorpayPaymentId,
            razorpay_signature: data.razorpaySignature
          });
        }}
        getUserProfile={async () => {
          const res = await userAuthService.getCurrentUser();
          return { data: { data: { user: res.data?.data } } };
        }}
      />

      <header className="bg-white px-5 pt-10 pb-4 sticky top-0 z-20 border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center shadow-sm active:scale-95 transition-all"
          >
            <ArrowLeft size={18} className="text-slate-900" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">My Wallet</h1>
        </div>
      </header>

      <div className="px-5 mt-6">
        <Motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col gap-8">
            <div className="space-y-1">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Available Balance</p>
              <h2 className="text-4xl font-bold tracking-tight">
                {walletLoading ? (
                  <>₹ 0<span className="text-slate-600 text-2xl">.00</span></>
                ) : (
                  <>₹ {balanceText.whole}<span className="text-slate-600 text-2xl">.{balanceText.decimals}</span></>
                )}
              </h2>
              {walletError && <p className="text-xs font-bold text-rose-400 mt-2">{walletError}</p>}
              {activePaymentGateway && !canTopUpWallet && (
                <p className="text-xs font-bold text-amber-300 mt-2">
                  {walletTopUpGatewayLabel} is active, but wallet top-up is not available for it yet.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setWalletError('');
                  setShowAddMoney(true);
                }}
                disabled={!canTopUpWallet}
                className="flex-1 bg-white text-slate-900 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add Money
              </button>
            </div>
          </div>
        </Motion.div>
      </div>

      <div className="px-5 mt-6">
        <button
          onClick={() => navigate(`${basePath}/referral`)}
          className="w-full bg-white border border-slate-100 rounded-3xl p-5 flex items-center gap-4 active:scale-[0.98] transition-all shadow-sm group"
        >
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
            <Gift size={20} />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-sm font-bold text-slate-900">Refer & Earn ₹50</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Invite friends to {appName}</p>
          </div>
          <ArrowLeft size={18} className="text-slate-300 rotate-180 group-hover:text-slate-900 transition-colors" />
        </button>
      </div>

      <div className="px-5 mt-10">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction History</h3>
          <button onClick={() => navigate(`${basePath}/activity`)} className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">View All</button>
        </div>
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          {walletLoading ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400">Loading transactions...</div>
          ) : wallet.recentTransactions?.length ? (
            wallet.recentTransactions.map((tx) => {
              const isDebit = tx.kind === 'debit';
              const title = tx.title || (isDebit ? 'Debit' : 'Credit');
              const sign = isDebit ? '-' : '+';
              const amountText = formatInr(tx.amount);
              const whenText = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

              return (
                <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      isDebit ? 'bg-slate-50 text-slate-600' : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {isDebit ? <ArrowLeft size={16} className="rotate-45" /> : <Plus size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{whenText}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <h4 className={`text-base font-bold ${isDebit ? 'text-slate-900' : 'text-emerald-600'}`}>
                      {sign}₹{amountText}
                    </h4>
                    <span className={`text-[8px] font-bold uppercase tracking-wider ${isDebit ? 'text-slate-400' : 'text-emerald-400'}`}>
                      {isDebit ? 'Debit' : 'Credit'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs font-bold text-slate-400">No transactions yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
