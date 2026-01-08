class UpdateSettings {
  constructor(settingsRepository) {
    this.settingsRepository = settingsRepository;
  }

  async execute(settingsData) {
    // Validate and sanitize menu links
    if (settingsData.header_menu_links && Array.isArray(settingsData.header_menu_links)) {
      settingsData.header_menu_links = settingsData.header_menu_links
        .filter(link => link.label && link.url)
        .map(link => ({
          label: link.label.trim(),
          url: link.url.trim(),
          order: parseInt(link.order) || 0
        }))
        .sort((a, b) => a.order - b.order);
    }

    if (settingsData.footer_menu_links && Array.isArray(settingsData.footer_menu_links)) {
      settingsData.footer_menu_links = settingsData.footer_menu_links
        .filter(link => link.label && link.url)
        .map(link => ({
          label: link.label.trim(),
          url: link.url.trim(),
          order: parseInt(link.order) || 0
        }))
        .sort((a, b) => a.order - b.order);
    }

    return this.settingsRepository.update(settingsData);
  }
}

module.exports = UpdateSettings;
