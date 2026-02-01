import NoteForm from "@/app/components/forms/NoteForm";
import styles from "./page.module.css";

export default function NewNotePage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Nouvelle note</h1>
        <NoteForm />
      </div>
    </div>
  );
}
