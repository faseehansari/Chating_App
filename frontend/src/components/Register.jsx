
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      navigate("/chat", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="register-username"
          className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
        >
          Username
        </label>

        <input
          id="register-username"
          type="text"
          name="username"
          autoComplete="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Choose a username"
          required
          className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] outline-none focus:border-[var(--border-focus)]"
        />
      </div>

      <div>
        <label
          htmlFor="register-email"
          className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
        >
          Email
        </label>

        <input
          id="register-email"
          type="email"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] outline-none focus:border-[var(--border-focus)]"
        />
      </div>

      <div>
        <label
          htmlFor="register-password"
          className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
        >
          Password
        </label>

        <input
          id="register-password"
          type="password"
          name="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password"
          required
          className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] outline-none focus:border-[var(--border-focus)]"
        />
      </div>

      <div>
        <label
          htmlFor="register-confirm-password"
          className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
        >
          Confirm Password
        </label>

        <input
          id="register-confirm-password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          required
          className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] outline-none focus:border-[var(--border-focus)]"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-[var(--error)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[var(--button-primary)] px-4 py-3 font-semibold text-[var(--button-primary-text)] transition-colors hover:bg-[var(--button-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
};

export default Register;
