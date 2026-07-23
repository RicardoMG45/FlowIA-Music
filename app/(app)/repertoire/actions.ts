"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const validStatuses = [
  "new",
  "learning",
  "needs_rehearsal",
  "ready",
  "mastered",
];

export async function updateSongStatus(
  songId: string,
  status: string
) {
  if (!validStatuses.includes(status)) {
    throw new Error("Estado inválido.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("songs")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", songId);

  if (error) {
    console.error("Status update error:", error);
    throw new Error(
      `No se pudo actualizar el estado: ${error.message}`
    );
  }

  revalidatePath("/repertoire");
  revalidatePath("/dashboard");
}