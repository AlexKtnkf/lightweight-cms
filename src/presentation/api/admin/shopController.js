const productRepository = require('../../../domain/shop/infrastructure/productRepository');
const orderRepository   = require('../../../domain/shop/infrastructure/orderRepository');

// ──────────────────────────────────────────────
//  Products
// ──────────────────────────────────────────────

async function listProducts(req, res, next) {
  try {
    const products = await productRepository.findAll();
    res.json(products);
  } catch (err) { next(err); }
}

async function getProduct(req, res, next) {
  try {
    const product = await productRepository.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });
    res.json(product);
  } catch (err) { next(err); }
}

async function createProduct(req, res, next) {
  try {
    const { name, description, price, currency, image_media_id, stock, active, stripe_price_id } = req.body;
    if (!name || price == null) return res.status(400).json({ error: 'name et price requis' });
    if (!Number.isInteger(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ error: 'price doit être un entier positif (centimes)' });
    }
    const product = await productRepository.create({
      name, description, price: Number(price), currency, image_media_id, stock,
      active, stripe_price_id
    });
    res.status(201).json(product);
  } catch (err) { next(err); }
}

async function updateProduct(req, res, next) {
  try {
    const product = await productRepository.update(req.params.id, req.body);
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });
    res.json(product);
  } catch (err) { next(err); }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await productRepository.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });
    await productRepository.delete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
}

// ──────────────────────────────────────────────
//  Orders
// ──────────────────────────────────────────────

async function listOrders(req, res, next) {
  try {
    const orders = await orderRepository.findAll({ status: req.query.status });
    res.json(orders);
  } catch (err) { next(err); }
}

async function getOrder(req, res, next) {
  try {
    const order = await orderRepository.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });
    res.json(order);
  } catch (err) { next(err); }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'paid', 'cancelled', 'refunded'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Statut invalide. Valeurs: ${allowed.join(', ')}` });
    }
    const order = await orderRepository.updateStatus(req.params.id, status);
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });
    res.json(order);
  } catch (err) { next(err); }
}

module.exports = {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
  listOrders, getOrder, updateOrderStatus
};
