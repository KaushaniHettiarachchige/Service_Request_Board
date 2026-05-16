"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NewJobPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Plumbing",
    location: "",
    contactName: "",
    contactEmail: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      return "Job title is required";
    }

    if (!formData.description.trim()) {
      return "Description is required";
    }

    if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
      return "Please enter a valid email address";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("authToken");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create job request");
      }

      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="createjob-page">
      <div className="createjob-container">
        <Link href="/" className="createjob-back">
          ← Back to Browse Jobs
        </Link>

        <section className="createjob-card">
          <div className="createjob-header">
            <div>
              <span className="createjob-tag">Post a Job</span>

              <h1>Create New Service Request</h1>

              <p>
                Add your service request details so tradespeople can view and
                respond to your job.
              </p>
            </div>

            <div className="createjob-icon">＋</div>
          </div>

          <form className="createjob-form" onSubmit={handleSubmit}>
            {error && <div className="createjob-error">{error}</div>}

            <div className="createjob-group">
              <label>Job Title *</label>
              <input
                type="text"
                name="title"
                placeholder="Enter the title of job"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="createjob-group">
              <label>Description *</label>
              <textarea
                name="description"
                placeholder="Describe the problem clearly..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="createjob-grid">
              <div className="createjob-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Painting">Painting</option>
                  <option value="Joinery">Joinery</option>
                  <option value="Landscaping">Landscaping</option>
                  <option value="Handyman">Handyman</option>
                  <option value="Appliances">Appliances</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="createjob-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="createjob-grid">
              <div className="createjob-group">
                <label>Contact Name</label>
                <input
                  type="text"
                  name="contactName"
                  placeholder="Your name"
                  value={formData.contactName}
                  onChange={handleChange}
                />
              </div>

              <div className="createjob-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  placeholder="name@example.com"
                  value={formData.contactEmail}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="createjob-actions">
              <button
                type="submit"
                className="createjob-submit"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Job Request"}
              </button>

              <Link href="/" className="createjob-cancel">
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}