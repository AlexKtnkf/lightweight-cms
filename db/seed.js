/**
 * Comprehensive Database Seeding Script
 * 
 * Combines initialization and seeding of:
 * - Homepage page (page id=1)
 * - Site settings (title, menus, branding)
 * - Homepage content blocks (hero, sections, FAQ, contact form)
 * - Logo media file
 * 
 * Run: npm run seed
 */

const db = require('../src/infrastructure/database/database');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

const CONTENT_TYPE = 'page';
const HOMEPAGE_ID = 1;
const LOGO_PATH = path.join(__dirname, '../public/media/logo.svg');
const LOGO_FILENAME = 'logo.svg';
const LOGO_ORIGINAL_FILENAME = 'logo.svg';
const LOGO_MIME_TYPE = 'image/svg+xml';
const LOGO_STORAGE_PATH = 'media/logo.svg';

// Site settings (customizable for each deployment)
const SETTINGS = {
  site_title: 'Adeline Hage | Diététique',
  site_tagline: 'Diététique, Psychologie & Plaisir',
  header_menu_links: [
    { label: 'Mon approche', url: '#approche', order: 0 },
    { label: 'Infos pratiques', url: '#accompagnement', order: 1 },
    { label: 'RDV Doctolib', url: 'https://www.doctolib.fr/dieteticien/lille/adeline-hage', order: 2 }
  ],
  footer_text: '© Adeline Hage',
  social_links: [
    { platform: 'instagram', url: 'https://www.instagram.com/adeline.mindandmeal', icon: 'instagram' },
    { platform: 'linkedin', url: 'https://fr.linkedin.com/in/adeline-hage-826391102', icon: 'linkedin' },
    { platform: 'facebook', url: 'https://www.facebook.com/dieteticiennelille/', icon: 'facebook' },
  ],
};

// Homepage page metadata
const HOMEPAGE_PAGE = {
  title: 'Adeline Hage | Diététique',
  slug: 'homepage',
  published: true,
  meta_title: 'Adeline Hage | Diététique',
  meta_description: 'Retrouvez la paix avec votre corps et votre assiette. Méthode scientifique et bienveillante.',
};

