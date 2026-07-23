"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function updateSong(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString().trim();

  if (!id || !title) {
    throw new Error("Faltan datos obligatorios.");
  }

  const durationValue = formData
    .get("duration_minutes")
    ?.toString()
    .trim();

  const { error } = await supabase
    .from("songs")
    .update({
      title,
      artist: nullableString(formData.get("artist")),
      genre: nullableString(formData.get("genre")),
      status: formData.get("status")?.toString() ?? "new",
      musical_key: nullableString(formData.get("musical_key")),
      lead_vocal: nullableString(formData.get("lead_vocal")),
      duration_minutes:
        durationValue && durationValue.length > 0
          ? Number(durationValue)
          : null,
      notes: nullableString(formData.get("notes")),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Song update error:", error);
    throw new Error(`No se pudo actualizar: ${error.message}`);
  }

  revalidatePath("/repertoire");
  revalidatePath("/dashboard");

  redirect("/repertoire");
}

export async function deleteSong(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id")?.toString();

  if (!id) {
    throw new Error("No se encontró la canción.");
  }

  const { error } = await supabase
    .from("songs")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Song delete error:", error);
    throw new Error(`No se pudo eliminar: ${error.message}`);
  }

  revalidatePath("/repertoire");
  revalidatePath("/dashboard");

  redirect("/repertoire");
}

function nullableString(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  return text ? text : null;
}