'use strict';

/**
 * Feature flags — read from environment variables at startup.
 *
 * Convention: FEATURE_<NAME>=false disables a feature.
 * Absent or any other value → feature is ENABLED.
 * This is an opt-out model: existing deployments are unaffected.
 *
 * Super-admin users bypass all flags server-side (checked in requireFeature middleware).
 */

function parseFlag(envVar) {
  const val = process.env[envVar];
  if (val === undefined || val === null) return true; // default: enabled
  return val.toLowerCase() !== 'false' && val !== '0';
}

const flags = {
  // ── Block types ──────────────────────────────────────────────────────────
  FEATURE_BLOCK_HERO:             parseFlag('FEATURE_BLOCK_HERO'),
  FEATURE_BLOCK_RICH_TEXT:        parseFlag('FEATURE_BLOCK_RICH_TEXT'),
  FEATURE_BLOCK_ENCART_PRINCIPAL: parseFlag('FEATURE_BLOCK_ENCART_PRINCIPAL'),
  FEATURE_BLOCK_ACCROCHE:         parseFlag('FEATURE_BLOCK_ACCROCHE'),
  FEATURE_BLOCK_PIN_GRID:         parseFlag('FEATURE_BLOCK_PIN_GRID'),
  FEATURE_BLOCK_NUMBERED_CARDS:   parseFlag('FEATURE_BLOCK_NUMBERED_CARDS'),
  FEATURE_BLOCK_QUESTION_REPONSE: parseFlag('FEATURE_BLOCK_QUESTION_REPONSE'),
  FEATURE_BLOCK_LEAD_MAGNET:      parseFlag('FEATURE_BLOCK_LEAD_MAGNET'),
  FEATURE_BLOCK_CONTACT_FORM:     parseFlag('FEATURE_BLOCK_CONTACT_FORM'),
  // future blocks — off by default until milestones implement them
  FEATURE_BLOCK_SHOP_PRODUCT:     parseFlag('FEATURE_BLOCK_SHOP_PRODUCT'),
  FEATURE_BLOCK_APPOINTMENT:      parseFlag('FEATURE_BLOCK_APPOINTMENT'),

  // ── Admin sections ────────────────────────────────────────────────────────
  FEATURE_SECTION_BLOG:           parseFlag('FEATURE_SECTION_BLOG'),
  FEATURE_SECTION_INSTAGRAM:      parseFlag('FEATURE_SECTION_INSTAGRAM'),
  FEATURE_SECTION_SHOP:           parseFlag('FEATURE_SECTION_SHOP'),
  FEATURE_SECTION_APPOINTMENTS:   parseFlag('FEATURE_SECTION_APPOINTMENTS'),

  // ── Public routes / features ──────────────────────────────────────────────
  FEATURE_PUBLIC_CONTACT:         parseFlag('FEATURE_PUBLIC_CONTACT'),
  FEATURE_PUBLIC_RSS:             parseFlag('FEATURE_PUBLIC_RSS'),
  FEATURE_PUBLIC_SITEMAP:         parseFlag('FEATURE_PUBLIC_SITEMAP'),
};

/**
 * Returns true if the named feature is enabled.
 * @param {string} flag  Key from the flags object above.
 */
function isEnabled(flag) {
  if (!(flag in flags)) {
    // Unknown flag — fail open (enabled) so unknown flags don't silently break things.
    return true;
  }
  return flags[flag];
}

module.exports = { flags, isEnabled };
