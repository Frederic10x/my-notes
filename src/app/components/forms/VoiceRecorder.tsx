"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./VoiceRecorder.module.css";

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void;
  disabled?: boolean;
}

type RecordingState = "idle" | "recording" | "processing";

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function VoiceRecorder({
  onTranscriptChange,
  disabled = false,
}: VoiceRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState("");
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());

  const SILENCE_TIMEOUT = 60000; // 60 seconds

  const clearSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);

  const resetSilenceTimeout = useCallback(() => {
    clearSilenceTimeout();
    lastSpeechTimeRef.current = Date.now();
    silenceTimeoutRef.current = setTimeout(() => {
      if (recognitionRef.current && recordingState === "recording") {
        stopRecording();
      }
    }, SILENCE_TIMEOUT);
  }, [clearSilenceTimeout, recordingState]);

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "fr-FR";

    recognition.onstart = () => {
      setRecordingState("recording");
      setError("");
      resetSilenceTimeout();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      resetSilenceTimeout();

      let finalTranscript = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => {
          const newTranscript = prev + finalTranscript;
          onTranscriptChange(newTranscript);
          return newTranscript;
        });
      }

      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      clearSilenceTimeout();

      switch (event.error) {
        case "not-allowed":
          setError(
            "Accès au microphone refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur."
          );
          break;
        case "no-speech":
          setError("Aucune parole détectée. Veuillez réessayer.");
          break;
        case "network":
          setError(
            "Erreur réseau. Vérifiez votre connexion et réessayez."
          );
          break;
        case "audio-capture":
          setError(
            "Aucun microphone détecté. Veuillez vérifier votre matériel."
          );
          break;
        default:
          setError(`Erreur: ${event.error}. Veuillez réessayer.`);
      }

      setRecordingState("idle");
    };

    recognition.onend = () => {
      clearSilenceTimeout();
      if (recordingState === "recording") {
        setRecordingState("processing");
        setTimeout(() => {
          setRecordingState("idle");
          setInterimTranscript("");
        }, 500);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearSilenceTimeout();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    onTranscriptChange(transcript);
  }, [transcript, onTranscriptChange]);

  const startRecording = async () => {
    if (!recognitionRef.current || disabled) return;

    setError("");
    setTranscript("");
    setInterimTranscript("");
    onTranscriptChange("");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current.start();
    } catch {
      setError(
        "Impossible d'accéder au microphone. Veuillez vérifier les permissions."
      );
    }
  };

  const stopRecording = () => {
    clearSilenceTimeout();
    if (recognitionRef.current && recordingState === "recording") {
      setRecordingState("processing");
      recognitionRef.current.stop();
    }
  };

  if (!isSupported) {
    return (
      <div className={styles.container}>
        <div className={styles.unsupported}>
          <svg
            className={styles.warningIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p>
            La dictée vocale n&apos;est pas supportée par votre navigateur.
            <br />
            Veuillez utiliser Chrome, Edge ou Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.transcriptArea}>
        {transcript || interimTranscript ? (
          <p className={styles.transcriptText}>
            {transcript}
            {interimTranscript && (
              <span className={styles.interimText}>{interimTranscript}</span>
            )}
          </p>
        ) : (
          <p className={styles.placeholder}>
            {recordingState === "idle"
              ? "Cliquez sur le micro pour commencer la dictée..."
              : recordingState === "recording"
                ? "Parlez maintenant..."
                : "Traitement en cours..."}
          </p>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.controls}>
        {recordingState === "idle" ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className={styles.micButton}
            aria-label="Démarrer l'enregistrement"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        ) : recordingState === "recording" ? (
          <>
            <div className={styles.recordingIndicator}>
              <span className={styles.pulsingDot} />
              <span className={styles.recordingText}>Enregistrement...</span>
            </div>
            <button
              type="button"
              onClick={stopRecording}
              className={`${styles.micButton} ${styles.micButtonRecording}`}
              aria-label="Arrêter l'enregistrement"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          </>
        ) : (
          <div className={styles.processingIndicator}>
            <span className={styles.processingSpinner} />
            <span>Finalisation...</span>
          </div>
        )}
      </div>

      {recordingState === "idle" && (transcript || error) && (
        <button
          type="button"
          onClick={() => {
            setTranscript("");
            setInterimTranscript("");
            setError("");
            onTranscriptChange("");
          }}
          className={styles.clearButton}
        >
          Effacer et recommencer
        </button>
      )}
    </div>
  );
}
