"use client";

import { useState, useRef, useEffect, FormEvent, ChangeEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./NoteForm.module.css";
import ProgressBar from "../ui/ProgressBar";

export default function NoteForm() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Progress bar state
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const autoResize = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  const startProgressAnimation = (fromProgress: number, toProgress: number, duration: number) => {
    const startTime = Date.now();
    const progressDiff = toProgress - fromProgress;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentProgress = fromProgress + progressDiff * progress;

      setProgress(currentProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setError("");
    autoResize(e.target);

    // Reset and start idle timer
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    if (e.target.value.trim().length > 0) {
      setShowProgress(false);
      setProgress(0);
      setIsAnalyzing(false);

      idleTimerRef.current = setTimeout(() => {
        setShowProgress(true);
        setIsAnalyzing(true);
        startProgressAnimation(0, 30, 2000);
      }, 1000);
    } else {
      setShowProgress(false);
      setProgress(0);
      setIsAnalyzing(false);
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

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

    // Start save progress animation
    if (showProgress) {
      startProgressAnimation(progress, 100, 1500);
    }

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          title: title.trim() || undefined,
          is_voice_note: false,
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
      setShowProgress(false);
      setProgress(0);
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  const toggleRecording = async () => {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob);

        try {
          setLoading(true);
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Erreur lors de la transcription");
          }

          const data = await response.json();
          setContent((prev) => prev + (prev ? " " : "") + data.text);
          if (textareaRef.current) {
            autoResize(textareaRef.current);
          }
        } catch (err) {
          setError("Erreur lors de la transcription");
        } finally {
          setLoading(false);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      setError("Impossible d'accéder au microphone");
    }
  };

  const isSubmitDisabled = content.trim().length < 3 || loading;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>📝</span>
            <span className={styles.logoText}>NoteFlow</span>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className={styles.backButton}
            disabled={loading}
          >
            ← Back
          </button>
        </div>
        <div className={styles.headerRight}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={styles.saveButton}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className={styles.content}>
        {/* Title */}
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          className={styles.titleInput}
          placeholder="Product Strategy Q3"
          disabled={loading}
        />

        {/* Last edited */}
        <div className={styles.lastEdited}>
          <span className={styles.calendarIcon}>📅</span>
          <span className={styles.lastEditedText}>LAST EDITED JUST NOW</span>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <ProgressBar
            progress={progress}
            isActive={isAnalyzing}
            onComplete={() => {
              setShowProgress(false);
              setProgress(0);
              setIsAnalyzing(false);
            }}
          />
        )}

        {/* Main Textarea */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            className={styles.textarea}
            placeholder="Start typing your brilliance..."
            disabled={loading}
          />

          {error && <p className={styles.error}>{error}</p>}
        </form>

        {/* Voice Recording Button (Floating) */}
        <button
          type="button"
          onClick={toggleRecording}
          className={`${styles.voiceButton} ${isRecording ? styles.voiceButtonActive : ""}`}
          disabled={loading}
          title={isRecording ? "Stop recording" : "Start voice recording"}
        >
          {isRecording ? "⏹" : "🎤"}
        </button>
      </div>
    </div>
  );
}
