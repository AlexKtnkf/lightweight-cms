const serviceRepository = require('../../domain/appointments/infrastructure/serviceRepository');
const availabilityRepository = require('../../domain/appointments/infrastructure/availabilityRepository');
const bookingRepository = require('../../domain/appointments/infrastructure/bookingRepository');
const emailService = require('../../shared/services/emailServiceInstance');

const DAY_LABELS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

function toIsoDateTime(date, time) {
  return new Date(`${date}T${time}:00`).toISOString();
}

async function rdvIndex(req, res, next) {
  try {
    const services = await serviceRepository.findAll({ activeOnly: true });
    const availability = await availabilityRepository.findAll({ activeOnly: true });

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

async function listSlots(req, res, next) {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date requise (YYYY-MM-DD)' });

    const day = new Date(`${date}T00:00:00`);
    const weekday = day.getDay();
    const availability = await availabilityRepository.findAll({ activeOnly: true });
    const daySlots = availability.filter(a => a.weekday === weekday);

    const slots = [];
    for (const slot of daySlots) {
      const [sh, sm] = slot.start_time.split(':').map(Number);
      const [eh, em] = slot.end_time.split(':').map(Number);
      let cur = new Date(`${date}T00:00:00`);
      cur.setHours(sh, sm, 0, 0);
      const end = new Date(`${date}T00:00:00`);
      end.setHours(eh, em, 0, 0);

      while (cur < end) {
        slots.push(cur.toISOString());
        cur = new Date(cur.getTime() + 30 * 60 * 1000);
      }
    }

    res.json(slots);
  } catch (err) { next(err); }
}

async function createBooking(req, res, next) {
  try {
    const { service_id, customer_name, customer_email, customer_phone, date, time, notes } = req.body;
    if (!service_id || !customer_name || !customer_email || !date || !time) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    const service = await serviceRepository.findById(service_id);
    if (!service || !service.active) return res.status(404).json({ error: 'Service introuvable' });

    const startAt = toIsoDateTime(date, time);
    const endAt = new Date(new Date(startAt).getTime() + (service.duration_min || 60) * 60 * 1000).toISOString();

    const overlapping = await bookingRepository.findOverlapping(startAt, endAt);
    if (overlapping.length > 0) {
      return res.status(409).json({ error: 'Ce créneau est déjà réservé' });
    }

    const booking = await bookingRepository.create({
      service_id: Number(service_id),
      customer_name,
      customer_email,
      customer_phone,
      start_at: startAt,
      end_at: endAt,
      notes,
      status: 'pending'
    });

    // Fire-and-forget admin notification
    emailService.sendBookingNotification(booking, service.name, process.env.ADMIN_EMAIL).catch(() => {});

    res.status(201).json({ success: true, booking });
  } catch (err) { next(err); }
}

module.exports = {
  rdvIndex,
  listSlots,
  createBooking
};
