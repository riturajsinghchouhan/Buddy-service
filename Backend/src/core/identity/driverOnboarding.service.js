import { ValidationError, NotFoundError, ConflictError } from '../auth/errors.js';
import { BuddyIdentity } from './buddyIdentity.model.js';
import { FoodDeliveryPartner } from '../../modules/food/delivery/models/deliveryPartner.model.js';
import { Driver } from '../../modules/taxi/driver/models/Driver.js';
import { hashPassword } from '../../modules/taxi/driver/services/authService.js';
import { VEHICLE_TYPES } from '../../modules/taxi/constants/index.js';

const FOOD_VEHICLE_TYPES = ['bike', 'scooter'];

const getSelectedServices = (identity) => {
  const services = Array.isArray(identity?.onboardingServices) ? identity.onboardingServices : [];
  return services.filter((svc) => svc === 'food' || svc === 'taxi');
};

const getNextStep = (identity, currentStep) => {
  const services = getSelectedServices(identity);
  const hasFood = services.includes('food');
  const hasTaxi = services.includes('taxi');

  switch (String(currentStep || '').toLowerCase()) {
    case 'services':
      if (hasFood) return 'vehicle_food';
      if (hasTaxi) return 'vehicle_taxi';
      return 'basics';
    case 'vehicle_food':
      if (hasTaxi) return 'vehicle_taxi';
      return 'basics';
    case 'vehicle_taxi':
      return 'basics';
    case 'basics':
      return 'kyc';
    case 'kyc':
      return 'bank';
    case 'bank':
      return 'selfie';
    case 'selfie':
      return 'done';
  // Legacy flow support
    case 'vehicle':
      return 'selfie';
    case 'capabilities':
    case 'services':
      return 'done';
    default:
      return identity.onboardingStep || 'services';
  }
};

/** Map stored step names to the wizard step the client understands. */
export const normalizeOnboardingStepForClient = (step, identity = null) => {
  const normalized = String(step || 'services').toLowerCase();
  if (normalized === 'capabilities') return 'services';
  if (normalized === 'services') {
    // Legacy: final service picker before submit (profile already filled).
    if (identity?.name && identity?.kyc?.aadhaar?.number) {
      return 'selfie';
    }
    return 'services';
  }
  if (normalized === 'vehicle') {
    if (identity?.vehicle?.number && !identity?.foodVehicle?.number && !identity?.taxiVehicle?.number) {
      return 'selfie';
    }
    const services = getSelectedServices(identity);
    const effective = services.length ? services : ['food'];
    if (effective.includes('food') && !identity?.foodVehicle?.number) return 'vehicle_food';
    if (effective.includes('taxi') && !identity?.taxiVehicle?.number) return 'vehicle_taxi';
    return 'basics';
  }
  if (normalized === 'done') return 'done';
  if (
    !getSelectedServices(identity).length &&
    !['services', 'vehicle_food', 'vehicle_taxi'].includes(normalized)
  ) {
    return 'services';
  }
  return normalized;
};

const sanitize = (val) =>
  typeof val === 'string' ? val.trim() : val === undefined ? undefined : val;

const advanceStep = async (identity, currentStep) => {
  identity.onboardingStep = getNextStep(identity, currentStep);
  await identity.save();
};

const normalizeVehicleType = (value = '') => {
  const v = String(value || '').trim().toLowerCase();
  if (v.includes('bike') || v.includes('scooter')) return 'bike';
  if (v.includes('auto') || v.includes('rickshaw')) return 'auto';
  if (VEHICLE_TYPES.includes(v)) return v;
  return 'bike';
};

const normalizeVehicleNumber = (value = '') => String(value || '').trim().toUpperCase();

const excludeExistingDoc = (existingDoc) =>
  existingDoc?._id ? { _id: { $ne: existingDoc._id } } : {};

