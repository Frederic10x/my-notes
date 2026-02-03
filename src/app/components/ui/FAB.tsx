import Link from "next/link";
import styles from "./FAB.module.css";

export default function FAB() {
  return (
    <Link href="/note/new" className={styles.fab} aria-label="Create new note">
      <span className={styles.icon}>+</span>
    </Link>
  );
}
