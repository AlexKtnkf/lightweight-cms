class SettingsController {
  constructor(getSettings, updateSettings) {
    this.getSettings = getSettings;
    this.updateSettings = updateSettings;
  }

  async get(req, res, next) {
    try {
      const settings = await this.getSettings.execute();
      res.json(settings);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const settings = await this.updateSettings.execute(req.body);
      res.json(settings);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SettingsController;
