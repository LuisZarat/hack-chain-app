const VALID_GLOBAL_PROVIDERS = ['paypal', 'revolut', 'wise', 'payoneer', 'other'];
const VALID_NETWORKS = ['polygon', 'tron', 'bnb', 'ethereum'];

function validateGlobal(global) {
  if (global == null) return null;
  if (typeof global.enabled !== 'boolean') return 'global.enabled must be a boolean';
  if (!Array.isArray(global.providers)) return 'global.providers must be an array';
  for (const p of global.providers) {
    if (!VALID_GLOBAL_PROVIDERS.includes(p.provider)) return `Invalid global provider: ${p.provider}`;
    if (!p.identifier || typeof p.identifier !== 'string') return 'Each global provider needs an identifier';
    if (p.provider === 'other' && !p.providerLabel) return 'providerLabel is required when provider is "other"';
  }
  return null;
}

function validateLocal(local) {
  if (local == null) return null;
  if (typeof local.enabled !== 'boolean') return 'local.enabled must be a boolean';
  if (local.enabled) {
    const required = ['country', 'currency', 'bankName', 'accountHolder', 'accountNumber'];
    for (const field of required) {
      if (!local[field] || typeof local[field] !== 'string') return `local.${field} is required`;
    }
  }
  return null;
}

function validateOnchain(onchain) {
  if (onchain == null) return null;
  if (typeof onchain.enabled !== 'boolean') return 'onchain.enabled must be a boolean';
  if (!Array.isArray(onchain.wallets)) return 'onchain.wallets must be an array';
  for (const w of onchain.wallets) {
    if (!VALID_NETWORKS.includes(w.network)) return `Invalid network: ${w.network}`;
    if (!w.address || typeof w.address !== 'string') return 'Each wallet needs an address';
  }
  return null;
}

/**
 * Updates the authenticated educator's payment methods configuration.
 * Accepts a partial { global?, local?, onchain? } object and merges it
 * with whatever is already stored, so the educator can update one method
 * at a time without resending the others.
 * Returns { ok: true, data: { payment_methods } } on success.
 */
async function updatePaymentMethods({ models, wallet, global, local, onchain }) {
  if (!models || !wallet) throw new TypeError('updatePaymentMethods requires { models, wallet }');
  const { Issuer } = models;

  const globalError = validateGlobal(global);
  if (globalError) return { ok: false, httpStatus: 400, message: globalError };

  const localError = validateLocal(local);
  if (localError) return { ok: false, httpStatus: 400, message: localError };

  const onchainError = validateOnchain(onchain);
  if (onchainError) return { ok: false, httpStatus: 400, message: onchainError };

  const issuer = await Issuer.findOne({ where: { wallet_address: String(wallet).toLowerCase() } });
  if (!issuer) {
    return { ok: false, httpStatus: 404, message: 'Educator profile not found' };
  }

  const current = issuer.payment_methods || {};
  const merged = {
    ...current,
    ...(global !== undefined ? { global } : {}),
    ...(local !== undefined ? { local } : {}),
    ...(onchain !== undefined ? { onchain } : {}),
  };

  issuer.payment_methods = merged;
  await issuer.save();

  return { ok: true, data: { payment_methods: issuer.payment_methods } };
}

module.exports = { updatePaymentMethods };