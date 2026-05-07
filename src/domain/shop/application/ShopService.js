class ShopService {
  constructor(productRepository, orderRepository, transactionManager) {
    this.productRepository = productRepository;
    this.orderRepository = orderRepository;
    this.transactionManager = transactionManager;
  }

  async listProducts({ activeOnly = false } = {}) {
    return this.productRepository.findAll({ activeOnly });
  }

  async getProductById(id) {
    return this.productRepository.findById(id);
  }

  async getProductBySlug(slug) {
    return this.productRepository.findBySlug(slug);
  }

  async createProduct(data) {
    return this.productRepository.create(data);
  }

  async updateProduct(id, data) {
    return this.productRepository.update(id, data);
  }

  async deleteProduct(id) {
    return this.productRepository.delete(id);
  }

  async createPendingOrder(data) {
    return this.orderRepository.create(data);
  }

  async getOrderById(id) {
    return this.orderRepository.findById(id);
  }

  async getOrderByStripeSession(sessionId) {
    return this.orderRepository.findByStripeSession(sessionId);
  }

  async listOrders({ status } = {}) {
    return this.orderRepository.findAll({ status });
  }

  async updateOrderStatus(id, status) {
    return this.orderRepository.updateStatus(id, status);
  }

  async finalizeCheckoutSession(stripeSessionId, paymentIntent) {
    return this.transactionManager.run(async () => {
      const order = await this.orderRepository.findByStripeSession(stripeSessionId);
      if (!order) return null;
      if (order.status === 'paid') return order;

      const updated = await this.orderRepository.updateStatus(order.id, 'paid', {
        stripe_payment_intent: paymentIntent
      });

      const lineItems = order.line_items || [];
      for (const item of lineItems) {
        if (item.product_id) {
          await this.productRepository.decrementStock(item.product_id, item.qty ?? 1);
        }
      }

      return updated;
    });
  }
}

module.exports = ShopService;
