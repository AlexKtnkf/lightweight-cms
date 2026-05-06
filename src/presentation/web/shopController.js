const Stripe = require('stripe');
const productRepository = require('../../domain/shop/infrastructure/productRepository');
const orderRepository   = require('../../domain/shop/infrastructure/orderRepository');
const logger = require('../../../utils/logger');

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return Stripe(process.env.STRIPE_SECRET_KEY);
}

// GET /boutique — product listing
async function shopIndex(req, res, next) {
  try {
    const products = await productRepository.findAll({ activeOnly: true });
    res.render('pages/shop', { products, title: 'Boutique' });
  } catch (err) { next(err); }
}

// GET /boutique/:slug — single product
async function shopProduct(req, res, next) {
  try {
    const product = await productRepository.findBySlug(req.params.slug);
    if (!product || !product.active) return next();
    res.render('pages/shop-product', { product, title: product.name });
  } catch (err) { next(err); }
}

// POST /boutique/:id/checkout — create Stripe Checkout session
async function createCheckout(req, res, next) {
  try {
    const stripe = getStripe();
    if (!stripe) return res.status(503).json({ error: 'Paiement non configuré' });

    const product = await productRepository.findById(req.params.id);
    if (!product || !product.active) return res.status(404).json({ error: 'Produit introuvable' });

    const baseUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: product.currency.toLowerCase(),
          product_data: { name: product.name, description: product.description || undefined },
          unit_amount: product.price
        },
        quantity: 1
      }],
      customer_email: req.body.email || undefined,
      success_url: `${baseUrl}/boutique/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/boutique/${product.slug}`
    });

    // Create pending order
    await orderRepository.create({
      stripe_session_id: session.id,
      status: 'pending',
      customer_email: req.body.email || null,
      line_items: [{ product_id: product.id, name: product.name, qty: 1, unit_price: product.price }],
      total_amount: product.price,
      currency: product.currency
    });

    res.json({ url: session.url });
  } catch (err) { next(err); }
}

// GET /boutique/merci — success page
async function checkoutSuccess(req, res, next) {
  try {
    const { session_id } = req.query;
    let order = null;
    if (session_id) {
      order = await orderRepository.findByStripeSession(session_id);
    }
    res.render('pages/shop-success', { order, title: 'Commande confirmée' });
  } catch (err) { next(err); }
}

// POST /boutique/webhook — Stripe webhook
async function stripeWebhook(req, res, next) {
  try {
    const stripe = getStripe();
    if (!stripe) return res.sendStatus(503);

    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,   // raw body required — see routes/index.js
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      logger.warn('Stripe webhook signature error:', err.message);
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const order = await orderRepository.findByStripeSession(session.id);
      if (order) {
        await orderRepository.updateStatus(order.id, 'paid', {
          stripe_payment_intent: session.payment_intent
        });
      }
    }

    res.json({ received: true });
  } catch (err) { next(err); }
}

module.exports = { shopIndex, shopProduct, createCheckout, checkoutSuccess, stripeWebhook };
