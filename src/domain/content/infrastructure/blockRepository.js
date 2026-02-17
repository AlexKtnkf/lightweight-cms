const db = require('../../../infrastructure/database/database');

class BlockRepository {
  // Find all blocks for a content item
  async findByContent(contentType, contentId) {
    const sql = `SELECT * FROM content_blocks 
                 WHERE content_type = ? AND content_id = ? 
                 ORDER BY block_order ASC`;
    return db.all(sql, [contentType, contentId]);
  }

  // Find block by ID
  async findById(id) {
    const sql = `SELECT * FROM content_blocks WHERE id = ?`;
    return db.get(sql, [id]);
  }

  // Create a block
  async create(blockData) {
    const sql = `INSERT INTO content_blocks (content_type, content_id, block_type, block_order, block_data, created_at)
                 VALUES (?, ?, ?, ?, ?, datetime('now'))`;
    const result = await db.run(sql, [
      blockData.content_type,
      blockData.content_id,
      blockData.block_type,
      blockData.block_order,
      JSON.stringify(blockData.block_data)
    ]);
    return this.findById(result.lastID);
  }

  // Create multiple blocks
  async createMany(blocks) {
    const promises = blocks.map(block => this.create(block));
    return Promise.all(promises);
  }

  // Update a block
  async update(id, blockData) {
    const sql = `UPDATE content_blocks 
                 SET block_type = ?, block_order = ?, block_data = ?
                 WHERE id = ?`;
    await db.run(sql, [
      blockData.block_type,
      blockData.block_order,
      JSON.stringify(blockData.block_data),
      id
    ]);
    return this.findById(id);
  }

  // Delete a block
  async delete(id) {
    const sql = `DELETE FROM content_blocks WHERE id = ?`;
    await db.run(sql, [id]);
  }

  // Delete all blocks for a content item
  async deleteByContent(contentType, contentId) {
    const sql = `DELETE FROM content_blocks 
                 WHERE content_type = ? AND content_id = ?`;
    await db.run(sql, [contentType, contentId]);
  }

  // Reorder blocks (update block_order for all blocks)
  async reorder(contentType, contentId, blockOrders) {
    // blockOrders is an array of {id, order}
    const promises = blockOrders.map(({ id, order }) => {
      const sql = `UPDATE content_blocks SET block_order = ? WHERE id = ?`;
      return db.run(sql, [order, id]);
    });
    return Promise.all(promises);
  }

  /**
   * Parse block data from JSON string to object
   * Handles both string and already-parsed objects
   */
  parseBlockData(block) {
    return {
      ...block,
      block_data: typeof block.block_data === 'string' 
        ? JSON.parse(block.block_data) 
        : block.block_data
    };
  }

  /**
   * Parse multiple blocks
   */
  parseBlocks(blocks) {
    return blocks.map(block => this.parseBlockData(block));
  }
}

module.exports = new BlockRepository();
