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

    // Validate and sanitize social links
    if (settingsData.social_links && Array.isArray(settingsData.social_links)) {
      settingsData.social_links = settingsData.social_links
        .filter(link => link.platform && link.url)
        .map(link => ({
          platform: link.platform.trim(),
          url: link.url.trim(),
          icon: link.icon || link.platform.trim() // Use platform as icon if icon not provided
        }));
    }

    return this.settingsRepository.update(settingsData);
  }
}

module.exports = UpdateSettings;
