import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { CATEGORY_LABELS, type Note } from "@/lib/types/notes";
import styles from "./NoteCard.module.css";

interface NoteCardProps {
  note: Note;
}

function truncateContent(content: string, maxLength: number = 150): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trim() + "...";
}

function getCategoryClassName(category: string): string {
  switch (category) {
    case "todo":
      return styles.todo;
    case "done":
      return styles.done;
    case "recurring":
      return styles.recurring;
    case "waiting_followup":
      return styles.waitingFollowup;
    default:
      return styles.todo;
  }
}

export default function NoteCard({ note }: NoteCardProps) {
  const relativeDate = formatDistanceToNow(new Date(note.updated_at), {
    addSuffix: false,
    locale: fr,
  });

  return (
    <Link href={`/note/${note.id}`} className={styles.card}>
      <div className={styles.header}>
        <span className={`${styles.badge} ${getCategoryClassName(note.category)}`}>
          {CATEGORY_LABELS[note.category]}
        </span>
        <button
          className={styles.menu}
          onClick={(e) => {
            e.preventDefault();
            // TODO: Ouvrir le menu contextuel
          }}
          aria-label="Menu"
        >
          ⋯
        </button>
      </div>
      <h3 className={styles.title}>{note.title}</h3>
      <p className={styles.content}>{truncateContent(note.content)}</p>
      <div className={styles.footer}>
        <span className={styles.date}>Updated {relativeDate}</span>
      </div>
    </Link>
  );
}
