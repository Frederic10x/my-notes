import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { CATEGORY_ICONS, CATEGORY_LABELS, type Note } from "@/lib/types/notes";
import styles from "./NoteRow.module.css";

interface NoteRowProps {
  note: Note;
}

export default function NoteRow({ note }: NoteRowProps) {
  const relativeDate = formatDistanceToNow(new Date(note.created_at), {
    addSuffix: true,
    locale: fr,
  });

  const shortLabel = note.category === "waiting_followup" ? "Attente" : CATEGORY_LABELS[note.category];

  return (
    <Link href={`/note/${note.id}`} className={styles.row} data-category={note.category}>
      <span className={styles.icon}>{CATEGORY_ICONS[note.category]}</span>
      <span className={styles.title}>{note.title}</span>
      <span className={styles.label}>{shortLabel}</span>
      <span className={styles.date}>{relativeDate}</span>
    </Link>
  );
}
