"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const JOB_CACHE_KEY = "service_request_jobs_cache";

const getJobIcon = (category) => {
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

const getStatusClass = (status) => {
  if (status === "Open") return "status-badge status-open";
  if (status === "In Progress") return "status-badge status-progress";
  if (status === "Closed") return "status-badge status-closed";
  return "status-badge";
};

const formatTimeAgo = (dateValue) => {
  if (!dateValue) return "Recently";

  const createdDate = new Date(dateValue);
  const now = new Date();
  const diffMs = now - createdDate;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
};

export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchJobs = useCallback(
    async (showMainLoader = false) => {
      try {
        if (showMainLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const params = new URLSearchParams();

        if (category) {
          params.append("category", category);
        }

        if (status) {
          params.append("status", status);
        }

        if (search.trim()) {
          params.append("search", search.trim());
        }

        const response = await fetch(`${API_URL}/jobs?${params.toString()}`, {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch jobs");
        }

        const jobData = result.data || [];
        setJobs(jobData);

        sessionStorage.setItem(JOB_CACHE_KEY, JSON.stringify(jobData));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [category, status, search]
  );

  useEffect(() => {
    const cachedJobs = sessionStorage.getItem(JOB_CACHE_KEY);

    if (cachedJobs) {
      setJobs(JSON.parse(cachedJobs));
      setLoading(false);
      fetchJobs(false);
    } else {
      fetchJobs(true);
    }
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchJobs(jobs.length === 0);
    }, 250);

    return () => clearTimeout(delaySearch);
  }, [category, status, search, fetchJobs]);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (location.trim()) {
      result = result.filter((job) =>
        job.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (sort === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [jobs, location, sort]);

  const stats = useMemo(() => {
    const todayJobs = jobs.filter((job) => {
      const created = new Date(job.createdAt);
      const now = new Date();
      const diffHours = (now - created) / (1000 * 60 * 60);
      return diffHours <= 24;
    });

    const uniqueCategories = new Set(jobs.map((job) => job.category));

    return {
      open: jobs.filter((job) => job.status === "Open").length,
      today: todayJobs.length,
      categories: uniqueCategories.size,
      inProgress: jobs.filter((job) => job.status === "In Progress").length,
    };
  }, [jobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(jobs.length === 0);
  };

  return (
    <main className="home-page">
      <section className="hero">
        <div>
          <h1>Find Service Requests Near You</h1>
          <p>
            Browse open homeowner service requests in your area and grow your
            business.
          </p>
        </div>

        <div className="hero-art">
          <span className="pin">📍</span>
          <span className="house">🏠</span>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div>
            <p>Open Jobs</p>
            <h2>{stats.open}</h2>
            <small>View all open requests</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🕒</div>
          <div>
            <p>New Today</p>
            <h2>{stats.today}</h2>
            <small>Posted in the last 24h</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">▦</div>
          <div>
            <p>Categories</p>
            <h2>{stats.categories}</h2>
            <small>Browse all categories</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛠️</div>
          <div>
            <p>In Progress</p>
            <h2>{stats.inProgress}</h2>
            <small>Jobs currently being handled</small>
          </div>
        </div>
      </section>

      <form className="filter-box" onSubmit={handleSearch}>
        <select
          className="select-field"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">▦ All Categories</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Electrical">Electrical</option>
          <option value="Painting">Painting</option>
          <option value="Joinery">Joinery</option>
          <option value="Landscaping">Landscaping</option>
          <option value="Handyman">Handyman</option>
          <option value="Appliances">Appliances</option>
          <option value="Other">Other</option>
        </select>

        <input
          className="input-field"
          type="text"
          placeholder="Search by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          className="input-field"
          type="text"
          placeholder="Enter city"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button className="search-btn" type="submit">
          🔍 Search
        </button>

        <select
          className="select-field"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Sort by: Newest</option>
          <option value="oldest">Sort by: Oldest</option>
        </select>
      </form>

      {refreshing && jobs.length > 0 && (
        <div className="refreshing-text">Updating latest service requests...</div>
      )}

      {error && <div className="error-box">{error}</div>}

      {loading && jobs.length === 0 ? (
        <div className="empty-box">Loading service requests...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="empty-box">
          <h2>No service requests found</h2>
          <p>Post your first job request to see it here.</p>
          <Link href="/jobs/new" className="empty-action-btn">
            Post a Job
          </Link>
        </div>
      ) : (
        <section className="jobs-grid">
          {filteredJobs.map((job) => (
            <article className="job-card" key={job._id}>
              <div className="job-icon">{getJobIcon(job.category)}</div>

              <div className="job-content">
                <h3>{job.title}</h3>

                <span className={getStatusClass(job.status)}>
                  {job.status}
                </span>

                <p>
                  {job.description?.length > 95
                    ? `${job.description.substring(0, 95)}...`
                    : job.description}
                </p>

                <div className="meta-row">
                  <span className="category-pill">
                    {job.category || "Other"}
                  </span>
                  <span className="location-pill">
                    📍 {job.location || "No location"}
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <span>👤 {job.contactName || "Unknown"}</span>
                <span>🕒 {formatTimeAgo(job.createdAt)}</span>
                <Link href={`/jobs/${job._id}`} className="view-btn">
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* {!loading && filteredJobs.length > 0 && (
        <div className="pagination-row">
          <button className="page-btn" type="button">
            ‹
          </button>
          <button className="page-btn active" type="button">
            1
          </button>
          <button className="page-btn" type="button">
            2
          </button>
          <button className="page-btn" type="button">
            3
          </button>
          <button className="page-btn" type="button">
            ...
          </button>
          <button className="page-btn" type="button">
            ›
          </button>
        </div>
      )} */}
    </main>
  );
}