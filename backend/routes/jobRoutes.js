const express = require("express");

const {
  getJobs,
  getJobById,
  createJob,
  updateJobStatus,
  deleteJob,
} = require("../controllers/jobController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(getJobs).post(protect, createJob);

router
  .route("/:id")
  .get(getJobById)
  .patch(protect, updateJobStatus)
  .delete(protect, deleteJob);

module.exports = router;