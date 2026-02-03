"use client";

import { Category, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/types/notes";
import styles from "./CategoryBadge.module.css";

interface CategoryBadgeProps {
  category: Category;
  showPriority?: boolean;
}

export default function CategoryBadge({ category, showPriority = false }: CategoryBadgeProps) {
  return (
    <div className={styles.badge} data-category={category}>
      <span className={styles.icon}>{CATEGORY_ICONS[category]}</span>
      <span className={styles.text}>
        {CATEGORY_LABELS[category].toUpperCase()}
        {showPriority && " • HIGH PRIORITY"}
      </span>
    </div>
  );
}
