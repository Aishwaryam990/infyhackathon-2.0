import React, { useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminLogin({ onAdminLogin }) {
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@technest.com",
          password: "Admin@123",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Admin login failed");
      }

      // Decode JWT just like your normal login
      const payload = JSON.parse(
        atob(data.token.split(".")[1])
      );

      const loggedInUser = {
        id: Number(data.user?.id || payload.id),
        name:
          data.user?.name ||
          payload.name ||
          "TechNest Admin",
        email:
          data.user?.email ||
          payload.email ||
          "admin@technest.com",
        role:
          data.user?.role ||
          payload.role ||
          "admin",
      };

      // IMPORTANT:
      // Use the SAME keys as your normal login
      localStorage.setItem(
        "technest_token",
        data.token
      );

      localStorage.setItem(
        "technest_user",
        JSON.stringify(loggedInUser)
      );

      // Send authentication data back to App.jsx
      if (onAdminLogin) {
        onAdminLogin(loggedInUser, data.token);
      }
    } catch (error) {
      console.error("Admin login error:", error);

      alert(
        error.message ||
          "Unable to connect to TechNest server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 text-center">
      <div className="text-xs text-gray-500 mb-2">
        Authorized access
      </div>

      <button
        type="button"
        onClick={handleAdminLogin}
        disabled={loading}
        className="w-full py-3 rounded-xl border-2 border-purple-600 text-purple-600 font-semibold hover:bg-purple-50 transition-all duration-200 disabled:opacity-50"
      >
        {loading
          ? "Opening Admin Dashboard..."
          : "🔐 Admin Login"}
      </button>
    </div>
  );
}