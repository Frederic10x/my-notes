"use client";

import { useState, useRef, useEffect, FormEvent, ChangeEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./NoteForm.module.css";
import VoiceRecorder from "./VoiceRecorder";

type InputMode = "text" | "voice";

export default function NoteForm() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("text");

  useEffect(() => {
    if (inputMode === "text") {
      textareaRef.current?.focus();
    }
  }, [inputMode]);

  const autoResize = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    const newHeight = Math.min(Math.max(element.scrollHeight, 100), 400);
    element.style.height = `${newHeight}px`;
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setError("");
    autoResize(e.target);
  };

  const handleVoiceTranscript = useCallback((transcript: string) => {
    setContent(transcript);
    setError("");
  }, []);

  const validateForm = (): boolean => {
    if (content.trim().length < 3) {
      setError("Le contenu doit contenir au moins 3 caractères");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          is_voice_note: inputMode === "voice",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la création de la note");
      }

      router.push("/dashboard?message=Note créée avec succès");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  const isSubmitDisabled = content.trim().length < 3 || loading;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.toggleContainer}>
        <button
          type="button"
          className={`${styles.toggleButton} ${inputMode === "text" ? styles.toggleButtonActive : ""}`}
          onClick={() => setInputMode("text")}
        >
          Ecrire
        </button>
        <button
          type="button"
          className={`${styles.toggleButton} ${inputMode === "voice" ? styles.toggleButtonActive : ""}`}
          onClick={() => setInputMode("voice")}
        >
          Dicter
        </button>
      </div>

      {inputMode === "text" && (
        <div className={styles.textareaContainer}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            className={styles.textarea}
            placeholder="Ecrivez votre note..."
            disabled={loading}
          />
          <span
            className={`${styles.charCount} ${content.trim().length < 3 && content.length > 0 ? styles.charCountError : ""}`}
          >
            {content.length} caractère{content.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {inputMode === "voice" && (
        <VoiceRecorder
          onTranscriptChange={handleVoiceTranscript}
          disabled={loading}
        />
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button
          type="button"
          onClick={handleCancel}
          className={`${styles.button} ${styles.buttonSecondary}`}
          disabled={loading}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`${styles.button} ${styles.buttonPrimary}`}
        >
          {loading && <span className={styles.loadingSpinner} />}
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
