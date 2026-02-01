"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/dashboard" className={styles.logo}>
          Notes
        </Link>

        <nav className={styles.nav}>
          <Link
            href="/dashboard"
            className={`${styles.navLink} ${pathname === "/dashboard" ? styles.active : ""}`}
          >
            Dashboard
          </Link>
          <Link
            href="/note/new"
            className={`${styles.navLink} ${pathname === "/note/new" ? styles.active : ""}`}
          >
            Nouvelle note
          </Link>
        </nav>

        <button onClick={handleSignOut} className={styles.signOutBtn}>
          Déconnexion
        </button>
      </div>
    </header>
  );
}
