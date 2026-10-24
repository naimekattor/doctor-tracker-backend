import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { escapeRegex } from '../utils/regexUtils.js';

/**
 * Get all patients with filtering, search, and pagination
 * @route GET /api/patients
 */
export const getPatients = async (req, res, next) => {
  try {
    const {
      search,
      doctor,
      gender,
      condition,
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
        { contactPhone: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    if (doctor) {
      query.doctor = doctor;
    }

    if (gender) {
      query.gender = gender;
    }

    if (condition) {
      query.condition = { $regex: escapeRegex(condition), $options: 'i' };
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

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .populate('doctor', 'name specialization hospital email phone')
        .sort(sort)
        .skip(skip)
        .limit(limitNumber),
      Patient.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single patient by ID
 * @route GET /api/patients/:id
 */
export const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      'doctor',
      'name specialization hospital email phone'
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    const patientData = patient.toObject ? patient.toObject() : patient;
    if (!patientData.conditionHistory || patientData.conditionHistory.length === 0) {
      patientData.conditionHistory = [
        {
          condition: patientData.condition,
          notes: patientData.notes || 'Initial admission assessment',
          recordedAt: patientData.createdAt || new Date(),
        },
      ];
    }

    res.status(200).json({
      success: true,
      data: patientData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new patient
 * @route POST /api/patients
 */
export const createPatient = async (req, res, next) => {
  try {
    const { doctor: doctorId } = req.body;

    // Check if referenced doctor exists
    const doctorExists = await Doctor.findById(doctorId);
    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: 'Assigned doctor not found',
      });
    }

    const payload = {
      ...req.body,
      conditionHistory: [
        {
          condition: req.body.condition,
          notes: req.body.notes || 'Initial admission assessment',
          recordedAt: new Date(),
        },
      ],
    };

    const patient = await Patient.create(payload);
    await patient.populate('doctor', 'name specialization hospital email phone');

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing patient
 * @route PUT /api/patients/:id
 */
export const updatePatient = async (req, res, next) => {
  try {
    const existingPatient = await Patient.findById(req.params.id);
    if (!existingPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    if (req.body.doctor) {
      const doctorExists = await Doctor.findById(req.body.doctor);
      if (!doctorExists) {
        return res.status(404).json({
          success: false,
          message: 'Assigned doctor not found',
        });
      }
    }

    const updates = { ...req.body };

    const isConditionChanged =
      req.body.condition && req.body.condition !== existingPatient.condition;
    const isNewNotesProvided =
      req.body.notes !== undefined && req.body.notes !== existingPatient.notes;

    if (isConditionChanged || isNewNotesProvided) {
      const newHistoryEntry = {
        condition: req.body.condition || existingPatient.condition,
        notes:
          req.body.notes ||
          (isConditionChanged ? `Condition transitioned to ${req.body.condition}` : ''),
        recordedAt: new Date(),
      };
      updates.$push = { conditionHistory: newHistoryEntry };
    }

    const patient = await Patient.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('doctor', 'name specialization hospital email phone');

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a patient
 * @route DELETE /api/patients/:id
 */
export const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};
