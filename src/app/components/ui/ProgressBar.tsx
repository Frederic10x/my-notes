"use client";

import { useEffect, useState } from "react";
import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  progress: number;
  isActive: boolean;
  onComplete?: () => void;
}

export default function ProgressBar({ progress, isActive, onComplete }: ProgressBarProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (progress >= 100 && onComplete) {
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  if (!visible) return null;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.icon}>✨</span>
          <span className={styles.title}>AI Categorizing Content...</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.percentage}>{Math.round(progress)}%</span>
        </div>
      </div>

      <div className={styles.progressContainer}>
        <div
          className={styles.progressBar}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={styles.footer}>
        <span className={styles.description}>
          Analyzing key themes and action items...
        </span>
        {isActive && <span className={styles.badge}>ACTIVE</span>}
      </div>
    </div>
  );
}