// Homepage content blocks
const BLOCKS = [
  {
    block_type: 'hero',
    block_order: 0,
    block_data: {
      tagline: 'Diététique & Psychologie TCC',
      title: 'Retrouvez la paix avec votre corps et votre assiette.',
      texteBoutonPrincipal: 'Réserver mon bilan',
      urlBoutonPrincipal: '#contact',
      texteBoutonSecondaire: 'Ma philosophie',
      urlBoutonSecondaire: '#approche',
    },
  },
  {
    block_type: 'accroche',
    block_order: 1,
    block_data: {
      title: 'Une méthode scientifique ancrée dans la bienveillance.',
      content: "<p>J'allie les neurosciences et la sociologie pour vous libérer des cycles de restriction et de culpabilité.</p>",
    },
  },
  {
    block_type: 'encart_principal',
    block_order: 2,
    block_data: {
      image_id: null,
      titre: "L'art de savourer, enfin.",
      texte: "<p>Spécialisée dans les troubles alimentaires, je vous aide à déconstruire les mécanismes psychologiques qui dictent vos comportements. On ne soigne pas le poids, on soigne la relation à soi.</p>",
      url: '#',
      lien: 'Consulter mon cursus',
    },
  },
  {
    block_type: 'numbered_cards',
    block_order: 3,
    block_data: {
      section_title: 'Le parcours de soin',
      cards: [
        { number: '01', title: 'Exploration émotionnelle', description: "Comprendre l'origine de vos comportements et vos schémas cognitifs." },
        { number: '02', title: 'Réglage biologique', description: 'Réapprendre à écouter les signaux de faim et de satiété naturelle.' },
        { number: '03', title: 'Liberté durable', description: 'Vivre sans règles rigides tout en honorant votre santé globale.' },
      ],
    },
  },
  {
    block_type: 'pin_grid',
    block_order: 4,
    block_data: {
      section_title: 'Inspirations & Cabinet',
      pins: [
        { image_media_id: null, label: "L'écoute du corps." },
        { image_media_id: null, label: "La couleur dans l'assiette." },
        { image_media_id: null, label: 'Un espace sécurisant.' },
      ],
    },
  },
  {
    block_type: 'rich_text',
    block_order: 5,
    block_data: {
      richText: [
        '<h2>Sortir de la dictature du "manger propre"</h2>',
        '<p>L\'orthorexie est devenue un mal invisible de notre siècle. À force de vouloir optimiser chaque calorie pour la santé, on finit par en perdre la santé mentale. Mes recherches montrent que...</p>',
        '<p>Dans ce processus, nous utilisons des outils de <strong>Thérapie Cognitive et Comportementale (TCC)</strong> pour flexibiliser ces règles rigides.</p>',
      ].join('\n'),
    },
  },
  {
    block_type: 'lead_magnet',
    block_order: 6,
    block_data: {
      title: 'Ma Masterclass Offerte',
      description: '7 jours pour apaiser votre rapport à l\'alimentation.',
      placeholder: 'Votre email',
      button_text: "S'inscrire",
      action_url: '#',
    },
  },
  {
    block_type: 'accroche',
    block_order: 7,
    block_data: {
      title: 'Questions fréquentes',
      content: '',
      section_id: 'faq',
    },
  },
  {
    block_type: 'question_reponse',
    block_order: 8,
    block_data: {
      question: 'Proposez-vous des consultations à distance ?',
      reponse: 'Oui, je consulte en visioconférence pour les patients francophones du monde entier.',
    },
  },
  {
    block_type: 'question_reponse',
    block_order: 9,
    block_data: {
      question: 'Est-ce adapté pour une perte de poids ?',
      reponse: 'Mon approche vise le "poids de forme" : celui où votre corps est en santé sans effort mental épuisant.',
    },
  },
  {
    block_type: 'contact_form',
    block_order: 10,
    block_data: {
      title: 'Entrons en contact',
      fields: [
        { type: 'text', label: 'Nom complet', placeholder: 'Votre nom', required: true },
        { type: 'email', label: 'Email', placeholder: 'votre@email.com', required: true },
        { type: 'textarea', label: 'Votre message', placeholder: 'Comment puis-je vous aider ?', required: false },
      ],
      submit_button_text: 'Envoyer ma demande',
      action_url: '#',
    },
  },
];

/**
 * Seed or update site settings
 */
