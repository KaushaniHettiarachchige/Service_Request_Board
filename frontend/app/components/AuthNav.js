"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  const loadUserFromStorage = () => {
    const savedUser = localStorage.getItem("authUser");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUserFromStorage();
    setMounted(true);

    const handleAuthChange = () => {
      loadUserFromStorage();
    };

    window.addEventListener("authChanged", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("authChanged", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    setUser(null);

    window.dispatchEvent(new Event("authChanged"));

    router.push("/");
  };

  if (!mounted) {
    return null;
  }

  return (
    <nav className="nav-links">
      <Link href="/" className={pathname === "/" ? "active" : ""}>
        Home
      </Link>

      {user ? (
        <>
          <Link
            href="/jobs/new"
            className={
              pathname === "/jobs/new"
                ? "post-job-btn active-btn"
                : "post-job-btn"
            }
          >
            Post a Job +
          </Link>

          <span className="nav-user">Hi, {user.name}</span>

          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className={
              pathname === "/login" ? "post-job-btn active-btn" : "post-job-btn"
            }
          >
            Post a Job +
          </Link>

          <Link href="/login" className={pathname === "/login" ? "active" : ""}>
            Login
          </Link>

          <Link
            href="/register"
            className={pathname === "/register" ? "active" : ""}
          >
            Register
          </Link>
        </>
      )}
    </nav>
  );
}