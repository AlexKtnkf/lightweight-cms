const Slug = require('./Slug');
const DomainError = require('../../../shared/errors/DomainError');

class Page {
  constructor({ id, title, slug, published = false, blocks = [], meta = {} }) {
    this.id = id;
    this.title = title?.trim() || '';
    this.slug = slug ? (slug instanceof Slug ? slug : Slug.create(slug)) : null;
    this.published = published;
    this.blocks = blocks || [];
    this.meta = {
      title: meta.title || null,
      description: meta.description || null,
      og_title: meta.og_title || null,
      og_description: meta.og_description || null,
      og_image_id: meta.og_image_id || null,
      image_media_id: meta.image_media_id || null,
    };
  }

  publish() {
    this.published = true;
  }

  unpublish() {
    this.published = false;
  }

  addBlock(block) {
    if (!block || !block.block_type) {
      throw new DomainError('Block must have a type');
    }
    this.blocks.push(block);
  }

  removeBlock(index) {
    if (index < 0 || index >= this.blocks.length) {
      throw new DomainError('Invalid block index');
    }
    this.blocks.splice(index, 1);
  }

  updateBlock(index, block) {
    if (index < 0 || index >= this.blocks.length) {
      throw new DomainError('Invalid block index');
    }
    if (!block || !block.block_type) {
      throw new DomainError('Block must have a type');
    }
    this.blocks[index] = block;
  }

  validate() {
    if (!this.title || this.title.trim().length === 0) {
      throw new DomainError('Page title is required');
    }
    if (!this.slug) {
      throw new DomainError('Page slug is required');
    }
    if (!this.slug.isValid()) {
      throw new DomainError('Invalid slug format');
    }
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      slug: this.slug?.toString(),
      published: this.published,
      blocks: this.blocks,
      meta_title: this.meta.title,
      meta_description: this.meta.description,
      og_title: this.meta.og_title,
      og_description: this.meta.og_description,
      og_image_id: this.meta.og_image_id,
      image_media_id: this.meta.image_media_id,
    };
  }

  static fromJSON(data) {
    return new Page({
      id: data.id,
      title: data.title,
      slug: data.slug,
      published: data.published,
      blocks: data.blocks || [],
      meta: {
        title: data.meta_title,
        description: data.meta_description,
        og_title: data.og_title,
        og_description: data.og_description,
        og_image_id: data.og_image_id,
        image_media_id: data.image_media_id,
      },
    });
  }
}

module.exports = Page;
