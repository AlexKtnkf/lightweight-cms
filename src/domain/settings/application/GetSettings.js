class GetSettings {
  constructor(settingsRepository) {
    this.settingsRepository = settingsRepository;
  }

  async execute() {
    return await this.settingsRepository.get();
  }
}

module.exports = GetSettings;
