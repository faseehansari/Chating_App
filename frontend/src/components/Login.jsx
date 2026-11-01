
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(identifier.trim(), password);
      navigate("/chat", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="login-identifier"
          className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
        >
          Username or Email
        </label>

        <input
          id="login-identifier"
          type="text"
          autoComplete="username"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="Enter username or email"
          required
          className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] outline-none focus:border-[var(--border-focus)]"
        />
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
        >
          Password
        </label>

        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter password"
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
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default Login;
