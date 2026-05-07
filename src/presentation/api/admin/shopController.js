class AdminShopController {
  constructor(shopService) {
    this.shopService = shopService;
  }

  // ──────────────────────────────────────────────
  //  Products
  // ──────────────────────────────────────────────

  async listProducts(req, res, next) {
    try {
      const products = await this.shopService.listProducts();
      res.json(products);
    } catch (err) { next(err); }
  }

  async getProduct(req, res, next) {
    try {
      const product = await this.shopService.getProductById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Produit introuvable' });
      res.json(product);
    } catch (err) { next(err); }
  }

  async createProduct(req, res, next) {
    try {
      const { name, description, price, currency, image_media_id, stock, active, stripe_price_id } = req.body;
      if (!name || price == null) return res.status(400).json({ error: 'name et price requis' });
      if (!Number.isInteger(Number(price)) || Number(price) < 0) {
        return res.status(400).json({ error: 'price doit être un entier positif (centimes)' });
      }
      const product = await this.shopService.createProduct({
        name, description, price: Number(price), currency, image_media_id, stock,
        active, stripe_price_id
      });
      res.status(201).json(product);
    } catch (err) { next(err); }
  }

  async updateProduct(req, res, next) {
    try {
      const product = await this.shopService.updateProduct(req.params.id, req.body);
      if (!product) return res.status(404).json({ error: 'Produit introuvable' });
      res.json(product);
    } catch (err) { next(err); }
  }

  async deleteProduct(req, res, next) {
    try {
      const product = await this.shopService.getProductById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Produit introuvable' });
      await this.shopService.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (err) { next(err); }
  }

  // ──────────────────────────────────────────────
  //  Orders
  // ──────────────────────────────────────────────

  async listOrders(req, res, next) {
    try {
      const orders = await this.shopService.listOrders({ status: req.query.status });
      res.json(orders);
    } catch (err) { next(err); }
  }

  async getOrder(req, res, next) {
    try {
      const order = await this.shopService.getOrderById(req.params.id);
      if (!order) return res.status(404).json({ error: 'Commande introuvable' });
      res.json(order);
    } catch (err) { next(err); }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const { status } = req.body;
      const allowed = ['pending', 'paid', 'cancelled', 'refunded'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ error: `Statut invalide. Valeurs: ${allowed.join(', ')}` });
      }
      const order = await this.shopService.updateOrderStatus(req.params.id, status);
      if (!order) return res.status(404).json({ error: 'Commande introuvable' });
      res.json(order);
    } catch (err) { next(err); }
  }
}

module.exports = AdminShopController;
