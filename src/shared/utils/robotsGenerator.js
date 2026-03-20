const fs = require('fs');
const path = require('path');

class RobotsGenerator {
  constructor(publicDir = null) {
    this.publicDir = publicDir || path.join(__dirname, '../../../public');
    this.robotsPath = path.join(this.publicDir, 'robots.txt');
  }

  /**
   * Generate robots.txt content based on allow_search_indexing setting
   * @param {boolean} allowIndexing - Whether to allow search engine indexing
   * @returns {string} robots.txt content
   */
  generateContent(allowIndexing) {
    if (allowIndexing) {
      return `User-agent: *
Allow: /

Sitemap: /sitemap.xml
`;
    } else {
      return `User-agent: *
Disallow: /
`;
    }
  }

  /**
   * Write robots.txt file based on allow_search_indexing setting
   * @param {boolean} allowIndexing - Whether to allow search engine indexing
   */
  async write(allowIndexing) {
    try {
      // Ensure public directory exists
      if (!fs.existsSync(this.publicDir)) {
        fs.mkdirSync(this.publicDir, { recursive: true });
      }

      const content = this.generateContent(allowIndexing);
      fs.writeFileSync(this.robotsPath, content, 'utf8');
      
      return {
        success: true,
        message: `robots.txt ${allowIndexing ? 'allows' : 'disallows'} indexing`,
        path: this.robotsPath,
      };
    } catch (error) {
      throw new Error(`Failed to write robots.txt: ${error.message}`);
    }
  }
}

module.exports = RobotsGenerator;
