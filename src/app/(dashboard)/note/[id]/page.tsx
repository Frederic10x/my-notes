"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Note, Category, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/types/notes";
import CategoryDropdown from "@/app/components/ui/CategoryDropdown";
import CategoryBadge from "@/app/components/ui/CategoryBadge";
import SearchBar from "@/app/components/ui/SearchBar";
import styles from "./note-detail.module.css";

export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
      setEditedContent(data.content);
      setEditedTitle(data.title);
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

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (!note) return;
    setEditedContent(note.content);
    setEditedTitle(note.title);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!note) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editedContent,
          title: editedTitle,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      const updatedNote = await response.json();
      setNote(updatedNote);
      setIsEditing(false);
      setSuccessMessage("Note mise à jour avec succès");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) {
      return "il y a moins d'une heure";
    } else if (diffInHours < 24) {
      return `il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
    } else if (diffInDays < 7) {
      return `il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
    } else {
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
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
    <div className={styles.pageContainer}>
      {successMessage && (
        <div className={styles.toast}>
          {successMessage}
        </div>
      )}

      {/* Header */}
      <header className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard" className={styles.logo}>
            MindNotes AI
          </Link>
          <div className={styles.breadcrumb}>
            <Link href="/dashboard">My Notes</Link>
            <span className={styles.breadcrumbSeparator}>{">"}</span>
            <span className={styles.breadcrumbCurrent}>{note.title}</span>
          </div>
        </div>

        <div className={styles.headerCenter}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search notes..."
          />
        </div>

        <div className={styles.headerRight}>
          <Link href="/dashboard" className={styles.dashboardButton}>
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Column - Note Content */}
        <div className={styles.leftColumn}>
          {/* Category Badge */}
          <CategoryBadge category={note.category} />

          {/* Title */}
          {isEditing ? (
            <input
              type="text"
              className={styles.titleInput}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Titre de la note"
            />
          ) : (
            <h1 className={styles.noteTitle}>{note.title}</h1>
          )}

          {/* Metadata Line */}
          <p className={styles.metadataLine}>
            Last edited {formatDate(note.updated_at)}
          </p>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            {isEditing ? (
              <>
                <button
                  className={styles.saveButton}
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  className={styles.editButton}
                  onClick={handleEditClick}
                >
                  Edit Note
                </button>
                <button
                  className={styles.iconButton}
                  aria-label="Archive note"
                  title="Archive"
                >
                  📁
                </button>
                <button
                  className={styles.iconButton}
                  onClick={() => setShowDeleteModal(true)}
                  aria-label="Delete note"
                  title="Delete"
                >
                  🗑️
                </button>
              </>
            )}
          </div>

          {/* Note Content */}
          <div className={styles.contentCard}>
            {isEditing ? (
              <textarea
                className={styles.contentTextarea}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Contenu de la note..."
              />
            ) : (
              <div className={styles.noteContent}>
                {note.content.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph || "\u00A0"}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Metadata */}
        <aside className={styles.rightColumn}>
          <div className={styles.metadataCard}>
            <h3 className={styles.metadataTitle}>Note Metadata</h3>

            <div className={styles.metadataSection}>
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Created</span>
                <span className={styles.metadataValue}>
                  {new Date(note.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>

              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Owner</span>
                <span className={styles.metadataValue}>You</span>
              </div>

              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Visibility</span>
                <span className={styles.metadataValue}>Private</span>
              </div>
            </div>

            <div className={styles.categorySection}>
              <label className={styles.categoryLabel}>CATEGORY</label>
              <CategoryDropdown
                currentCategory={note.category}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Delete Modal */}
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
