const serviceRepository = require('../../../domain/appointments/infrastructure/serviceRepository');
const availabilityRepository = require('../../../domain/appointments/infrastructure/availabilityRepository');
const bookingRepository = require('../../../domain/appointments/infrastructure/bookingRepository');

async function listServices(req, res, next) {
  try {
    const rows = await serviceRepository.findAll();
    res.json(rows);
  } catch (err) { next(err); }
}

async function createService(req, res, next) {
  try {
    const { name, description, duration_min, price, currency, active } = req.body;
    if (!name) return res.status(400).json({ error: 'name requis' });
    const service = await serviceRepository.create({
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

async function updateService(req, res, next) {
  try {
    const row = await serviceRepository.update(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: 'Service introuvable' });
    res.json(row);
  } catch (err) { next(err); }
}

async function deleteService(req, res, next) {
  try {
    await serviceRepository.delete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
}

async function listAvailability(req, res, next) {
  try {
    const rows = await availabilityRepository.findAll();
    res.json(rows);
  } catch (err) { next(err); }
}

async function createAvailability(req, res, next) {
  try {
    const { weekday, start_time, end_time, active } = req.body;
    if (weekday == null || !start_time || !end_time) {
      return res.status(400).json({ error: 'weekday, start_time, end_time requis' });
    }
    const row = await availabilityRepository.create({
      weekday: Number(weekday),
      start_time,
      end_time,
      active
    });
    res.status(201).json(row);
  } catch (err) { next(err); }
}

async function updateAvailability(req, res, next) {
  try {
    const row = await availabilityRepository.update(req.params.id, req.body);
    if (!row) return res.status(404).json({ error: 'Disponibilite introuvable' });
    res.json(row);
  } catch (err) { next(err); }
}

async function deleteAvailability(req, res, next) {
  try {
    await availabilityRepository.delete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
}

async function listBookings(req, res, next) {
  try {
    const rows = await bookingRepository.findAll({ status: req.query.status });
    res.json(rows);
  } catch (err) { next(err); }
}

async function updateBookingStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'cancelled', 'done'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Statut invalide: ${allowed.join(', ')}` });
    }
    const row = await bookingRepository.updateStatus(req.params.id, status);
    if (!row) return res.status(404).json({ error: 'RDV introuvable' });
    res.json(row);
  } catch (err) { next(err); }
}

module.exports = {
  listServices,
  createService,
  updateService,
  deleteService,
  listAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  listBookings,
  updateBookingStatus
};
