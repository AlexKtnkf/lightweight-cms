class DeleteMedia {
  constructor(mediaRepository, storageAdapter) {
    this.mediaRepository = mediaRepository;
    this.storageAdapter = storageAdapter;
  }

  async execute(id) {
    const media = await this.mediaRepository.findById(id);
    if (!media) {
      const error = new Error('Image introuvable');
      error.status = 404;
      throw error;
    }

    // Delete files via configured adapter
    await this.storageAdapter.delete(media);

    // Delete from database
    await this.mediaRepository.delete(id);
  }
}

module.exports = DeleteMedia;
