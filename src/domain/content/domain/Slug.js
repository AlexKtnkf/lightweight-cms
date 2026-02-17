const DomainError = require('../../../shared/errors/DomainError');

class Slug {
  constructor(value) {
    if (!value || typeof value !== 'string') {
      throw new DomainError('Slug must be a non-empty string');
    }
    if (!/^[a-z0-9-]+$/.test(value)) {
      throw new DomainError('Slug must contain only lowercase letters, numbers, and hyphens');
    }
    this.value = value;
  }

  static create(value) {
    return new Slug(value);
  }

  equals(other) {
    return other instanceof Slug && this.value === other.value;
  }

  toString() {
    return this.value;
  }

  isValid() {
    return /^[a-z0-9-]+$/.test(this.value);
  }
}

module.exports = Slug;
