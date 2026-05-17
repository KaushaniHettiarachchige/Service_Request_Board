"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getStatusClass = (status) => {
  if (status === "Open") return "detailjob-status detailjob-open";
  if (status === "In Progress") return "detailjob-status detailjob-progress";
  if (status === "Closed") return "detailjob-status detailjob-closed";
  return "detailjob-status";
};

const getCategoryIcon = (category) => {
  const icons = {
    Plumbing: "🚰",
    Electrical: "⚡",
    Painting: "🖌️",
    Joinery: "🔧",
    Landscaping: "🌿",
    Handyman: "🛠️",
    Appliances: "❄️",
    Other: "📋",
  };

  return icons[category] || "📋";
};

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [status, setStatus] = useState("");
  const [user, setUser] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/jobs/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch job details");
      }

      setJob(result.data);
      setStatus(result.data.status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const getAuthTokenOrRedirect = () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      router.push("/login");
      return null;
    }

    return token;
  };

  const handleStatusUpdate = async () => {
    const token = getAuthTokenOrRedirect();

    if (!token) return;

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update job status");
      }

      setJob(result.data);
      setStatus(result.data.status);
      setSuccess("Job status updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const openDeleteModal = () => {
    const token = getAuthTokenOrRedirect();

    if (!token) return;

    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (!deleting) {
      setShowDeleteModal(false);
    }
  };

  const confirmDeleteJob = async () => {
    const token = getAuthTokenOrRedirect();

    if (!token) return;

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete job request");
      }

      sessionStorage.removeItem("service_request_jobs_cache");
      setShowDeleteModal(false);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="detailjob-page">
        <div className="detailjob-container">
          <div className="detailjob-loading">Loading job details...</div>
        </div>
      </main>
    );
  }

  if (error && !job) {
    return (
      <main className="detailjob-page">
        <div className="detailjob-container">
          <Link href="/" className="detailjob-back">
            ← Back to Browse Jobs
          </Link>

          <div className="detailjob-error">{error}</div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="detailjob-page">
        <div className="detailjob-container">
          <Link href="/" className="detailjob-back">
            ← Back to Browse Jobs
          </Link>

          <section className="detailjob-card">
            <div className="detailjob-header">
              <div className="detailjob-header-left">
                <div className="detailjob-icon">
                  {getCategoryIcon(job.category)}
                </div>

                <div>
                  <span className="detailjob-label">Job Details</span>

                  <h1>{job.title}</h1>

                  <div className="detailjob-meta">
                    <span className="detailjob-category">
                      {job.category || "Other"}
                    </span>
                    <span>📍 {job.location || "No location"}</span>
                    <span>🕒 {new Date(job.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <span className={getStatusClass(job.status)}>{job.status}</span>
            </div>

            {error && <div className="detailjob-error">{error}</div>}
            {success && <div className="detailjob-success">{success}</div>}

            {!user && (
              <div className="detailjob-auth-notice">
                Please login to update status or delete this job request.
                <Link href="/login"> Login here</Link>
              </div>
            )}

            <div className="detailjob-content-grid">
              <div className="detailjob-main">
                <h2>Service Description</h2>
                <p>{job.description}</p>

                <div className="detailjob-info-grid">
                  <div className="detailjob-info-box">
                    <span>Category</span>
                    <strong>{job.category || "Not provided"}</strong>
                  </div>

                  <div className="detailjob-info-box">
                    <span>Location</span>
                    <strong>{job.location || "Not provided"}</strong>
                  </div>

                  <div className="detailjob-info-box">
                    <span>Contact Name</span>
                    <strong>{job.contactName || "Not provided"}</strong>
                  </div>

                  <div className="detailjob-info-box">
                    <span>Contact Email</span>
                    <strong>{job.contactEmail || "Not provided"}</strong>
                  </div>

                  <div className="detailjob-info-box">
                    <span>Posted By</span>
                    <strong>{job.createdBy?.name || "Not available"}</strong>
                  </div>

                  <div className="detailjob-info-box">
                    <span>Poster Email</span>
                    <strong>{job.createdBy?.email || "Not available"}</strong>
                  </div>
                </div>
              </div>

              <aside className="detailjob-side">
                <h2>Manage Request</h2>

                <p>
                  Logged-in users can update the current job status or delete
                  this job request.
                </p>

                <div className="detailjob-form-group">
                  <label>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={!user}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <button
                  className="detailjob-update-btn"
                  onClick={handleStatusUpdate}
                  disabled={updating || !user}
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>

                <button
                  className="detailjob-delete-btn"
                  onClick={openDeleteModal}
                  disabled={deleting || !user}
                >
                  Delete Job
                </button>
              </aside>
            </div>
          </section>
        </div>
      </main>

      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <button
              type="button"
              className="delete-modal-close"
              onClick={closeDeleteModal}
              disabled={deleting}
            >
              ×
            </button>

            <div className="delete-modal-icon">!</div>

            <h2>Delete Job Request?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{job.title}</strong>? This action cannot be undone.
            </p>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-modal-cancel"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-modal-confirm"
                onClick={confirmDeleteJob}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}