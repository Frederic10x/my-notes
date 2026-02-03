import Link from "next/link";
import type { Note } from "@/lib/types/notes";
import styles from "./NoteRow.module.css";

interface NoteRowProps {
  note: Note;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

export default function NoteRow({ note }: NoteRowProps) {
  const excerpt = note.content
    ? note.content.replace(/\n/g, " ").substring(0, 60)
    : "";
  const relativeTime = getRelativeTime(new Date(note.updated_at || note.created_at));

  return (
    <Link
      href={`/note/${note.id}`}
      className={styles.row}
      data-category={note.category}
    >
      <div className={styles.colorBar} data-category={note.category} />
      <div className={styles.content}>
        <div className={styles.title}>{note.title}</div>
        {excerpt && <div className={styles.excerpt}>{excerpt}...</div>}
      </div>
      <div className={styles.time}>{relativeTime}</div>
    </Link>
  );
}
