import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { CATEGORY_ICONS, type Note } from "@/lib/types/notes";
import styles from "./NoteCard.module.css";

interface NoteCardProps {
  note: Note;
}

function truncateContent(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trim() + "...";
}

export default function NoteCard({ note }: NoteCardProps) {
  const relativeDate = formatDistanceToNow(new Date(note.created_at), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <Link href={`/note/${note.id}`} className={styles.card} data-category={note.category}>
      <div className={styles.header}>
        <span className={styles.icon}>{CATEGORY_ICONS[note.category]}</span>
        <span className={styles.date}>{relativeDate}</span>
      </div>
      <h3 className={styles.title}>{note.title}</h3>
      <p className={styles.content}>{truncateContent(note.content)}</p>
    </Link>
  );
}
