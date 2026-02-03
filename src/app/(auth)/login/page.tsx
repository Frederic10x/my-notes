"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const validateForm = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Veuillez entrer un email valide");
      return false;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email ou mot de passe incorrect");
      setPassword("");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>✨</span>
          <span>Notes App</span>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <span className={styles.cardIcon}>⚡</span>
          </div>

          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Access your AI-powered workspace</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>✉</span>
                <input
                  ref={emailRef}
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  placeholder="professional@example.com"
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="password" className={styles.label}>
                  Password
                </label>
                <a href="#" className={styles.forgotPassword}>
                  Forgot password?
                </a>
              </div>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🔒</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁" : "👁"}
                </button>
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={styles.button}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2024 Notes App. Designed for professionals who think fast.</p>
        <div className={styles.footerLinks}>
          <a href="#" className={styles.footerLink}>Privacy Policy</a>
          <a href="#" className={styles.footerLink}>Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
