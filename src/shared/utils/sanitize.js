const { JSDOM } = require('jsdom');
const DOMPurify = require('dompurify');

const window = new JSDOM('').window;
const purify = DOMPurify(window);

function isInsideWhitespacePreservingElement(node) {
  let current = node?.parentNode || null;
  while (current && current.nodeType === window.Node.ELEMENT_NODE) {
    const tagName = current.tagName;
    if (tagName === 'PRE' || tagName === 'CODE') {
      return true;
    }
    current = current.parentNode;
  }
  return false;
}

function normalizeHtmlSpacing(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const document = new JSDOM(`<body>${html}</body>`).window.document;
  const walker = document.createTreeWalker(
    document.body,
    document.defaultView.NodeFilter.SHOW_TEXT
  );

  let node = walker.nextNode();
  while (node) {
    if (!isInsideWhitespacePreservingElement(node)) {
      node.nodeValue = node.nodeValue.replace(/\u00A0/g, ' ');
    }
    node = walker.nextNode();
  }

  return document.body.innerHTML;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
function sanitize(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  const sanitized = purify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'data-media-id'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  });

  return normalizeHtmlSpacing(sanitized);
}

module.exports = sanitize;
module.exports.normalizeHtmlSpacing = normalizeHtmlSpacing;