const assertUniqueVehicleNumber = async (identity, vehicleNumber) => {
  const normalized = normalizeVehicleNumber(vehicleNumber);
  if (!normalized) return;

  const existingPartner = await FoodDeliveryPartner.findOne({
    $or: [{ identityId: identity._id }, { phone: identity.phone }],
  })
    .select('_id phone')
    .lean();

  const partnerConflict = await FoodDeliveryPartner.findOne({
    vehicleNumber: normalized,
    ...excludeExistingDoc(existingPartner),
  })
    .select('phone name')
    .lean();

  if (partnerConflict) {
    throw new ConflictError(
      `Vehicle number ${normalized} is already registered with another delivery partner`,
    );
  }

  const existingDriver = await Driver.findOne({
    $or: [{ identityId: identity._id }, { phone: identity.phone }],
  })
    .select('_id phone')
    .lean();

  const driverConflict = await Driver.findOne({
    vehicleNumber: normalized,
    ...excludeExistingDoc(existingDriver),
  })
    .select('phone name')
    .lean();

  if (driverConflict && String(driverConflict.phone) !== String(identity.phone)) {
    throw new ConflictError(
      `Vehicle number ${normalized} is already registered with another driver`,
    );
  }
};

const assertUniquePhoneForProfiles = async (identity, { food = false, taxi = false } = {}) => {
  const phone = String(identity.phone || '').trim();
  if (!phone) return;

  if (food) {
    const partnerConflict = await FoodDeliveryPartner.findOne({
      phone,
      identityId: { $ne: identity._id },
    })
      .select('_id')
      .lean();
    if (partnerConflict) {
      throw new ConflictError('This phone number is already registered as a delivery partner');
    }
  }

  if (taxi) {
    const driverConflict = await Driver.findOne({
      phone,
      identityId: { $ne: identity._id },
    })
      .select('_id')
      .lean();
    if (driverConflict) {
      throw new ConflictError('This phone number is already registered as a taxi driver');
    }
  }
};

const normalizeFoodVehicleType = (value = '') => {
  const v = String(value || '').trim().toLowerCase();
  if (v.includes('scooter')) return 'scooter';
  return 'bike';
};

const assertCreatableProfiles = async (identity, services = []) => {
  const normalizedServices = Array.isArray(services) ? services : [];
  if (normalizedServices.includes('food')) {
    await assertUniquePhoneForProfiles(identity, { food: true });
    const foodNumber = identity.foodVehicle?.number || identity.vehicle?.number;
    await assertUniqueVehicleNumber(identity, foodNumber);
  }
  if (normalizedServices.includes('taxi')) {
    await assertUniquePhoneForProfiles(identity, { taxi: true });
    const taxiNumber = identity.taxiVehicle?.number || identity.vehicle?.number;
    if (taxiNumber) {
      await assertUniqueVehicleNumber(identity, taxiNumber);
    }
  }
};

export const updateServices = async (identity, body) => {
  const services = Array.isArray(body?.services)
    ? body.services.filter((svc) => svc === 'food' || svc === 'taxi')
    : [];
  if (services.length === 0) {
    throw new ValidationError('Select at least one service to drive for');
  }
  identity.onboardingServices = services;
  identity.markModified('onboardingServices');
  await advanceStep(identity, 'services');
  return identity;
};

export const updateFoodVehicle = async (identity, body) => {
  const { type, number, make, model, color, photoUrl, rcUrl, insuranceUrl } = body || {};
  if (!type || !number) {
    throw new ValidationError('Vehicle type and number are required');
  }
  identity.foodVehicle = {
    type: normalizeFoodVehicleType(type),
    make: sanitize(make) || '',
    model: sanitize(model) || '',
    number: normalizeVehicleNumber(number),
    color: sanitize(color) || '',
    photoUrl: sanitize(photoUrl) || '',
    rcUrl: sanitize(rcUrl) || '',
    insuranceUrl: sanitize(insuranceUrl) || '',
  };
  await assertUniqueVehicleNumber(identity, identity.foodVehicle.number);
  identity.markModified('foodVehicle');
  await advanceStep(identity, 'vehicle_food');
  return identity;
};

export const updateTaxiVehicle = async (identity, body) => {
  const { type, number, vehicleTypeId, name, make, model, color, photoUrl, rcUrl, insuranceUrl } = body || {};
  if (!type || !number) {
    throw new ValidationError('Vehicle type and number are required');
  }
  identity.taxiVehicle = {
    type: normalizeVehicleType(type),
    make: sanitize(make) || sanitize(name) || '',
    model: sanitize(model) || sanitize(vehicleTypeId) || '',
    number: normalizeVehicleNumber(number),
    color: sanitize(color) || '',
    photoUrl: sanitize(photoUrl) || '',
    rcUrl: sanitize(rcUrl) || '',
    insuranceUrl: sanitize(insuranceUrl) || '',
  };
  await assertUniqueVehicleNumber(identity, identity.taxiVehicle.number);
  identity.markModified('taxiVehicle');
  await advanceStep(identity, 'vehicle_taxi');
  return identity;
};

