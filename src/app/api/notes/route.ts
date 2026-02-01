import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Note } from "@/lib/types/notes";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query = supabase
      .from("notes")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: notes, count, error } = await query;

    if (error) {
      console.error("Erreur Supabase:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des notes" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      notes: notes as Note[],
      total: count ?? 0,
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { content, is_voice_note = false } = body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { error: "Le contenu est requis" },
        { status: 400 },
      );
    }

    // Appeler l'API de catégorisation
    const categorizeResponse = await fetch(
      new URL("/api/categorize", request.url),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      },
    );

    if (!categorizeResponse.ok) {
      console.error("Erreur catégorisation:", await categorizeResponse.text());
      return NextResponse.json(
        { error: "Erreur lors de la catégorisation" },
        { status: 500 },
      );
    }

    const { category, title } = await categorizeResponse.json();

    const { data: note, error } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        title,
        content: content.trim(),
        category,
        is_voice_note,
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur Supabase:", error);
      return NextResponse.json(
        { error: "Erreur lors de la création de la note" },
        { status: 500 },
      );
    }

    return NextResponse.json(note as Note, { status: 201 });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 },
    );
  }
}
