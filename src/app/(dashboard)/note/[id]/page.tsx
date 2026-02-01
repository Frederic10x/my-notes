"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Note, Category, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/types/notes";
import CategoryDropdown from "@/app/components/ui/CategoryDropdown";
import styles from "./page.module.css";

export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchNote = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/notes/${noteId}`);

      if (response.status === 404) {
        setError("Note introuvable");
        return;
      }

      if (response.status === 403) {
        setError("Vous n'avez pas accès à cette note");
        return;
      }

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de la note");
      }

      const data = await response.json();
      setNote(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${styles.menuContainer}`)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleCategoryChange = async (newCategory: Category) => {
    if (!note) return;

    const previousCategory = note.category;

    // Optimistic update
    setNote({ ...note, category: newCategory });
    setShowCategoryDropdown(false);
    setIsMenuOpen(false);

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category: newCategory }),
      });

      if (!response.ok) {
        // Revert on error
        setNote({ ...note, category: previousCategory });
        throw new Error("Erreur lors de la mise à jour");
      }

      const updatedNote = await response.json();
      setNote(updatedNote);
      setSuccessMessage("Catégorie mise à jour avec succès");
    } catch (err) {
      setNote({ ...note, category: previousCategory });
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p className={styles.errorMessage}>{error}</p>
          <Link href="/dashboard" className={styles.backButton}>
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className={styles.container}>
      {successMessage && (
        <div className={styles.toast}>
          {successMessage}
        </div>
      )}

      <header className={styles.header}>
        <Link href="/dashboard" className={styles.backButton}>
          ← Retour
        </Link>

        <div className={styles.menuContainer}>
          <button
            className={styles.menuButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu actions"
          >
            ⋮
          </button>

          {isMenuOpen && (
            <div className={styles.menuDropdown}>
              <button
                className={styles.menuItem}
                onClick={() => {
                  setShowCategoryDropdown(true);
                  setIsMenuOpen(false);
                }}
              >
                Changer catégorie
              </button>
              <button
                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                onClick={() => {
                  setShowDeleteModal(true);
                  setIsMenuOpen(false);
                }}
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      </header>

      <article className={styles.noteContent}>
        <div className={styles.noteHeader}>
          <h1 className={styles.title}>{note.title}</h1>

          <div className={styles.meta}>
            <span
              className={styles.categoryBadge}
              data-category={note.category}
            >
              {CATEGORY_ICONS[note.category]} {CATEGORY_LABELS[note.category]}
            </span>
            <span className={styles.date}>{formatDate(note.created_at)}</span>
          </div>
        </div>

        <div className={styles.content}>
          {note.content.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph || "\u00A0"}</p>
          ))}
        </div>

        <div className={styles.desktopActions}>
          <CategoryDropdown
            currentCategory={note.category}
            onCategoryChange={handleCategoryChange}
          />
          <button
            className={styles.deleteButton}
            onClick={() => setShowDeleteModal(true)}
          >
            Supprimer la note
          </button>
        </div>
      </article>

      {showCategoryDropdown && (
        <div className={styles.modalOverlay} onClick={() => setShowCategoryDropdown(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Changer de catégorie</h2>
            <CategoryDropdown
              currentCategory={note.category}
              onCategoryChange={handleCategoryChange}
              expanded
            />
            <button
              className={styles.modalCancel}
              onClick={() => setShowCategoryDropdown(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => !isDeleting && setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Supprimer la note ?</h2>
            <p className={styles.modalText}>
              Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancel}
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                className={styles.modalConfirm}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
