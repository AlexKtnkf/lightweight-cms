class AdminAppointmentsController {
  constructor(appointmentService) {
    this.appointmentService = appointmentService;
  }

  async listServices(req, res, next) {
    try {
      const rows = await this.appointmentService.listServices();
      res.json(rows);
    } catch (err) { next(err); }
  }

  async createService(req, res, next) {
    try {
      const { name, description, duration_min, price, currency, active } = req.body;
      if (!name) return res.status(400).json({ error: 'name requis' });
      const service = await this.appointmentService.createService({
        name,
        description,
        duration_min: Number(duration_min) || 60,
        price: price === '' || price == null ? null : Number(price),
        currency,
        active
      });
      res.status(201).json(service);
    } catch (err) { next(err); }
  }

  async updateService(req, res, next) {
    try {
      const row = await this.appointmentService.updateService(req.params.id, req.body);
      if (!row) return res.status(404).json({ error: 'Service introuvable' });
      res.json(row);
    } catch (err) { next(err); }
  }

  async deleteService(req, res, next) {
    try {
      await this.appointmentService.deleteService(req.params.id);
      res.json({ success: true });
    } catch (err) { next(err); }
  }

  async listAvailability(req, res, next) {
    try {
      const rows = await this.appointmentService.listAvailability();
      res.json(rows);
    } catch (err) { next(err); }
  }

  async createAvailability(req, res, next) {
    try {
      const { weekday, start_time, end_time, active } = req.body;
      if (weekday == null || !start_time || !end_time) {
        return res.status(400).json({ error: 'weekday, start_time, end_time requis' });
      }
      const row = await this.appointmentService.createAvailability({
        weekday: Number(weekday),
        start_time,
        end_time,
        active
      });
      res.status(201).json(row);
    } catch (err) { next(err); }
  }

  async updateAvailability(req, res, next) {
    try {
      const row = await this.appointmentService.updateAvailability(req.params.id, req.body);
      if (!row) return res.status(404).json({ error: 'Disponibilite introuvable' });
      res.json(row);
    } catch (err) { next(err); }
  }

  async deleteAvailability(req, res, next) {
    try {
      await this.appointmentService.deleteAvailability(req.params.id);
      res.json({ success: true });
    } catch (err) { next(err); }
  }

  async listBookings(req, res, next) {
    try {
      const rows = await this.appointmentService.listBookings({ status: req.query.status });
      res.json(rows);
    } catch (err) { next(err); }
  }

  async updateBookingStatus(req, res, next) {
    try {
      const { status } = req.body;
      const allowed = ['pending', 'confirmed', 'cancelled', 'done'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ error: `Statut invalide: ${allowed.join(', ')}` });
      }
      const row = await this.appointmentService.updateBookingStatus(req.params.id, status);
      if (!row) return res.status(404).json({ error: 'RDV introuvable' });
      res.json(row);
    } catch (err) { next(err); }
  }
}

module.exports = AdminAppointmentsController;
