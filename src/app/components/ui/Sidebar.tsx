"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/types/notes";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const isActive = (category: string | null) => {
    if (category === null) {
      return !currentCategory && pathname === "/dashboard";
    }
    return currentCategory === category;
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>📝</span>
          <span className={styles.logoText}>NotesApp</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>WORKSPACE</h3>
          <ul className={styles.menu}>
            <li>
              <Link
                href="/dashboard"
                className={`${styles.menuItem} ${isActive(null) ? styles.active : ""}`}
              >
                <span className={styles.menuIcon}>📋</span>
                <span className={styles.menuLabel}>All Notes</span>
              </Link>
            </li>
            <li>
              <Link
                href={`/dashboard?category=${CATEGORIES.TODO}`}
                className={`${styles.menuItem} ${isActive(CATEGORIES.TODO) ? styles.active : ""}`}
              >
                <span className={styles.menuIcon}>☐</span>
                <span className={styles.menuLabel}>To-do</span>
              </Link>
            </li>
            <li>
              <Link
                href={`/dashboard?category=${CATEGORIES.DONE}`}
                className={`${styles.menuItem} ${isActive(CATEGORIES.DONE) ? styles.active : ""}`}
              >
                <span className={styles.menuIcon}>✓</span>
                <span className={styles.menuLabel}>Done</span>
              </Link>
            </li>
            <li>
              <Link
                href={`/dashboard?category=${CATEGORIES.RECURRING}`}
                className={`${styles.menuItem} ${isActive(CATEGORIES.RECURRING) ? styles.active : ""}`}
              >
                <span className={styles.menuIcon}>↻</span>
                <span className={styles.menuLabel}>Recurring</span>
              </Link>
            </li>
            <li>
              <Link
                href={`/dashboard?category=${CATEGORIES.WAITING_FOLLOWUP}`}
                className={`${styles.menuItem} ${isActive(CATEGORIES.WAITING_FOLLOWUP) ? styles.active : ""}`}
              >
                <span className={styles.menuIcon}>👥</span>
                <span className={styles.menuLabel}>Follow-up</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>AI HELPER</h3>
          <div className={styles.aiHelperPlaceholder}>
            {/* Placeholder pour future fonctionnalité */}
          </div>
        </div>
      </nav>
    </aside>
  );
}
