const DAY_LABELS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

class AppointmentsController {
  constructor(appointmentService, emailService) {
    this.appointmentService = appointmentService;
    this.emailService = emailService;
  }

  async rdvIndex(req, res, next) {
    try {
      const services = await this.appointmentService.listServices({ activeOnly: true });
      const availability = await this.appointmentService.listAvailability({ activeOnly: true });

      const weeklyAvailability = availability.map(slot => ({
        ...slot,
        day_label: DAY_LABELS[slot.weekday] || `jour-${slot.weekday}`
      }));

      res.render('pages/appointments', {
        title: 'Prendre rendez-vous',
        services,
        weeklyAvailability
      });
    } catch (err) { next(err); }
  }

  async listSlots(req, res, next) {
    try {
      const { date } = req.query;
      if (!date) return res.status(400).json({ error: 'date requise (YYYY-MM-DD)' });
      const slots = await this.appointmentService.listSlots(date);
      res.json(slots);
    } catch (err) { next(err); }
  }

  async createBooking(req, res, next) {
    try {
      const { booking, serviceName } = await this.appointmentService.createBooking(req.body);

      // Fire-and-forget admin notification
      this.emailService.sendBookingNotification(booking, serviceName, process.env.ADMIN_EMAIL).catch(() => {});

      res.status(201).json({ success: true, booking });
    } catch (err) { next(err); }
  }
}

module.exports = AppointmentsController;
