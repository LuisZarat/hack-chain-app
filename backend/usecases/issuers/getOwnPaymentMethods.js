/**
 * Returns the authenticated educator's own payment methods configuration.
 * Returns { ok: true, data: { payment_methods } } on success.
 */
async function getOwnPaymentMethods({ models, wallet }) {
  if (!models || !wallet) throw new TypeError('getOwnPaymentMethods requires { models, wallet }');
  const { Issuer } = models;

  const issuer = await Issuer.findOne({
    where: { wallet_address: String(wallet).toLowerCase() },
    attributes: ['payment_methods'],
  });

  if (!issuer) {
    return { ok: false, httpStatus: 404, message: 'Educator profile not found' };
  }

  return { ok: true, data: { payment_methods: issuer.payment_methods || null } };
}

module.exports = { getOwnPaymentMethods };