export const updateBasics = async (identity, body) => {
  const { name, email, gender, city, profileImage } = body || {};
  if (!name || String(name).trim().length < 2) {
    throw new ValidationError('Name is required (min 2 characters)');
  }
  identity.name = sanitize(name);
  if (email !== undefined) identity.email = String(email || '').trim().toLowerCase();
  if (gender !== undefined) identity.gender = sanitize(gender);
  if (city !== undefined) identity.city = sanitize(city);
  if (profileImage !== undefined) identity.profileImage = sanitize(profileImage);

  await advanceStep(identity, 'basics');
  return identity;
};

export const updateKyc = async (identity, body) => {
  const { aadhaar, pan, drivingLicense } = body || {};
  identity.kyc = identity.kyc || {};
  if (aadhaar) {
    identity.kyc.aadhaar = {
      number: sanitize(aadhaar.number) || identity.kyc.aadhaar?.number || '',
      documentUrl: sanitize(aadhaar.documentUrl) || identity.kyc.aadhaar?.documentUrl || '',
      backDocumentUrl:
        sanitize(aadhaar.backDocumentUrl) || identity.kyc.aadhaar?.backDocumentUrl || '',
      uploadedAt: new Date(),
    };
  }
  if (pan) {
    identity.kyc.pan = {
      number: sanitize(pan.number) || identity.kyc.pan?.number || '',
      documentUrl: sanitize(pan.documentUrl) || identity.kyc.pan?.documentUrl || '',
      uploadedAt: new Date(),
    };
  }
  if (drivingLicense) {
    identity.kyc.drivingLicense = {
      number: sanitize(drivingLicense.number) || identity.kyc.drivingLicense?.number || '',
      documentUrl:
        sanitize(drivingLicense.documentUrl) || identity.kyc.drivingLicense?.documentUrl || '',
      uploadedAt: new Date(),
    };
  }

  if (
    !identity.kyc.aadhaar?.number ||
    !identity.kyc.drivingLicense?.number
  ) {
    throw new ValidationError('Aadhaar number and Driving License number are required');
  }

  identity.markModified('kyc');
  await advanceStep(identity, 'kyc');
  return identity;
};

export const updateBank = async (identity, body) => {
  const { accountHolderName, accountNumber, ifscCode, bankName, branchName, upiId, upiQrCodeUrl } =
    body || {};

  // Either bank account or UPI must be present.
  const hasBank = accountNumber && ifscCode;
  const hasUpi = !!upiId;
  if (!hasBank && !hasUpi) {
    throw new ValidationError(
      'Provide either bank account details (accountNumber + ifscCode) or a UPI ID',
    );
  }

  identity.bank = {
    accountHolderName: sanitize(accountHolderName) || '',
    accountNumber: sanitize(accountNumber) || '',
    ifscCode: sanitize(ifscCode) ? String(ifscCode).trim().toUpperCase() : '',
    bankName: sanitize(bankName) || '',
    branchName: sanitize(branchName) || '',
    upiId: sanitize(upiId) || '',
    upiQrCodeUrl: sanitize(upiQrCodeUrl) || '',
    updatedAt: new Date(),
  };

  identity.markModified('bank');
  await advanceStep(identity, 'bank');
  return identity;
};

export const updateVehicle = async (identity, body) => {
  const { type, make, model, number, color, photoUrl, rcUrl, insuranceUrl } = body || {};
  if (!type || !number) {
    throw new ValidationError('Vehicle type and number are required');
  }
  identity.vehicle = {
    type: normalizeVehicleType(type),
    make: sanitize(make) || '',
    model: sanitize(model) || '',
    number: String(number || '').trim().toUpperCase(),
    color: sanitize(color) || '',
    photoUrl: sanitize(photoUrl) || '',
    rcUrl: sanitize(rcUrl) || '',
    insuranceUrl: sanitize(insuranceUrl) || '',
  };
  await assertUniqueVehicleNumber(identity, identity.vehicle.number);
  identity.markModified('vehicle');
  await advanceStep(identity, 'vehicle');
  return identity;
};

