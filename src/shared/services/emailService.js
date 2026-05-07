/**
 * Email Service
 * Sends transactional emails through the Resend HTTPS API.
 */

const { Resend } = require('resend');
const logger = require('../../../utils/logger');

class EmailService {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    this.config = {
      apiKey: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim() : '',
      fromAddress: process.env.CONTACT_EMAIL_FROM ? process.env.CONTACT_EMAIL_FROM.trim() : '',
      fromName: process.env.CONTACT_EMAIL_FROM_NAME ? process.env.CONTACT_EMAIL_FROM_NAME.trim() : '',
    };

    if (this.config.apiKey && this.config.fromAddress) {
      this.initializeClient();
    } else {
      const missing = [];
      if (!this.config.apiKey) missing.push('RESEND_API_KEY');
      if (!this.config.fromAddress) missing.push('CONTACT_EMAIL_FROM');
      logger.warn(`Email service not fully configured. Missing: ${missing.join(', ')}`);
    }
  }

  /**
   * Initialize the Resend client.
   */
  initializeClient() {
    try {
      this.client = new Resend(this.config.apiKey);
      this.isConfigured = true;
      logger.info('Email service initialized (Resend)');
      setImmediate(() => {
        this.verifyConfiguration().then((result) => {
          if (result.success) {
            logger.info(`Resend verification succeeded for ${result.senderDomain || 'configured sender domain'}`);
          } else {
            logger.warn(`Resend verification failed: ${result.error}`);
          }
        }).catch((error) => {
          logger.warn(`Resend verification threw an unexpected error: ${error.message}`);
        });
      });
    } catch (error) {
      logger.error('Failed to initialize Resend client:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Check if the service is ready.
   */
  isReady() {
    return this.isConfigured && this.client;
  }

  /**
   * Send contact form submission email with retry logic.
   * @param {Object} formData - { email, name, message, fields: [...] }
   * @param {string} recipientEmail - Admin email to send to
   * @param {number} retries - Number of retry attempts
   */
  async sendContactFormEmail(formData, recipientEmail, retries = 3) {
    if (!this.isReady()) {
      const error = new Error('Service de messagerie non configuré');
      error.code = 'EMAIL_NOT_CONFIGURED';
      throw error;
    }

    if (!recipientEmail) {
      const error = new Error('Aucun destinataire spécifié');
      error.code = 'NO_RECIPIENT';
      throw error;
    }

    const htmlContent = this.buildContactFormHtml(formData);
    const textContent = this.buildContactFormText(formData);

    const payload = {
      from: this.formatFromAddress('Contact Form'),
      to: [recipientEmail],
      replyTo: formData.email || undefined,
      subject: `Nouveau message de contact${formData.name ? ` de ${formData.name}` : ''}`,
      html: htmlContent,
      text: textContent,
    };

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        logger.info(`Sending admin notification email via Resend to ${recipientEmail} (attempt ${attempt + 1}/${retries})`);
        const result = await this.sendEmail(payload);
        logger.info(`Email de formulaire de contact envoyé avec succès (tentative ${attempt + 1}): ${result.id}`);
        return result;
      } catch (error) {
        logger.warn(`Échec de l'envoi de l'email (tentative ${attempt + 1}/${retries}): ${error.message}`);

        if (this.isPermanentError(error)) {
          error.retryable = false;
          throw error;
        }

        if (attempt < retries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          error.retryable = true;
          throw error;
        }
      }
    }
  }

  /**
   * Send confirmation email to visitor (optional).
   */
  async sendConfirmationEmail(visitorEmail, visitorName) {
    if (!this.isReady()) {
      logger.warn('Email de confirmation non envoyé - service de messagerie non configuré');
      return null;
    }

    const payload = {
      from: this.formatFromAddress(process.env.SITE_TITLE || 'Contact'),
      to: [visitorEmail],
      subject: 'Votre message a bien été reçu',
      html: `
        <h2>Merci ${this.escapeHtml(visitorName || 'de votre message')}</h2>
        <p>J'ai bien reçu votre message et je vous recontacterai au plus tôt.</p>
        <p>Cordialement</p>
      `,
      text: 'Merci de votre message. Je vous recontacterai au plus tôt.',
    };

    try {
      logger.info(`Sending confirmation email via Resend to ${visitorEmail}`);
      const result = await this.sendEmail(payload);
      logger.info(`Email de confirmation envoyé à ${visitorEmail}: ${result.id}`);
      return result;
    } catch (error) {
      logger.warn(`Échec de l'envoi de l'email de confirmation à ${visitorEmail}: ${error.message}`);
      return null;
    }
  }

  /**
   * Build HTML email content.
   */
  buildContactFormHtml(formData) {
    const fields = formData.fields || [];
    const fieldsHtml = fields
      .map((f) => `<p><strong>${this.escapeHtml(f.label)}:</strong><br>${this.escapeHtml(f.value)}</p>`)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            header { border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
            .content { background-color: white; padding: 20px; border-radius: 5px; }
            .value { white-space: pre-wrap; word-break: break-word; }
            footer { font-size: 12px; color: #666; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <header>
              <h2>Nouveau message de contact</h2>
            </header>
            <div class="content">
              ${fieldsHtml}
              ${formData.email ? `<p><strong>Email du visiteur:</strong> <a href="mailto:${this.escapeHtml(formData.email)}">${this.escapeHtml(formData.email)}</a></p>` : ''}
              ${formData.ip ? `<p style="font-size: 12px; color: #999;"><strong>IP:</strong> ${this.escapeHtml(formData.ip)}</p>` : ''}
            </div>
            <footer>
              <p>Message envoyé depuis le formulaire de contact de votre site.</p>
              <p>Timestamp: ${new Date().toLocaleString('fr-FR')}</p>
            </footer>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Build plain text email content.
   */
  buildContactFormText(formData) {
    const fields = formData.fields || [];
    const fieldsText = fields.map((f) => `${f.label}:\n${f.value}`).join('\n\n');

    return `
NOUVEAU MESSAGE DE CONTACT
==========================

${fieldsText}

${formData.email ? `Email du visiteur: ${formData.email}\n` : ''}
${formData.ip ? `IP: ${formData.ip}\n` : ''}

Message envoyé depuis le formulaire de contact
Timestamp: ${new Date().toLocaleString('fr-FR')}
    `.trim();
  }

  /**
   * Send a single email through Resend.
   */
  async sendEmail(payload) {
    const result = await this.client.emails.send(payload);

    if (result.error) {
      const error = new Error(result.error.message || 'Resend email send failed');
      error.code = result.error.name || 'resend_error';
      error.statusCode = result.error.statusCode || null;
      throw error;
    }

    return result.data;
  }

  /**
   * Check if an error should not be retried.
   */
  isPermanentError(error) {
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500 && error.code !== 'rate_limit_exceeded') {
      return true;
    }

    const permanentCodes = new Set([
      'missing_api_key',
      'invalid_api_key',
      'restricted_api_key',
      'validation_error',
      'invalid_from_address',
      'invalid_access',
      'invalid_parameter',
      'missing_required_field',
      'daily_quota_exceeded',
      'monthly_quota_exceeded',
    ]);

    return permanentCodes.has(error.code);
  }

  /**
   * Escape HTML to prevent injection.
   */
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Verify Resend configuration and the sender domain.
   */
  async verifyConfiguration() {
    if (!this.isReady()) {
      return { success: false, error: 'Resend client not initialized' };
    }

    try {
      const senderDomain = this.getSenderDomain();
      if (!senderDomain) {
        return { success: false, error: 'CONTACT_EMAIL_FROM must contain a valid email address' };
      }

      const result = await this.client.domains.list();
      if (result.error) {
        logger.error('Resend configuration verification failed:', result.error.message);
        return { success: false, error: result.error.message };
      }

      const domains = Array.isArray(result.data?.data) ? result.data.data : [];
      const verifiedDomain = domains.find((domain) =>
        domain.status === 'verified' && this.matchesSenderDomain(senderDomain, domain.name)
      );

      if (!verifiedDomain) {
        const availableDomains = domains
          .map((domain) => `${domain.name} (${domain.status})`)
          .join(', ');

        return {
          success: false,
          error: availableDomains
            ? `No verified Resend domain matches ${senderDomain}. Available domains: ${availableDomains}`
            : `No Resend domains found for sender domain ${senderDomain}`,
          senderDomain,
        };
      }

      logger.info(`Resend configuration verified successfully for ${senderDomain}`);
      return { success: true, senderDomain, verifiedDomain: verifiedDomain.name };
    } catch (error) {
      logger.error('Resend configuration verification failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  formatFromAddress(fallbackName) {
    const displayName = this.escapeHeaderValue(this.config.fromName || fallbackName || 'Contact');
    return displayName
      ? `"${displayName}" <${this.config.fromAddress}>`
      : this.config.fromAddress;
  }

  escapeHeaderValue(value) {
    return String(value || '').replace(/["\\\r\n]/g, '').trim();
  }

  getSenderDomain() {
    const parts = this.config.fromAddress.split('@');
    if (parts.length !== 2 || !parts[1]) {
      return null;
    }
    return parts[1].toLowerCase();
  }

  matchesSenderDomain(senderDomain, verifiedDomain) {
    const normalizedVerifiedDomain = String(verifiedDomain || '').toLowerCase();
    return senderDomain === normalizedVerifiedDomain || senderDomain.endsWith(`.${normalizedVerifiedDomain}`);
  }

  /**
   * Send an order notification to the admin.
   * @param {Object} order - Parsed order object (id, customer_email, customer_name, line_items, total_amount, currency)
   * @param {string} adminEmail
   */
  async sendOrderNotification(order, adminEmail) {
    if (!this.isReady()) {
      logger.warn('Admin order notification not sent — email service not configured');
      return null;
    }
    if (!adminEmail) {
      logger.warn('Admin order notification not sent — ADMIN_EMAIL not configured');
      return null;
    }

    const itemsHtml = (order.line_items || [])
      .map(i => `<li>${this.escapeHtml(i.name)} × ${i.qty ?? 1} — ${((i.unit_price ?? 0) / 100).toFixed(2)} ${this.escapeHtml(i.currency || order.currency || 'EUR')}</li>`)
      .join('');

    const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333">
      <h2>Nouvelle commande #${order.id}</h2>
      <p><strong>Client :</strong> ${this.escapeHtml(order.customer_name || '')} &lt;${this.escapeHtml(order.customer_email || '')}&gt;</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Total :</strong> ${((order.total_amount ?? 0) / 100).toFixed(2)} ${this.escapeHtml(order.currency || 'EUR')}</p>
    </body></html>`;

    const text = `Nouvelle commande #${order.id}\nClient : ${order.customer_name || ''} <${order.customer_email || ''}>\nTotal : ${((order.total_amount ?? 0) / 100).toFixed(2)} ${order.currency || 'EUR'}`;

    try {
      const result = await this.sendEmail({
        from: this.formatFromAddress(process.env.SITE_TITLE || 'Boutique'),
        to: [adminEmail],
        subject: `Nouvelle commande #${order.id}`,
        html,
        text,
      });
      logger.info(`Admin order notification sent (order #${order.id}): ${result.id}`);
      return result;
    } catch (err) {
      logger.warn(`Admin order notification failed (order #${order.id}): ${err.message}`);
      return null;
    }
  }

  /**
   * Send a booking notification to the admin.
   * @param {Object} booking - { id, customer_name, customer_email, start_at }
   * @param {string} serviceName
   * @param {string} adminEmail
   */
  async sendBookingNotification(booking, serviceName, adminEmail) {
    if (!this.isReady()) {
      logger.warn('Admin booking notification not sent — email service not configured');
      return null;
    }
    if (!adminEmail) {
      logger.warn('Admin booking notification not sent — ADMIN_EMAIL not configured');
      return null;
    }

    const when = booking.start_at ? new Date(booking.start_at).toLocaleString('fr-FR') : '—';
    const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333">
      <h2>Nouvelle réservation #${booking.id}</h2>
      <p><strong>Service :</strong> ${this.escapeHtml(serviceName || '')}</p>
      <p><strong>Client :</strong> ${this.escapeHtml(booking.customer_name || '')} &lt;${this.escapeHtml(booking.customer_email || '')}&gt;</p>
      <p><strong>Date :</strong> ${this.escapeHtml(when)}</p>
      ${booking.notes ? `<p><strong>Notes :</strong> ${this.escapeHtml(booking.notes)}</p>` : ''}
    </body></html>`;

    const text = `Nouvelle réservation #${booking.id}\nService : ${serviceName || ''}\nClient : ${booking.customer_name || ''} <${booking.customer_email || ''}>\nDate : ${when}`;

    try {
      const result = await this.sendEmail({
        from: this.formatFromAddress(process.env.SITE_TITLE || 'Agenda'),
        to: [adminEmail],
        subject: `Nouvelle réservation — ${serviceName || ''} le ${when}`,
        html,
        text,
      });
      logger.info(`Admin booking notification sent (booking #${booking.id}): ${result.id}`);
      return result;
    } catch (err) {
      logger.warn(`Admin booking notification failed (booking #${booking.id}): ${err.message}`);
      return null;
    }
  }
}

module.exports = EmailService;
