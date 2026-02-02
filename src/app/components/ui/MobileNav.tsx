"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./MobileNav.module.css";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.mobileNav}>
      <Link
        href="/dashboard"
        className={`${styles.navItem} ${pathname === "/dashboard" ? styles.active : ""}`}
      >
        <span className={styles.icon}>📋</span>
        <span className={styles.label}>Dashboard</span>
      </Link>
      <Link
        href="/note/new"
        className={`${styles.navItem} ${pathname === "/note/new" ? styles.active : ""}`}
      >
        <span className={styles.icon}>➕</span>
        <span className={styles.label}>Nouvelle note</span>
      </Link>
    </nav>
  );
}
