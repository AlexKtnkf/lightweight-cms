class SettingsController {
  constructor(getSettings, updateSettings, staticGenerator = null, robotsGenerator = null, backupService = null, mediaBackupService = null) {
    this.getSettings = getSettings;
    this.updateSettings = updateSettings;
    this.staticGenerator = staticGenerator;
    this.robotsGenerator = robotsGenerator;
    this.backupService = backupService;
    this.mediaBackupService = mediaBackupService;
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
      
      // Update robots.txt if allow_search_indexing changed
      if (this.robotsGenerator && req.body.allow_search_indexing !== undefined) {
        this.robotsGenerator.write(req.body.allow_search_indexing).catch(err => {
          console.error('Erreur lors de la génération du robots.txt :', err);
        });
      }
      
      // Trigger full static regeneration when settings change
      if (this.staticGenerator) {
        this.staticGenerator.generateAll().catch(err => {
          console.error('Erreur lors de la régénération du site statique :', err);
        });
      }
      res.json(settings);
    } catch (error) {
      next(error);
    }
  }

  async regenerate(req, res, next) {
    try {
      if (!this.staticGenerator) {
        return res.status(500).json({ error: 'Générateur statique non configuré' });
      }
      await this.staticGenerator.generateAll();
      res.json({ success: true, message: 'Site régénéré avec succès' });
    } catch (error) {
      next(error);
    }
  }

  async backup(req, res, next) {
    try {
      if (!this.backupService || typeof this.backupService.createBackup !== 'function') {
        return res.status(500).json({ error: 'Service de sauvegarde non configuré' });
      }

      const result = await this.backupService.createBackup();
      return res.download(result.path, result.filename);
    } catch (error) {
      next(error);
    }
  }

  async downloadMediaBackup(req, res, next) {
    try {
      if (!this.mediaBackupService || typeof this.mediaBackupService.createMediaBackup !== 'function') {
        return res.status(500).json({ error: 'Service de sauvegarde des images non configuré' });
      }

      const result = await this.mediaBackupService.createMediaBackup();
      return res.download(result.path, result.filename);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SettingsController;
