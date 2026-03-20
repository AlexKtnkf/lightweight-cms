/**
 * Email Service
 * Handles SMTP configuration and email sending with robust error handling
 */

const nodemailer = require('nodemailer');
const logger = require('../../../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.config = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    // Validate configuration
    if (this.config.host && this.config.auth.user && this.config.auth.pass) {
      this.initializeTransporter();
    } else {
      logger.warn('Email service not fully configured. Check SMTP_HOST, SMTP_USER, SMTP_PASS env vars.');
    }
  }

  /**
   * Initialize the email transporter with error handling
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport(this.config);
      this.isConfigured = true;
      logger.info(`Email service initialized (${this.config.host}:${this.config.port})`);
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Check if email service is configured
   */
  isReady() {
    return this.isConfigured && this.transporter;
  }

  /**
   * Send contact form submission email with retry logic
   * @param {Object} formData - { email, name, message, fields: [...] }
   * @param {string} recipientEmail - Admin email to send to
   * @param {number} retries - Number of retry attempts
   */
  async sendContactFormEmail(formData, recipientEmail, retries = 3) {
    if (!this.isReady()) {
      const error = new Error('Email service not configured');
      error.code = 'EMAIL_NOT_CONFIGURED';
      throw error;
    }

    if (!recipientEmail) {
      const error = new Error('No recipient email specified');
      error.code = 'NO_RECIPIENT';
      throw error;
    }

    const htmlContent = this.buildContactFormHtml(formData);
    const textContent = this.buildContactFormText(formData);

    const mailOptions = {
      from: `"${process.env.CONTACT_EMAIL_FROM_NAME || 'Contact Form'}" <${process.env.CONTACT_EMAIL_FROM || process.env.SMTP_USER}>`,
      to: recipientEmail,
      replyTo: formData.email || undefined,
      subject: `Nouveau message de contact${formData.name ? ` de ${formData.name}` : ''}`,
      html: htmlContent,
      text: textContent,
    };

    // Retry logic with exponential backoff
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const result = await this.transporter.sendMail(mailOptions);
        logger.info(`Contact form email sent successfully (attempt ${attempt + 1}): ${result.messageId}`);
        return result;
      } catch (error) {
        logger.warn(`Email sending failed (attempt ${attempt + 1}/${retries}): ${error.message}`);

        // Don't retry on permanent errors
        if (this.isPermanentError(error)) {
          error.retryable = false;
          throw error;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < retries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          error.retryable = true;
          throw error;
        }
      }
    }
  }

  /**
   * Send confirmation email to visitor (optional)
   */
  async sendConfirmationEmail(visitorEmail, visitorName) {
    if (!this.isReady()) {
      logger.warn('Confirmation email not sent - email service not configured');
      return null;
    }

    const mailOptions = {
      from: `"${process.env.CONTACT_EMAIL_FROM_NAME || process.env.SITE_TITLE || 'Contact'}" <${process.env.CONTACT_EMAIL_FROM || process.env.SMTP_USER}>`,
      to: visitorEmail,
      subject: 'Votre message a bien été reçu',
      html: `
        <h2>Merci ${visitorName || 'de votre message'}</h2>
        <p>Nous avons bien reçu votre message et nous vous recontacterons au plus tôt.</p>
        <p>Cordialement</p>
      `,
      text: `Merci de votre message. Nous vous recontacterons au plus tôt.`,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Confirmation email sent to ${visitorEmail}`);
      return result;
    } catch (error) {
      logger.warn(`Failed to send confirmation email to ${visitorEmail}: ${error.message}`);
      // Don't throw - confirmation email failure shouldn't block main submission
      return null;
    }
  }

  /**
   * Build HTML email content
   */
  buildContactFormHtml(formData) {
    const fields = formData.fields || [];
    const fieldsHtml = fields
      .map(f => `<p><strong>${f.label}:</strong><br>${this.escapeHtml(f.value)}</p>`)
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
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #007bff; }
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
   * Build plain text email content
   */
  buildContactFormText(formData) {
    const fields = formData.fields || [];
    const fieldsText = fields.map(f => `${f.label}:\n${f.value}`).join('\n\n');

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
   * Check if error is permanent (shouldn't retry)
   */
  isPermanentError(error) {
    // Permanent SMTP errors
    const permanentCodes = ['ENOTFOUND', 'EINVAL', 'ERR_INVALID_ARG_TYPE'];
    if (permanentCodes.includes(error.code)) return true;

    // Check for permanent SMTP status codes (4xx client errors)
    if (error.message && error.message.match(/^Invalid (email|login|credentials|response)/) ) {
      return true;
    }

    return false;
  }

  /**
   * Escape HTML to prevent injection
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
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Verify transporter configuration with test email
   */
  async verifyConfiguration() {
    if (!this.transporter) {
      return { success: false, error: 'Transporter not initialized' };
    }

    try {
      await this.transporter.verify();
      logger.info('Email configuration verified successfully');
      return { success: true };
    } catch (error) {
      logger.error('Email configuration verification failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;
