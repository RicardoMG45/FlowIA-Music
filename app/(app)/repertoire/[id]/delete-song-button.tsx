"use client";

import { useState } from "react";
import { deleteSong } from "./actions";

type Props = {
  songId: string;
  songTitle: string;
};

export default function DeleteSongButton({
  songId,
  songTitle,
}: Props) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-xl border border-red-500/20 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
      >
        Eliminar canción
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
      <p className="text-sm font-medium text-red-300">
        ¿Eliminar “{songTitle}”?
      </p>

      <p className="mt-1 text-xs text-zinc-500">
        Esta acción no se puede deshacer.
      </p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/5"
        >
          Cancelar
        </button>

        <button
          type="submit"
          name="id"
          value={songId}
          formAction={deleteSong}
          className="rounded-lg bg-red-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-600"
        >
          Sí, eliminar
        </button>
      </div>
    </div>
  );
}