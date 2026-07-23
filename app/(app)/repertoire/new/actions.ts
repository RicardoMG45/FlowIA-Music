"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function createSong(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title")?.toString().trim();

  if (!title) {
    throw new Error("El nombre de la canción es obligatorio.");
  }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", "blue-rose")
    .single();

  if (organizationError || !organization) {
    console.error("Organization error:", organizationError);
    throw new Error("No se pudo encontrar Blue Rose.");
  }

  const durationValue = formData
    .get("duration_minutes")
    ?.toString()
    .trim();

  const durationMinutes =
    durationValue && durationValue.length > 0
      ? Number(durationValue)
      : null;

  const { error } = await supabase
    .from("songs")
    .insert({
      organization_id: organization.id,

      title,
      artist: nullableString(formData.get("artist")),
      genre: nullableString(formData.get("genre")),

      status:
        formData.get("status")?.toString() || "new",

      musical_key: nullableString(
        formData.get("musical_key")
      ),

      lead_vocal: nullableString(
        formData.get("lead_vocal")
      ),

      duration_minutes: durationMinutes,

      notes: nullableString(formData.get("notes")),
    });

  if (error) {
    console.error("Song insert error:", error);
    throw new Error(
      `No se pudo guardar la canción: ${error.message}`
    );
  }

  revalidatePath("/repertoire");
  revalidatePath("/dashboard");

  redirect("/repertoire");
}

function nullableString(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();

  return text ? text : null;
}