async function seedSettings() {
  const headerLinks = JSON.stringify(SETTINGS.header_menu_links);
  const footerLinks = JSON.stringify([]);
  const socialLinks = JSON.stringify(SETTINGS.social_links);

  const existing = await db.get('SELECT id FROM settings WHERE id = 1');
  
  if (existing) {
    await db.run(
      `UPDATE settings SET
        site_title = ?, site_tagline = ?, header_menu_links = ?,
        footer_menu_links = ?, footer_text = ?, social_links = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = 1`,
      [
        SETTINGS.site_title,
        SETTINGS.site_tagline || null,
        headerLinks,
        footerLinks,
        SETTINGS.footer_text || null,
        socialLinks,
      ]
    );
    logger.info('✓ Settings updated');
  } else {
    await db.run(
      `INSERT INTO settings (id, site_title, site_tagline, logo_media_id, header_menu_links, footer_menu_links, footer_text, social_links, updated_at)
       VALUES (1, ?, ?, NULL, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [SETTINGS.site_title, SETTINGS.site_tagline || null, headerLinks, footerLinks, SETTINGS.footer_text || null, socialLinks]
    );
    logger.info('✓ Settings created');
  }
}

/**
 * Seed or update homepage page
 */
async function seedHomepagePage() {
  const existing = await db.get('SELECT id FROM pages WHERE id = ?', [HOMEPAGE_ID]);
  
  if (existing) {
    await db.run(
      `UPDATE pages SET title = ?, slug = ?, published = ?, meta_title = ?, meta_description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [
        HOMEPAGE_PAGE.title,
        HOMEPAGE_PAGE.slug,
        HOMEPAGE_PAGE.published,
        HOMEPAGE_PAGE.meta_title,
        HOMEPAGE_PAGE.meta_description,
        HOMEPAGE_ID,
      ]
    );
    logger.info('✓ Homepage page (id=1) updated');
  } else {
    await db.run(
      `INSERT INTO pages (id, title, slug, published, meta_title, meta_description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        HOMEPAGE_ID,
        HOMEPAGE_PAGE.title,
        HOMEPAGE_PAGE.slug,
        HOMEPAGE_PAGE.published,
        HOMEPAGE_PAGE.meta_title,
        HOMEPAGE_PAGE.meta_description,
      ]
    );
    logger.info('✓ Homepage page (id=1) created');
  }
}

/**
 * Seed homepage content blocks
 */
async function seedBlocks() {
  await db.run('DELETE FROM content_blocks WHERE content_type = ? AND content_id = ?', [CONTENT_TYPE, HOMEPAGE_ID]);
  logger.info('Cleared existing homepage blocks');

  for (const block of BLOCKS) {
    await db.run(
      `INSERT INTO content_blocks (content_type, content_id, block_type, block_order, block_data, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [CONTENT_TYPE, HOMEPAGE_ID, block.block_type, block.block_order, JSON.stringify(block.block_data)]
    );
  }
  logger.info(`✓ Inserted ${BLOCKS.length} homepage blocks`);
}

/**
 * Seed logo media file (optional - only if file exists)
 */
async function seedLogo() {
  if (!fs.existsSync(LOGO_PATH)) {
    logger.warn('Logo file not found at ' + LOGO_PATH + ', skipping logo seeding');
    return;
  }

  try {
    // Check if logo already exists
    const existing = await db.get('SELECT id FROM media WHERE filename = ?', [LOGO_FILENAME]);
    
    if (existing) {
      logger.info(`Logo already exists (id=${existing.id}), updating settings`);
      await updateSettingsLogo(existing.id);
      return;
    }

    // Get file size
    const stats = fs.statSync(LOGO_PATH);
    const fileSize = stats.size;

    // Insert logo into media table (SVG is scalable, so width/height are null)
    const result = await db.run(
      `INSERT INTO media (filename, original_filename, path, mime_type, file_size, width, height, thumbnail_path, webp_path, alt_text, uploaded_at)
       VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, ?, CURRENT_TIMESTAMP)
       RETURNING id`,
      [
        LOGO_FILENAME,
        LOGO_ORIGINAL_FILENAME,
        LOGO_STORAGE_PATH,
        LOGO_MIME_TYPE,
        fileSize,
        'Website logo'
      ]
    );

    logger.info(`Logo inserted (id=${result.lastID}, size=${fileSize} bytes)`);
    await updateSettingsLogo(result.lastID);
  } catch (err) {
    logger.warn('Logo seeding skipped:', err.message);
  }
}

/**
 * Update settings with logo_media_id
 */
async function updateSettingsLogo(logoId) {
  const existing = await db.get('SELECT id FROM settings LIMIT 1');
  
  if (existing) {
    await db.run(
      "UPDATE settings SET logo_media_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [logoId, existing.id]
    );
    logger.info(`Settings updated with logo_media_id=${logoId}`);
  } else {
    await db.run(
      `INSERT INTO settings (id, site_title, logo_media_id, updated_at)
       VALUES (1, 'My Site', ?, CURRENT_TIMESTAMP)`,
      [logoId]
    );
    logger.info(`Settings created with logo_media_id=${logoId}`);
  }
}

/**
 * Main seed execution
 */
async function run() {
  try {
    logger.info('🌱 Starting database seeding...');
    await seedSettings();
    await seedHomepagePage();
    await seedBlocks();
    await seedLogo();
    logger.info('✓ Database seeding completed successfully');
  } catch (err) {
    logger.error('✗ Seeding failed:', err);
    throw err;
  } finally {
    await db.close();
    process.exit(0);
  }
}

run().catch((err) => {
  logger.error(err);
  process.exit(1);
});
