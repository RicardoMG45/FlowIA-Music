"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { redirect } from "next/navigation";

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

export async function updateEvent(
  formData: FormData
) {
  const supabase = await createClient();

  const eventId =
    formData.get("event_id")?.toString();

  const name =
    formData.get("name")?.toString().trim();

  const eventDate =
    formData.get("event_date")?.toString();

  if (!eventId || !name || !eventDate) {
    throw new Error(
      "Faltan datos obligatorios."
    );
  }

  const { error } = await supabase
    .from("events")
    .update({
      name,
      event_date: eventDate,
      start_time:
        formData.get("start_time")?.toString() || null,
      location:
        formData.get("location")?.toString().trim() || null,
      event_type:
        formData.get("event_type")?.toString().trim() || null,
      notes:
        formData.get("notes")?.toString().trim() || null,
      status:
        formData.get("status")?.toString() || "planned",
    })
    .eq("id", eventId);

  if (error) {
    throw new Error(
      `No se pudo actualizar el evento: ${error.message}`
    );
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  revalidatePath("/dashboard");

  redirect("/events");
}

export async function cancelEvent(
  formData: FormData
) {
  const supabase = await createClient();

  const eventId =
    formData.get("event_id")?.toString();

  if (!eventId) {
    throw new Error("No se encontró el evento.");
  }

  const { error } = await supabase
    .from("events")
    .update({
      status: "cancelled",
    })
    .eq("id", eventId);

  if (error) {
    throw new Error(
      `No se pudo cancelar el evento: ${error.message}`
    );
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  revalidatePath("/dashboard");

  redirect("/events");
}

export async function deleteEvent(
  formData: FormData
) {
  const supabase = await createClient();

  const eventId =
    formData.get("event_id")?.toString();

  if (!eventId) {
    throw new Error("No se encontró el evento.");
  }

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId);

  if (error) {
    throw new Error(
      `No se pudo eliminar el evento: ${error.message}`
    );
  }

  revalidatePath("/events");
  revalidatePath("/dashboard");

  redirect("/events");
}

export async function removeSongFromEvent(
  formData: FormData
) {
  const supabase = await createClient();

  const eventSongId =
    formData.get("event_song_id")?.toString();

  const eventId =
    formData.get("event_id")?.toString();

  if (!eventSongId || !eventId) {
    throw new Error(
      "No se encontró la canción dentro del evento."
    );
  }

  const { error } = await supabase
    .from("event_songs")
    .delete()
    .eq("id", eventSongId);

  if (error) {
    throw new Error(
      `No se pudo quitar la canción del setlist: ${error.message}`
    );
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  revalidatePath("/dashboard");
}