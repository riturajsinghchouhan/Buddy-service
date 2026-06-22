import { ApiError } from '../../../utils/ApiError.js';
import { env } from '../../../config/env.js';

const ACTIVE_GATEWAY = {
  slug: 'razor_pay',
  label: 'Razorpay',
};

const normalizeString = (value = '') => String(value || '').trim();

const resolveRazorpayEnvironment = () => {
  const environment = normalizeString(env.razorpayEnvironment).toLowerCase();
  return environment === 'live' ? 'live' : 'test';
};

const resolveRazorpayCredentials = () => {
  const environment = resolveRazorpayEnvironment();
  const isLive = environment === 'live';
  const keyId = normalizeString(isLive ? env.razorpayLiveApiKey : env.razorpayTestApiKey);
  const keySecret = normalizeString(isLive ? env.razorpayLiveSecretKey : env.razorpayTestSecretKey);

  if (!keyId || !keySecret) {
    throw new ApiError(
      500,
      `Razorpay ${isLive ? 'live' : 'test'} credentials are not configured in environment variables`,
    );
  }

  if (keyId.toLowerCase().includes('demo') || keySecret.toLowerCase().includes('demo')) {
    throw new ApiError(500, 'Razorpay keys are demo placeholders. Configure real keys in .env');
  }

  return { keyId, keySecret, environment };
};

export const getActivePaymentGateway = async () => ({
  slug: ACTIVE_GATEWAY.slug,
  label: ACTIVE_GATEWAY.label,
  settings: {
    enabled: '1',
    environment: resolveRazorpayEnvironment(),
  },
});

export const getPublicActivePaymentGateway = async () => ({
  activeGateway: {
    slug: ACTIVE_GATEWAY.slug,
    label: ACTIVE_GATEWAY.label,
    supportsWalletTopUp: true,
    supportsRentalAdvance: true,
    walletTopUpMode: 'razorpay_checkout',
    rentalAdvanceMode: 'razorpay_checkout',
  },
});

export const resolveConfiguredGatewayCredentials = async (gatewayKey) => {
  if (gatewayKey !== 'razor_pay') {
    throw new ApiError(400, 'Unsupported payment gateway');
  }

  return resolveRazorpayCredentials();
};
