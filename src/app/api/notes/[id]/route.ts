import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Note, UpdateNoteInput } from "@/lib/types/notes";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Format UUID invalide" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: note, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Note introuvable" },
          { status: 404 }
        );
      }
      console.error("Erreur Supabase:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération de la note" },
        { status: 500 }
      );
    }

    return NextResponse.json(note as Note);
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Format UUID invalide" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body: UpdateNoteInput = await request.json();
    const { category, title, content } = body;

    // Vérifier qu'au moins un champ est fourni
    if (
      category === undefined &&
      title === undefined &&
      content === undefined
    ) {
      return NextResponse.json(
        { error: "Au moins un champ à modifier est requis" },
        { status: 400 }
      );
    }

    // Construire l'objet de mise à jour avec uniquement les champs fournis
    const updateData: Partial<UpdateNoteInput> = {};
    if (category !== undefined) updateData.category = category;
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    const { data: note, error } = await supabase
      .from("notes")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Note introuvable" },
          { status: 404 }
        );
      }
      console.error("Erreur Supabase:", error);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour de la note" },
        { status: 500 }
      );
    }

    return NextResponse.json(note as Note);
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Format UUID invalide" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier que la note existe et appartient à l'utilisateur
    const { data: existingNote, error: fetchError } = await supabase
      .from("notes")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingNote) {
      return NextResponse.json({ error: "Note introuvable" }, { status: 404 });
    }

    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (error) {
      console.error("Erreur Supabase:", error);
      return NextResponse.json(
        { error: "Erreur lors de la suppression de la note" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
