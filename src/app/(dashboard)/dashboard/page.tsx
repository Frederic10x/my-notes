import { Suspense } from "react";
import { cookies } from "next/headers";
import NotesList from "@/app/components/ui/NotesList";
import type { Note, Category } from "@/lib/types/notes";
import styles from "./page.module.css";

const NOTES_PER_PAGE = 12;

interface NotesResponse {
  notes: Note[];
  total: number;
}

async function fetchNotes(
  search: string,
  category: Category | null,
  page: number,
): Promise<NotesResponse> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  params.set("limit", NOTES_PER_PAGE.toString());
  params.set("offset", ((page - 1) * NOTES_PER_PAGE).toString());

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/notes?${params.toString()}`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des notes");
  }

  return response.json();
}

function LoadingFallback() {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>Chargement des notes...</p>
    </div>
  );
}

interface DashboardPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

async function DashboardContent({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const category = (params.category as Category) || null;
  const page = parseInt(params.page || "1", 10);

  let notes: Note[] = [];
  let total = 0;
  let fetchError = false;

  try {
    const result = await fetchNotes(search, category, page);
    notes = result.notes;
    total = result.total;
  } catch (error) {
    fetchError = true;
  }

  if (fetchError) {
    return (
      <div className={styles.error}>
        <span>❌</span>
        <p>Impossible de charger les notes</p>
      </div>
    );
  }

  return (
    <NotesList
      initialNotes={notes}
      initialTotal={total}
      initialSearch={search}
      initialCategory={category}
      initialPage={page}
      limit={NOTES_PER_PAGE}
    />
  );
}

export default async function DashboardPage(props: DashboardPageProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mes notes</h1>
      <Suspense fallback={<LoadingFallback />}>
        <DashboardContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
