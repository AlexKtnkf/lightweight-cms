class AppointmentService {
  constructor(serviceRepository, availabilityRepository, bookingRepository, transactionManager) {
    this.serviceRepository = serviceRepository;
    this.availabilityRepository = availabilityRepository;
    this.bookingRepository = bookingRepository;
    this.transactionManager = transactionManager;
  }

  _assertDate(date) {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const error = new Error('Format de date invalide (YYYY-MM-DD)');
      error.status = 400;
      throw error;
    }

    const day = new Date(`${date}T00:00:00`);
    if (Number.isNaN(day.getTime())) {
      const error = new Error('Date invalide');
      error.status = 400;
      throw error;
    }

    const [y, m, d] = date.split('-').map(Number);
    if (day.getFullYear() !== y || day.getMonth() + 1 !== m || day.getDate() !== d) {
      const error = new Error('Date invalide');
      error.status = 400;
      throw error;
    }

    return day;
  }

  _assertTime(time) {
    if (typeof time !== 'string' || !/^\d{2}:\d{2}$/.test(time)) {
      const error = new Error('Format d\'heure invalide (HH:MM)');
      error.status = 400;
      throw error;
    }

    const [hours, minutes] = time.split(':').map(Number);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      const error = new Error('Heure invalide');
      error.status = 400;
      throw error;
    }

    return { hours, minutes };
  }

  _toIsoDateTime(date, time) {
    const day = this._assertDate(date);
    const { hours, minutes } = this._assertTime(time);

    const slot = new Date(day);
    slot.setHours(hours, minutes, 0, 0);

    const now = new Date();
    if (slot < now) {
      const error = new Error('Impossible de réserver dans le passé');
      error.status = 400;
      throw error;
    }

    const maxDays = Number.parseInt(process.env.BOOKING_MAX_DAYS_AHEAD || '365', 10);
    const latest = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000);
    if (slot > latest) {
      const error = new Error(`Impossible de réserver à plus de ${maxDays} jours`);
      error.status = 400;
      throw error;
    }

    return slot.toISOString();
  }

  async listServices({ activeOnly = false } = {}) {
    return this.serviceRepository.findAll({ activeOnly });
  }

  async createService(data) {
    return this.serviceRepository.create(data);
  }

  async updateService(id, data) {
    return this.serviceRepository.update(id, data);
  }

  async deleteService(id) {
    return this.serviceRepository.delete(id);
  }

  async listAvailability({ activeOnly = false } = {}) {
    return this.availabilityRepository.findAll({ activeOnly });
  }

  async createAvailability(data) {
    return this.availabilityRepository.create(data);
  }

  async updateAvailability(id, data) {
    return this.availabilityRepository.update(id, data);
  }

  async deleteAvailability(id) {
    return this.availabilityRepository.delete(id);
  }

  async listBookings({ status } = {}) {
    return this.bookingRepository.findAll({ status });
  }

  async updateBookingStatus(id, status) {
    return this.bookingRepository.updateStatus(id, status);
  }

  async listSlots(date) {
    const day = this._assertDate(date);
    const weekday = day.getDay();
    const availability = await this.availabilityRepository.findAll({ activeOnly: true });
    const daySlots = availability.filter(slot => slot.weekday === weekday);

    const slots = [];
    for (const slot of daySlots) {
      const [sh, sm] = slot.start_time.split(':').map(Number);
      const [eh, em] = slot.end_time.split(':').map(Number);

      const cur = new Date(day);
      cur.setHours(sh, sm, 0, 0);
      const end = new Date(day);
      end.setHours(eh, em, 0, 0);

      while (cur < end) {
        slots.push(cur.toISOString());
        cur.setMinutes(cur.getMinutes() + 30);
      }
    }

    return slots;
  }

  async createBooking(payload) {
    const { service_id, customer_name, customer_email, customer_phone, date, time, notes } = payload;

    if (!service_id || !customer_name || !customer_email || !date || !time) {
      const error = new Error('Champs requis manquants');
      error.status = 400;
      throw error;
    }

    const service = await this.serviceRepository.findById(service_id);
    if (!service || !service.active) {
      const error = new Error('Service introuvable');
      error.status = 404;
      throw error;
    }

    const startAt = this._toIsoDateTime(date, time);
    const endAt = new Date(
      new Date(startAt).getTime() + (service.duration_min || 60) * 60 * 1000
    ).toISOString();

    const booking = await this.transactionManager.withAdvisoryLock(`appointment:${startAt}`, async () => {
      const overlapping = await this.bookingRepository.findOverlapping(startAt, endAt);
      if (overlapping.length > 0) {
        const error = new Error('Ce créneau est déjà réservé');
        error.status = 409;
        throw error;
      }

      return this.bookingRepository.create({
        service_id: Number(service_id),
        customer_name,
        customer_email,
        customer_phone,
        start_at: startAt,
        end_at: endAt,
        notes,
        status: 'pending'
      });
    });

    return { booking, serviceName: service.name };
  }
}

module.exports = AppointmentService;
