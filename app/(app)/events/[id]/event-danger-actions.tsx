"use client";

import { useState } from "react";

import {
  cancelEvent,
  deleteEvent,
} from "./actions";

export default function EventDangerActions({
  eventId,
  eventName,
  status,
}: {
  eventId: string;
  eventName: string;
  status: string;
}) {
  const [confirmDelete, setConfirmDelete] =
    useState(false);

  return (
    <div className="space-y-4">
      {status !== "cancelled" &&
        status !== "completed" && (
          <form action={cancelEvent}>
            <input
              type="hidden"
              name="event_id"
              value={eventId}
            />

            <button
              type="submit"
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
            >
              Cancelar evento
            </button>
          </form>
        )}

      {!confirmDelete ? (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="rounded-xl border border-red-500/20 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
        >
          Eliminar evento
        </button>
      ) : (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm font-medium text-red-300">
            ¿Eliminar “{eventName}”?
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Esta acción eliminará también su setlist y no se puede deshacer.
          </p>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() =>
                setConfirmDelete(false)
              }
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300"
            >
              Volver
            </button>

            <form action={deleteEvent}>
              <input
                type="hidden"
                name="event_id"
                value={eventId}
              />

              <button
                type="submit"
                className="rounded-lg bg-red-500 px-3 py-2 text-xs font-medium text-white"
              >
                Sí, eliminar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}