"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Note } from "@/lib/types/notes";
import styles from "./SearchModal.module.css";

interface SearchModalProps {
  onClose: () => void;
}

export default function SearchModal({ onClose }: SearchModalProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchResults = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes?search=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.notes);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, fetchResults]);

  const handleNoteClick = (noteId: string) => {
    router.push(`/note/${noteId}`);
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.input}
            autoFocus
          />
          <button onClick={onClose} className={styles.closeButton} type="button">
            <svg
              className={styles.closeIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className={styles.results}>
          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>Searching...</p>
            </div>
          )}

          {!isLoading && search && results.length === 0 && (
            <div className={styles.empty}>
              <p>No results found</p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className={styles.list}>
              {results.map((note) => (
                <button
                  key={note.id}
                  onClick={() => handleNoteClick(note.id)}
                  className={styles.resultItem}
                  type="button"
                >
                  <div className={styles.resultTitle}>{note.title}</div>
                  {note.content && (
                    <div className={styles.resultContent}>
                      {note.content.substring(0, 100)}
                      {note.content.length > 100 ? "..." : ""}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
