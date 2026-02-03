"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "./SearchBar";
import CategoryFilter from "./CategoryFilter";
import NoteCard from "./NoteCard";
import NoteRow from "./NoteRow";
import type { Note, Category } from "@/lib/types/notes";
import styles from "./NotesList.module.css";

interface NotesListProps {
  initialNotes: Note[];
  initialTotal: number;
  initialSearch: string;
  initialCategory: Category | null;
  initialPage: number;
  limit: number;
}

export default function NotesList({
  initialNotes,
  initialTotal,
  initialSearch,
  initialCategory,
  initialPage,
  limit,
}: NotesListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [notes, setNotes] = useState(initialNotes);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState<Category | null>(initialCategory);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / limit);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      params.set("limit", limit.toString());
      params.set("offset", ((page - 1) * limit).toString());

      const response = await fetch(`/api/notes?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des notes");
      }

      const data = await response.json();
      setNotes(data.notes);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }, [search, category, page, limit]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (page > 1) params.set("page", page.toString());

    const newUrl = params.toString() ? `?${params.toString()}` : "/dashboard";
    router.replace(newUrl, { scroll: false });
  }, [search, category, page, router]);

  useEffect(() => {
    const isInitialLoad =
      search === initialSearch &&
      category === initialCategory &&
      page === initialPage;

    if (!isInitialLoad) {
      fetchNotes();
    }
  }, [search, category, page, fetchNotes, initialSearch, initialCategory, initialPage]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value: Category | null) => {
    setCategory(value);
    setPage(1);
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className={styles.container}>
      {/* Desktop: Header avec SearchBar centrée */}
      <div className={styles.desktopHeader}>
        <div className={styles.searchWrapper}>
          <SearchBar value={search} onChange={handleSearchChange} placeholder="Search your notes..." />
        </div>
      </div>

      {/* Mobile: Filters */}
      <div className={styles.filters}>
        <SearchBar value={search} onChange={handleSearchChange} />
        <CategoryFilter value={category} onChange={handleCategoryChange} />
      </div>

      {/* Desktop: Section Title */}
      <div className={styles.titleSection}>
        <div className={styles.titleContent}>
          <h2>Recent Notes</h2>
          <p>Organized by AI for professionals</p>
        </div>
        <div className={styles.titleActions}>
          <button className={styles.actionButton}>
            <span>↕</span>
            Sort
          </button>
          <button className={styles.actionButton}>
            <span>⊞</span>
            Layout
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <span>❌</span>
          <p>{error}</p>
          <button onClick={fetchNotes}>Réessayer</button>
        </div>
      )}

      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Chargement...</p>
        </div>
      )}

      {!isLoading && !error && notes.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📝</span>
          <p>Aucune note. Créez-en une !</p>
        </div>
      )}

      {!isLoading && !error && notes.length > 0 && (
        <>
          <div className={styles.gridDesktop}>
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>

          <div className={styles.listMobile}>
            {notes.map((note) => (
              <NoteRow key={note.id} note={note} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationButton}
                onClick={handlePreviousPage}
                disabled={page === 1}
              >
                ← Précédent
              </button>
              <span className={styles.paginationInfo}>
                Page {page} sur {totalPages}
              </span>
              <button
                className={styles.paginationButton}
                onClick={handleNextPage}
                disabled={page === totalPages}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
