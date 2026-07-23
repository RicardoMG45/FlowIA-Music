"use client";

import { useState } from "react";

import { removeSongFromEvent } from "./actions";

export default function RemoveEventSongButton({
  eventSongId,
  eventId,
  songTitle,
}: {
  eventSongId: string;
  eventId: string;
  songTitle: string;
}) {
  const [confirming, setConfirming] =
    useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10"
      >
        Quitar
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
      <p className="text-xs text-red-300">
        ¿Quitar “{songTitle}” del setlist?
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        La canción seguirá existiendo en el repertorio.
      </p>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-zinc-400 hover:bg-white/5"
        >
          Volver
        </button>

        <form action={removeSongFromEvent}>
          <input
            type="hidden"
            name="event_song_id"
            value={eventSongId}
          />

          <input
            type="hidden"
            name="event_id"
            value={eventId}
          />

          <button
            type="submit"
            className="rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-medium text-white"
          >
            Sí, quitar
          </button>
        </form>
      </div>
    </div>
  );
}