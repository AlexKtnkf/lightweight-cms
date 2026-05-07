/**
 * Shared singleton EmailService instance.
 * Import this instead of instantiating EmailService directly.
 */
const EmailService = require('./emailService');

module.exports = new EmailService();
