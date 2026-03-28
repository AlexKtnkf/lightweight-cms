const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// External deps
const https = require('https');

// Use cases
const GetPage = require('../src/domain/content/application/GetPage');
const GetPageBySlug = require('../src/domain/content/application/GetPageBySlug');
const GetArticleBySlug = require('../src/domain/content/application/GetArticleBySlug');
const ListPublishedArticles = require('../src/domain/content/application/ListPublishedArticles');

// Services and Repositories
const pageRepository = require('../src/domain/content/infrastructure/pageRepository');
const articleRepository = require('../src/domain/content/infrastructure/articleRepository');
const blockRepository = require('../src/domain/content/infrastructure/blockRepository');
const mediaRepository = require('../src/domain/media/infrastructure/mediaRepository');
const settingsRepository = require('../src/domain/settings/infrastructure/settingsRepository');
const ContactSubmissionRepository = require('../src/domain/contact/infrastructure/contactSubmissionRepository');
const EmailService = require('../src/shared/services/emailService');
const logger = require('../utils/logger');

// Instantiate use cases
const getPage = new GetPage(pageRepository, blockRepository);
const getPageBySlug = new GetPageBySlug(pageRepository, blockRepository);
const getArticleBySlug = new GetArticleBySlug(articleRepository, blockRepository);
const listPublishedArticles = new ListPublishedArticles(articleRepository);

// Instantiate services and repositories
const contactSubmissionRepository = new ContactSubmissionRepository();
const emailService = new EmailService();

/**
 * Verify Turnstile token with Cloudflare
 */
async function verifyTurnstile(token) {
  if (!process.env.TURNSTILE_SECRET_KEY) {
    logger.warn('Turnstile verification skipped: TURNSTILE_SECRET_KEY not configured');
    return true; // Allow if not configured
  }

  if (!token) {
    return false;
  }

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token
    });

    const options = {
      hostname: 'challenges.cloudflare.com',
      port: 443,
      path: '/turnstile/v0/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.success === true);
        } catch (error) {
          logger.error('Failed to parse Turnstile response:', error);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      logger.error('Turnstile verification error:', error);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Rate limiting for contact form (prevent spam)
// Allow 5 submissions per IP per 15 minutes
const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Trop de submissions depuis cette IP. Veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // Don't rate limit if email service is not configured
    if (!emailService.isReady()) {
      return false;
    }
    return false;
  },
});

// Public API routes (no auth required)
router.get('/articles', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const articles = await listPublishedArticles.execute({ limit, offset });
    res.json(articles);
  } catch (error) {
    next(error);
  }
});

router.get('/articles/:slug', async (req, res, next) => {
  try {
    const article = await getArticleBySlug.execute(req.params.slug);
    res.json(article);
  } catch (error) {
    next(error);
  }
});

router.get('/pages', async (req, res, next) => {
  try {
    const pages = await pageRepository.findAll();
    res.json(pages);
  } catch (error) {
    next(error);
  }
});

router.get('/pages/:slug', async (req, res, next) => {
  try {
    const page = await getPageBySlug.execute(req.params.slug);
    res.json(page);
  } catch (error) {
    next(error);
  }
});

router.get('/homepage', async (req, res, next) => {
  try {
    // Homepage is now page id 1
    const homepage = await getPage.execute(1);
    res.json(homepage);
  } catch (error) {
    next(error);
  }
});

// Media API - serve media files
router.get('/media/:id', async (req, res, next) => {
  try {
    const media = await mediaRepository.findById(parseInt(req.params.id));
    if (!media) {
      return res.status(404).json({ error: 'Fichier introuvable' });
    }
    const filePath = path.join(__dirname, '../public', media.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier introuvable' });
    }
    
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    next(error);
  }
});

/**
 * Contact Form Submission Endpoint
 * POST /api/contact/submit
 * Body: { fields: [{label, value}, ...], email?, name? }
 */
router.post(
  '/contact/submit',
  contactFormLimiter,
  [
    body('fields').isArray().notEmpty(),
    body('email').if(body('email').exists()).isEmail().normalizeEmail(),
  ],
  async (req, res, next) => {
    try {
      // Enforce Turnstile when server-side verification is configured
      const turnstileToken = typeof req.body.turnstileToken === 'string'
        ? req.body.turnstileToken.trim()
        : '';
      if (process.env.TURNSTILE_SECRET_KEY) {
        const isTurnstileValid = await verifyTurnstile(turnstileToken);
        if (!isTurnstileValid) {
          return res.status(400).json({
            success: false,
            message: 'Vérification échouée. Veuillez réessayer.'
          });
        }
      }

      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Données invalides',
          errors: errors.array() 
        });
      }

      const { fields, email, name } = req.body;

      // Validate fields structure
      if (!Array.isArray(fields) || fields.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Au moins un champ est requis' 
        });
      }

      // Get visitor IP
      const visitor_ip = req.ip || req.connection.remoteAddress || 'unknown';

      // Get admin email from settings
      const settings = await settingsRepository.get();
      const recipientEmail = process.env.CONTACT_EMAIL_TO || settings?.contact_email;

      if (!recipientEmail) {
        logger.warn('Contact form submitted but no recipient email configured');
        return res.status(500).json({ 
          success: false, 
          message: 'Le service de contact n\'est pas disponible pour le moment' 
        });
      }

      // Prepare form data
      const formData = {
        fields: fields.map(f => ({
          label: f.label || 'Champ',
          value: f.value || ''
        })),
        email: email || null,
        name: name || null,
        ip: visitor_ip,
      };

      // Store submission in database
      const submission = await contactSubmissionRepository.create({
        form_data: formData,
        visitor_email: email,
        visitor_ip,
      });

      logger.info(`Contact form submitted (ID: ${submission.id})`);

      // Send admin email asynchronously (don't block response)
      if (emailService.isReady()) {
        emailService.sendContactFormEmail(formData, recipientEmail)
          .then(() => {
            logger.info(`Admin notification sent for submission ${submission.id}`);
          })
          .catch(error => {
            logger.error(`Failed to send admin notification for submission ${submission.id}:`, error.message);
          });

        // Send confirmation email to visitor (async, don't block)
        if (email && process.env.SEND_CONFIRMATION_EMAIL !== 'false') {
          emailService.sendConfirmationEmail(email, name)
            .catch(error => {
              logger.warn(`Failed to send confirmation email to ${email}:`, error.message);
            });
        }
      } else {
        logger.warn('Email service not configured - submission stored but no emails sent');
      }

      res.json({ 
        success: true, 
        message: 'Merci ! Votre message a bien été reçu.',
        submissionId: submission.id 
      });

    } catch (error) {
      logger.error('Error processing contact form:', error);
      
      // Specific error handling
      if (error.code === 'EMAIL_NOT_CONFIGURED') {
        return res.status(503).json({ 
          success: false, 
          message: 'Le service de contact n\'est pas disponible pour le moment' 
        });
      }

      res.status(500).json({ 
        success: false, 
        message: 'Une erreur s\'est produite. Veuillez réessayer.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * Email Configuration Verification (admin only)
 * GET /api/email/verify
 */
router.get('/email/verify', async (req, res) => {
  // Only allow in development or with auth
  if (process.env.NODE_ENV === 'production' && !(req.session && req.session.userId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await emailService.verifyConfiguration();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
