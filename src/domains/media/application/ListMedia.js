class ListMedia {
  constructor(mediaRepository) {
    this.mediaRepository = mediaRepository;
  }

  async execute(options = {}) {
    const { limit = 50, offset = 0 } = options;
    return await this.mediaRepository.findAll(limit, offset);
  }
}

module.exports = ListMedia;
