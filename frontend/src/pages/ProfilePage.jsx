
import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Save,
  RotateCcw,
  Pencil,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import API from "../services/api";

const ProfilePage = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleEdit = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
    });

    setIsEditing(true);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
    });

    setIsEditing(false);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleReset = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
    });

    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const username = formData.username.trim().toLowerCase();
    const email = formData.email.trim().toLowerCase();

    if (!username || !email) {
      setErrorMessage("Username and email are required.");
      return;
    }

    if (username.length < 3 || username.length > 30) {
      setErrorMessage("Username must be between 3 and 30 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (
      username === user?.username &&
      email === user?.email
    ) {
      setErrorMessage("No changes have been made.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.put("/users/profile", {
        username,
        email,
      });

      if (!response.data?.success || !response.data?.user) {
        throw new Error("Invalid response from server.");
      }

      const updatedUser = response.data.user;

      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          ...updatedUser,
        })
      );

      setFormData({
        username: updatedUser.username,
        email: updatedUser.email,
      });

      setSuccessMessage(
        response.data.message || "Profile updated successfully."
      );

      setIsEditing(false);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--bg-primary)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            View and manage your account information.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-7">
          <div className="mb-7 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)]">
                <UserRound
                  size={30}
                  className="text-[var(--primary)]"
                />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-[var(--text-primary)]">
                  {user?.username || "User"}
                </h2>

                <p className="text-sm text-[var(--text-secondary)]">
                  Account Profile
                </p>
              </div>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={handleEdit}
                className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[var(--primary-soft)] px-4 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                <Pencil size={16} />
                Edit Profile
              </button>
            )}
          </div>

          <div className="mb-6 border-t border-[var(--border)]" />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
              >
                Username
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 focus-within:border-[var(--border-focus)]">
                <UserRound
                  size={19}
                  className="shrink-0 text-[var(--text-muted)]"
                />

                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  minLength={3}
                  maxLength={30}
                  required
                  readOnly={!isEditing}
                  autoComplete="username"
                  placeholder="Enter your username"
                  className={`h-12 min-w-0 flex-1 bg-transparent text-sm text-[var(--input-text)] outline-none placeholder:text-[var(--input-placeholder)] ${
                    !isEditing ? "cursor-default" : ""
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
              >
                Email Address
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 focus-within:border-[var(--border-focus)]">
                <Mail
                  size={19}
                  className="shrink-0 text-[var(--text-muted)]"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  readOnly={!isEditing}
                  autoComplete="email"
                  placeholder="Enter your email"
                  className={`h-12 min-w-0 flex-1 bg-transparent text-sm text-[var(--input-text)] outline-none placeholder:text-[var(--input-placeholder)] ${
                    !isEditing ? "cursor-default" : ""
                  }`}
                />
              </div>
            </div>

            {errorMessage && (
              <p
                role="alert"
                className="rounded-lg bg-[var(--surface-hover)] px-3 py-2 text-sm text-[var(--error)]"
              >
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p
                role="status"
                className="rounded-lg bg-[var(--surface-hover)] px-3 py-2 text-sm text-[var(--success)]"
              >
                {successMessage}
              </p>
            )}

            {isEditing && (
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--button-primary)] px-5 text-sm font-medium text-[var(--button-primary-text)] transition-colors hover:bg-[var(--button-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
