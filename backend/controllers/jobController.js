const mongoose = require("mongoose");
const JobRequest = require("../models/JobRequest");

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const isValidMongoId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/jobs
const getJobs = asyncHandler(async (req, res) => {
  const { category, status, search } = req.query;

  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (status) {
    filter.status = status;
  }

  if (search && search.trim() !== "") {
    const searchText = search.trim();

    filter.$or = [
      { title: { $regex: searchText, $options: "i" } },
      { description: { $regex: searchText, $options: "i" } },
    ];
  }

  const jobs = await JobRequest.find(filter)
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs,
  });
});

// GET /api/jobs/:id
const getJobById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidMongoId(id)) {
    const error = new Error("Invalid job ID");
    error.statusCode = 400;
    throw error;
  }

  const job = await JobRequest.findById(id).populate("createdBy", "name email");

  if (!job) {
    const error = new Error("Job request not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: job,
  });
});

// POST /api/jobs
const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    location,
    contactName,
    contactEmail,
  } = req.body;

  const job = await JobRequest.create({
    title,
    description,
    category,
    location,
    contactName,
    contactEmail,
    createdBy: req.user ? req.user._id : undefined,
  });

  res.status(201).json({
    success: true,
    message: "Job request created successfully",
    data: job,
  });
});

// PATCH /api/jobs/:id
const updateJobStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!isValidMongoId(id)) {
    const error = new Error("Invalid job ID");
    error.statusCode = 400;
    throw error;
  }

  const allowedFields = ["status"];
  const bodyFields = Object.keys(req.body);

  const hasInvalidField = bodyFields.some(
    (field) => !allowedFields.includes(field)
  );

  if (hasInvalidField) {
    const error = new Error("Only status can be updated");
    error.statusCode = 400;
    throw error;
  }

  if (!["Open", "In Progress", "Closed"].includes(status)) {
    const error = new Error("Status must be Open, In Progress, or Closed");
    error.statusCode = 400;
    throw error;
  }

  const job = await JobRequest.findByIdAndUpdate(
    id,
    { status },
    { returnDocument: "after", runValidators: true }
  ).populate("createdBy", "name email");

  if (!job) {
    const error = new Error("Job request not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Job status updated successfully",
    data: job,
  });
});

// DELETE /api/jobs/:id
const deleteJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidMongoId(id)) {
    const error = new Error("Invalid job ID");
    error.statusCode = 400;
    throw error;
  }

  const job = await JobRequest.findByIdAndDelete(id);

  if (!job) {
    const error = new Error("Job request not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Job request deleted successfully",
  });
});

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJobStatus,
  deleteJob,
};