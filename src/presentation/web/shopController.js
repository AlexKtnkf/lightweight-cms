const Stripe = require('stripe');
const logger = require('../../../utils/logger');

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return Stripe(process.env.STRIPE_SECRET_KEY);
}

class ShopController {
  constructor(shopService, emailService) {
    this.shopService = shopService;
    this.emailService = emailService;
  }

  // GET /boutique — product listing
  async shopIndex(req, res, next) {
    try {
      const products = await this.shopService.listProducts({ activeOnly: true });
      res.render('pages/shop', { products, title: 'Boutique' });
    } catch (err) { next(err); }
  }

  // GET /boutique/:slug — single product
  async shopProduct(req, res, next) {
    try {
      const product = await this.shopService.getProductBySlug(req.params.slug);
      if (!product || !product.active) return next();
      res.render('pages/shop-product', { product, title: product.name });
    } catch (err) { next(err); }
  }

  // POST /boutique/:id/checkout — create Stripe Checkout session
  async createCheckout(req, res, next) {
    try {
      const stripe = getStripe();
      if (!stripe) return res.status(503).json({ error: 'Paiement non configuré' });

      const product = await this.shopService.getProductById(req.params.id);
      if (!product || !product.active) return res.status(404).json({ error: 'Produit introuvable' });

      // stock === null means unlimited; stock === 0 means sold out
      if (product.stock !== null && product.stock <= 0) {
        return res.status(409).json({ error: 'Ce produit est épuisé' });
      }

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

      await this.shopService.createPendingOrder({
        stripe_session_id: session.id,
        status: 'pending',
        customer_email: req.body.email || null,
        line_items: [{ product_id: product.id, name: product.name, qty: 1, unit_price: product.price }],
        total_amount: product.price,
        currency: product.currency
      });

      // Store the session_id in the visitor's session so the success page can
      // verify ownership without exposing order data to arbitrary visitors.
      req.session.stripeSessionId = session.id;

      res.json({ url: session.url });
    } catch (err) { next(err); }
  }

  // GET /boutique/merci — success page
  // Only shows order details when the session_id in the query matches the one
  // stored server-side in the visitor's session (set at checkout creation).
  async checkoutSuccess(req, res, next) {
    try {
      const { session_id } = req.query;
      let order = null;

      if (session_id && req.session.stripeSessionId === session_id) {
        // Clear so a refresh or shared link no longer reveals order data
        delete req.session.stripeSessionId;
        order = await this.shopService.getOrderByStripeSession(session_id);
      }

      res.render('pages/shop-success', { order, title: 'Commande confirmée' });
    } catch (err) { next(err); }
  }

  // POST /boutique/webhook — Stripe webhook
  async stripeWebhook(req, res, next) {
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
        const order = await this.shopService.finalizeCheckoutSession(
          session.id,
          session.payment_intent
        );

        if (order) {
          // Fire-and-forget admin notification
          this.emailService.sendOrderNotification(order, process.env.ADMIN_EMAIL).catch(() => {});
        }
      }

      res.json({ received: true });
    } catch (err) { next(err); }
  }
}

module.exports = ShopController;
