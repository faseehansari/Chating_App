
import { useState } from "react";
import Login from "./Login";
import Register from "./Register";

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4 py-8 sm:px-6">
      <section className="w-full max-w-md rounded-2xl bg-[var(--surface)] p-5 shadow-[var(--shadow)] sm:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            ChatApp
          </h1>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Connect and chat with your friends
          </p>
        </header>

        <div className="mb-6 grid grid-cols-2 rounded-xl bg-[var(--bg-secondary)] p-1">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === "login"
                ? "bg-[var(--surface)] text-[var(--primary)] shadow-[var(--shadow)]"
                : "text-[var(--text-secondary)]"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={`rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === "register"
                ? "bg-[var(--surface)] text-[var(--primary)] shadow-[var(--shadow)]"
                : "text-[var(--text-secondary)]"
            }`}
          >
            Register
          </button>
        </div>

        {activeTab === "login" ? <Login /> : <Register />}
      </section>
    </main>
  );
};

export default AuthForm;
