"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function addSongToRehearsal(
  formData: FormData
) {
  const supabase = await createClient();

  const rehearsalId = formData
    .get("rehearsal_id")
    ?.toString();

  const songId = formData
    .get("song_id")
    ?.toString();

  if (!rehearsalId || !songId) {
    throw new Error(
      "Ensayo y canción son obligatorios."
    );
  }

  const priority =
    Number(
      formData.get("priority")?.toString()
    ) || 1;

  const reason =
    formData.get("reason")?.toString().trim() ||
    null;

  const { error } = await supabase
    .from("rehearsal_songs")
    .insert({
      rehearsal_id: rehearsalId,
      song_id: songId,
      priority,
      reason,
    });

  if (error) {
    console.error(
      "Add rehearsal song error:",
      error
    );

    throw new Error(
      `No se pudo agregar la canción: ${error.message}`
    );
  }

  revalidatePath(
    `/rehearsals/${rehearsalId}`
  );
}

export async function updateRehearsalSongResult(
  formData: FormData
) {
  const supabase = await createClient();

  const rehearsalSongId = formData
    .get("rehearsal_song_id")
    ?.toString();

  const rehearsalId = formData
    .get("rehearsal_id")
    ?.toString();

  const songId = formData
    .get("song_id")
    ?.toString();

  const result = formData
    .get("result")
    ?.toString();

  if (
    !rehearsalSongId ||
    !rehearsalId ||
    !songId ||
    !result
  ) {
    throw new Error("Faltan datos obligatorios.");
  }

  const validResults = [
    "ready",
    "needs_rehearsal",
    "not_practiced",
  ];

  if (!validResults.includes(result)) {
    throw new Error("Resultado inválido.");
  }

  const { error: rehearsalSongError } =
    await supabase
      .from("rehearsal_songs")
      .update({
        result,
      })
      .eq("id", rehearsalSongId);

  if (rehearsalSongError) {
    throw new Error(
      `No se pudo guardar el resultado: ${rehearsalSongError.message}`
    );
  }

  if (result !== "not_practiced") {
    const newSongStatus =
      result === "ready"
        ? "ready"
        : "needs_rehearsal";

    const { error: songError } = await supabase
      .from("songs")
      .update({
        status: newSongStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", songId);

    if (songError) {
      throw new Error(
        `No se pudo actualizar el repertorio: ${songError.message}`
      );
    }
  }

  revalidatePath(
    `/rehearsals/${rehearsalId}`
  );

  revalidatePath("/repertoire");
  revalidatePath("/dashboard");
}

export async function completeRehearsal(
  formData: FormData
) {
  const supabase = await createClient();

  const rehearsalId = formData
    .get("rehearsal_id")
    ?.toString();

  const notes =
    formData.get("notes")?.toString().trim() || null;

  if (!rehearsalId) {
    throw new Error("No se encontró el ensayo.");
  }

  const { error } = await supabase
    .from("rehearsals")
    .update({
      status: "completed",
      notes,
    })
    .eq("id", rehearsalId);

  if (error) {
    throw new Error(
      `No se pudo finalizar el ensayo: ${error.message}`
    );
  }

  revalidatePath(`/rehearsals/${rehearsalId}`);
  revalidatePath("/rehearsals");
  revalidatePath("/dashboard");
}