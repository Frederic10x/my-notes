"use client";

import { useState } from "react";
import { Category, CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/types/notes";
import styles from "./CategoryDropdown.module.css";

interface CategoryDropdownProps {
  currentCategory: Category;
  onCategoryChange: (category: Category) => void;
  expanded?: boolean;
}

export default function CategoryDropdown({
  currentCategory,
  onCategoryChange,
  expanded = false,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(expanded);

  const categories = Object.values(CATEGORIES) as Category[];

  const handleSelect = (category: Category) => {
    if (category !== currentCategory) {
      onCategoryChange(category);
    }
    setIsOpen(false);
  };

  if (expanded) {
    return (
      <div className={styles.expandedContainer}>
        {categories.map((category) => (
          <button
            key={category}
            className={`${styles.expandedOption} ${category === currentCategory ? styles.expandedOptionActive : ""}`}
            data-category={category}
            onClick={() => handleSelect(category)}
          >
            <span className={styles.icon}>{CATEGORY_ICONS[category]}</span>
            <span className={styles.label}>{CATEGORY_LABELS[category]}</span>
            {category === currentCategory && (
              <span className={styles.checkmark}>✓</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={styles.triggerContent}>
          <span className={styles.icon}>{CATEGORY_ICONS[currentCategory]}</span>
          <span>{CATEGORY_LABELS[currentCategory]}</span>
        </span>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
          <div className={styles.dropdown} role="listbox">
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.option} ${category === currentCategory ? styles.optionActive : ""}`}
                data-category={category}
                onClick={() => handleSelect(category)}
                role="option"
                aria-selected={category === currentCategory}
              >
                <span className={styles.icon}>{CATEGORY_ICONS[category]}</span>
                <span className={styles.label}>{CATEGORY_LABELS[category]}</span>
                {category === currentCategory && (
                  <span className={styles.checkmark}>✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
