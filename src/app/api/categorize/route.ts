import { NextRequest, NextResponse } from "next/server";
import { categorizeNote } from "@/lib/groq/client";
import { CATEGORIES, type Category } from "@/lib/types/notes";

const TIMEOUT_MS = 10000;
const VALID_CATEGORIES = Object.values(CATEGORIES);

interface CategorizeResult {
  category: Category;
  title: string;
}

function isValidCategory(category: unknown): category is Category {
  return typeof category === "string" && VALID_CATEGORIES.includes(category as Category);
}

function isValidResult(result: unknown): result is CategorizeResult {
  if (typeof result !== "object" || result === null) return false;
  const obj = result as Record<string, unknown>;
  return (
    isValidCategory(obj.category) &&
    typeof obj.title === "string" &&
    obj.title.length > 0
  );
}

function createFallback(content: string): CategorizeResult {
  return {
    category: CATEGORIES.TODO,
    title: content.trim().slice(0, 60),
  };
}

async function callWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Timeout")), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { error: "Le contenu est requis" },
        { status: 400 }
      );
    }

    let lastError: unknown;

    // Tentative avec retry
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await callWithTimeout(
          categorizeNote(content),
          TIMEOUT_MS
        );

        if (isValidResult(result)) {
          return NextResponse.json({
            category: result.category,
            title: result.title.slice(0, 60),
          });
        }

        lastError = new Error("Réponse Groq invalide");
      } catch (error) {
        lastError = error;
        if (attempt === 0) {
          console.warn("Tentative 1 échouée, retry...", error);
        }
      }
    }

    // Fallback après échec
    console.error("Échec après retry, utilisation du fallback:", lastError);
    return NextResponse.json(createFallback(content));
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
