"use client";

import { CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS, type Category } from "@/lib/types/notes";
import styles from "./CategoryFilter.module.css";

interface CategoryFilterProps {
  value: Category | null;
  onChange: (category: Category | null) => void;
}

const categories = [
  { value: null, label: "All", icon: "📝" },
  { value: CATEGORIES.TODO, label: "Todo", icon: CATEGORY_ICONS.todo },
  { value: CATEGORIES.DONE, label: "Done", icon: CATEGORY_ICONS.done },
  { value: CATEGORIES.RECURRING, label: "Recurring", icon: CATEGORY_ICONS.recurring },
  { value: CATEGORIES.WAITING_FOLLOWUP, label: "Pending", icon: CATEGORY_ICONS.waiting_followup },
] as const;

export default function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {categories.map((cat) => (
          <button
            key={cat.value ?? "all"}
            type="button"
            className={`${styles.tab} ${value === cat.value ? styles.active : ""}`}
            onClick={() => onChange(cat.value)}
            data-category={cat.value ?? "all"}
          >
            <span className={styles.icon}>{cat.icon}</span>
            <span className={styles.label}>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
