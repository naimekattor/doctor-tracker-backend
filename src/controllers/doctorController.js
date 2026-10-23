import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import { escapeRegex } from '../utils/regexUtils.js';

/**
 * Get all doctors with filtering, search, and pagination
 * @route GET /api/doctors
 */
export const getDoctors = async (req, res, next) => {
  try {
    const {
      search,
      specialization,
      hospital,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const query = {};

    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { specialization: { $regex: safeSearch, $options: 'i' } },
        { hospital: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    if (specialization) {
      query.specialization = { $regex: escapeRegex(specialization), $options: 'i' };
    }

    if (hospital) {
      query.hospital = { $regex: escapeRegex(hospital), $options: 'i' };
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          start.setUTCHours(0, 0, 0, 0);
          query.createdAt.$gte = start;
        }
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          end.setUTCHours(23, 59, 59, 999);
          query.createdAt.$lte = end;
        }
      }
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    const [doctors, total] = await Promise.all([
      Doctor.find(query).sort(sort).skip(skip).limit(limitNumber),
      Doctor.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single doctor by ID (with patient count)
 * @route GET /api/doctors/:id
 */
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const patientCount = await Patient.countDocuments({ doctor: doctor._id });

    res.status(200).json({
      success: true,
      data: {
        ...doctor.toObject(),
        patientCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new doctor
 * @route POST /api/doctors
 */
export const createDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing doctor
 * @route PUT /api/doctors/:id
 */
export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a doctor
 * @route DELETE /api/doctors/:id
 */
export const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Check if doctor has patients assigned
    const assignedPatientsCount = await Patient.countDocuments({ doctor: doctor._id });
    if (assignedPatientsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete doctor with ${assignedPatientsCount} assigned patient(s). Please reassign them first.`,
      });
    }

    await doctor.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
