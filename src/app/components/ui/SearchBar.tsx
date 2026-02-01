"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Rechercher une note...",
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedOnChange = useCallback(
    (newValue: string) => {
      const timeoutId = setTimeout(() => {
        onChange(newValue);
      }, 300);
      return () => clearTimeout(timeoutId);
    },
    [onChange]
  );

  useEffect(() => {
    const cleanup = debouncedOnChange(localValue);
    return cleanup;
  }, [localValue, debouncedOnChange]);

  return (
    <div className={styles.container}>
      <span className={styles.icon}>🔍</span>
      <input
        type="text"
        className={styles.input}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
      />
      {localValue && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => setLocalValue("")}
          aria-label="Effacer la recherche"
        >
          ✕
        </button>
      )}
    </div>
  );
}