export const updateSelfie = async (identity, body) => {
  const url = sanitize(body?.selfieUrl);
  if (!url) throw new ValidationError('Selfie URL is required');
  identity.onboardingSelfieUrl = url;
  await advanceStep(identity, 'selfie');
  return identity;
};

/**
 * Marks onboarding complete and creates the requested capability profiles.
 *
 * Both `FoodDeliveryPartner` and `Driver` (TaxiDriver) docs are created with
 * `status: 'pending'` so admin must approve them before the driver can pick
 * up jobs. KYC + bank + vehicle data is copied from the identity so the
 * driver doesn't re-enter anything.
 */
export const completeOnboarding = async (identity, body) => {
  const services = getSelectedServices(identity).length
    ? getSelectedServices(identity)
    : Array.isArray(body?.services)
      ? body.services.filter((svc) => svc === 'food' || svc === 'taxi')
      : [];
  if (services.length === 0) {
    throw new ValidationError('Select at least one service to drive for');
  }

  if (!identity.name || !identity.kyc?.aadhaar?.number || !identity.onboardingSelfieUrl) {
    throw new ValidationError('Complete all onboarding steps before submitting');
  }

  if (services.includes('food')) {
    const foodNumber = identity.foodVehicle?.number || identity.vehicle?.number;
    if (!foodNumber) {
      throw new ValidationError('Add your food delivery vehicle details');
    }
  }

  if (services.includes('taxi')) {
    const taxiNumber = identity.taxiVehicle?.number || identity.vehicle?.number;
    if (!taxiNumber) {
      throw new ValidationError('Add your taxi vehicle details');
    }
  }

  if (!identity.onboardingServices?.length) {
    identity.onboardingServices = services;
    identity.markModified('onboardingServices');
  }

  await assertCreatableProfiles(identity, services);

  const createdPartner = services.includes('food')
    ? await ensureFoodPartner(identity)
    : null;
  const createdDriver = services.includes('taxi') ? await ensureTaxiDriver(identity) : null;

  identity.onboardingComplete = true;
  identity.onboardingStep = 'done';
  await BuddyIdentity.updateOne(
    { _id: identity._id },
    {
      $set: {
        onboardingComplete: true,
        onboardingStep: 'done',
        'identityRefs.foodPartnerId': createdPartner?._id || identity.identityRefs?.foodPartnerId || null,
        'identityRefs.driverId': createdDriver?._id || identity.identityRefs?.driverId || null,
      },
      $addToSet: { roles: 'DRIVER' },
    },
  );

  return {
    onboardingComplete: true,
    services: services,
    capabilities: {
      food: createdPartner ? createdPartner.status || 'pending' : 'not_enabled',
      taxi: createdDriver ? createdDriver.status || 'pending' : 'not_enabled',
    },
  };
};

const ensureFoodPartner = async (identity) => {
  const existing = await FoodDeliveryPartner.findOne({
    $or: [{ identityId: identity._id }, { phone: identity.phone }],
  });
  if (existing) {
    if (!existing.identityId) {
      existing.identityId = identity._id;
      await existing.save();
    }
    return existing;
  }

  return FoodDeliveryPartner.create({
    identityId: identity._id,
    name: identity.name,
    phone: identity.phone,
    email: identity.email || '',
    countryCode: identity.countryCode || '+91',
    city: identity.city || '',
    vehicleType: identity.foodVehicle?.type || identity.vehicle?.type || '',
    vehicleName:
      identity.foodVehicle?.make ||
      identity.foodVehicle?.model ||
      identity.vehicle?.make ||
      identity.vehicle?.model ||
      '',
    vehicleNumber: identity.foodVehicle?.number || identity.vehicle?.number || '',
    aadharNumber: identity.kyc?.aadhaar?.number || '',
    aadharPhoto: identity.kyc?.aadhaar?.documentUrl || '',
    panNumber: identity.kyc?.pan?.number || '',
    panPhoto: identity.kyc?.pan?.documentUrl || '',
    drivingLicenseNumber: identity.kyc?.drivingLicense?.number || '',
    drivingLicensePhoto: identity.kyc?.drivingLicense?.documentUrl || '',
    profilePhoto: identity.profileImage || '',
    bankAccountHolderName: identity.bank?.accountHolderName || '',
    bankAccountNumber: identity.bank?.accountNumber || '',
    bankIfscCode: identity.bank?.ifscCode || '',
    bankName: identity.bank?.bankName || '',
    upiId: identity.bank?.upiId || '',
    upiQrCode: identity.bank?.upiQrCodeUrl || '',
    status: 'pending',
  });
};

