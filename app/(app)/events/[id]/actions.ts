"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function addSongToEvent(
  formData: FormData
) {
  const supabase = await createClient();

  const eventId =
    formData.get("event_id")?.toString();

  const songId =
    formData.get("song_id")?.toString();

  const position =
    Number(
      formData.get("position")?.toString()
    ) || 1;

  const notes =
    formData.get("notes")?.toString().trim() ||
    null;

  if (!eventId || !songId) {
    throw new Error(
      "Evento y canción son obligatorios."
    );
  }

  const { error } = await supabase
    .from("event_songs")
    .insert({
      event_id: eventId,
      song_id: songId,
      position,
      notes,
    });

  if (error) {
    console.error(
      "Add event song error:",
      error
    );

    throw new Error(
      `No se pudo agregar la canción: ${error.message}`
    );
  }

  revalidatePath(`/events/${eventId}`);
}