const ensureTaxiDriver = async (identity) => {
  const existing = await Driver.findOne({
    $or: [{ identityId: identity._id }, { phone: identity.phone }],
  });
  if (existing) {
    if (!existing.identityId) {
      existing.identityId = identity._id;
      await existing.save();
    }
    return existing;
  }

  return Driver.create({
    identityId: identity._id,
    name: identity.name,
    phone: identity.phone,
    email: identity.email || '',
    password: await hashPassword(String(identity.phone || '')),
    vehicleType: identity.taxiVehicle?.type || identity.vehicle?.type || 'bike',
    vehicleNumber: identity.taxiVehicle?.number || identity.vehicle?.number || '',
    vehicleMake: identity.taxiVehicle?.make || identity.vehicle?.make || '',
    vehicleModel: identity.taxiVehicle?.model || identity.vehicle?.model || '',
    vehicleColor: identity.taxiVehicle?.color || identity.vehicle?.color || '',
    vehicleImage: identity.taxiVehicle?.photoUrl || identity.vehicle?.photoUrl || '',
    profile_picture: identity.profileImage || '',
    profileImage: identity.profileImage || '',
    gender: identity.gender || '',
    city: identity.city || '',
    registerFor: 'taxi',
    approve: false,
    status: 'pending',
    bankDetails: {
      accountHolderName: identity.bank?.accountHolderName || '',
      upiId: identity.bank?.upiId || '',
      qrCodeImage: identity.bank?.upiQrCodeUrl || '',
      accountNumber: identity.bank?.accountNumber || '',
      ifsc: identity.bank?.ifscCode || '',
      branchName: identity.bank?.branchName || '',
      updatedAt: new Date(),
    },
    location: { type: 'Point', coordinates: [0, 0] },
  });
};

/**
 * Lets an already-onboarded driver add a new capability (e.g. they signed up
 * for food only, now want taxi too). No KYC re-entry — the identity already
 * has it.
 */
export const enableCapability = async (identity, service) => {
  if (!identity.onboardingComplete) {
    throw new ValidationError('Complete onboarding before enabling a capability');
  }
  const svc = String(service || '').toLowerCase();
  if (svc !== 'food' && svc !== 'taxi') {
    throw new ValidationError('service must be either "food" or "taxi"');
  }
  if (svc === 'food') {
    await assertCreatableProfiles(identity, ['food']);
    const partner = await ensureFoodPartner(identity);
    return { service: 'food', status: partner.status || 'pending' };
  }
  await assertCreatableProfiles(identity, ['taxi']);
  const driver = await ensureTaxiDriver(identity);
  return { service: 'taxi', status: driver.status || 'pending' };
};

export const getOnboardingState = async (identity) => {
  if (!identity) throw new NotFoundError('Identity not found');
  return {
    // Identity essentials — useful for the unified driver profile page that
    // renders this state directly (phone/joined date/active service).
    identityId: String(identity._id),
    phone: identity.phone,
    countryCode: identity.countryCode || '+91',
    activeService: identity.activeService || 'off',
    isVerified: Boolean(identity.isVerified),
    isActive: identity.isActive !== false,
    lastLoginAt: identity.lastLoginAt || null,
    createdAt: identity.createdAt || null,
    updatedAt: identity.updatedAt || null,

    onboardingComplete: identity.onboardingComplete,
    onboardingStep: normalizeOnboardingStepForClient(identity.onboardingStep, identity),
    onboardingServices: getSelectedServices(identity),
    basics: {
      name: identity.name,
      email: identity.email,
      gender: identity.gender,
      city: identity.city,
      profileImage: identity.profileImage,
    },
    kyc: identity.kyc || {},
    bank: identity.bank || {},
    vehicle: identity.vehicle || {},
    foodVehicle: identity.foodVehicle || {},
    taxiVehicle: identity.taxiVehicle || {},
    selfieUrl: identity.onboardingSelfieUrl || '',
  };
};
