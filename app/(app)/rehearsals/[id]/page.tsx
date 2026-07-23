import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  addSongToRehearsal,
  updateRehearsalSongResult,
} from "./actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type RehearsalSong = {
  id: string;
  priority: number | null;
  reason: string | null;
  result: string | null;
  songs:
    | {
        id: string;
        title: string;
        artist: string | null;
        status: string;
      }
    | {
        id: string;
        title: string;
        artist: string | null;
        status: string;
      }[]
    | null;
};

export default async function RehearsalDetailPage({
  params,
}: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: rehearsal, error } = await supabase
    .from("rehearsals")
    .select(`
      id,
      organization_id,
      rehearsal_date,
      start_time,
      end_time,
      location,
      status,
      objective,
      notes
    `)
    .eq("id", id)
    .single();

  if (error || !rehearsal) {
    notFound();
  }

  const [
    rehearsalSongsResult,
    repertoireResult,
  ] = await Promise.all([
    supabase
      .from("rehearsal_songs")
      .select(`
        id,
        priority,
        reason,
        result,
        songs (
          id,
          title,
          artist,
          status
        )
      `)
      .eq("rehearsal_id", rehearsal.id)
      .order("priority", { ascending: false }),

    supabase
      .from("songs")
      .select(`
        id,
        title,
        artist,
        status
      `)
      .eq("organization_id", rehearsal.organization_id)
      .order("title"),
  ]);

  const rehearsalSongs =
    (rehearsalSongsResult.data ?? []) as RehearsalSong[];

  const selectedSongIds = new Set(
    rehearsalSongs.flatMap((item) => {
      const song = Array.isArray(item.songs)
        ? item.songs[0]
        : item.songs;

      return song ? [song.id] : [];
    })
  );

  const availableSongs =
    repertoireResult.data?.filter(
      (song) => !selectedSongIds.has(song.id)
    ) ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/rehearsals"
        className="text-sm text-zinc-500 transition hover:text-white"
      >
        ← Volver a ensayos
      </Link>

      <div className="mt-6">
        <p className="text-sm text-zinc-500">
          Ensayo
        </p>

        <h1 className="mt-1 text-3xl font-semibold">
          {formatDate(rehearsal.rehearsal_date)}
        </h1>

        <p className="mt-2 text-zinc-400">
          {rehearsal.start_time
            ? formatTime(rehearsal.start_time)
            : "Hora pendiente"}

          {rehearsal.end_time &&
            ` – ${formatTime(rehearsal.end_time)}`}
        </p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <InfoCard
          label="Objetivo"
          value={
            rehearsal.objective ??
            "Sin objetivo definido"
          }
        />

        <InfoCard
          label="Lugar"
          value={rehearsal.location ?? "Por definir"}
        />

        <InfoCard
          label="Estado"
          value={translateStatus(rehearsal.status)}
        />
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Canciones del ensayo
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Define qué va a trabajar Blue Rose.
            </p>
          </div>
        </div>

        {rehearsalSongs.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
            Todavía no hay canciones asignadas a este ensayo.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {rehearsalSongs.map((item) => {
              const song = Array.isArray(item.songs)
                ? item.songs[0]
                : item.songs;

              if (!song) return null;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        {song.title}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {song.artist ?? "Artista no especificado"}
                      </p>
                    </div>

                    <PriorityBadge
                      priority={item.priority ?? 1}
                    />
                  </div>

                  {item.reason && (
                    <p className="mt-4 text-sm text-zinc-400">
                      {item.reason}
                    </p>
                  )}

                  <div className="mt-5 border-t border-white/10 pt-4">
                    <p className="mb-3 text-xs uppercase tracking-wider text-zinc-600">
                        Resultado del ensayo
                    </p>

                    <div className="flex flex-wrap gap-2">
                        <form action={updateRehearsalSongResult}>
                        <input
                            type="hidden"
                            name="rehearsal_song_id"
                            value={item.id}
                        />

                        <input
                            type="hidden"
                            name="rehearsal_id"
                            value={rehearsal.id}
                        />

                        <input
                            type="hidden"
                            name="song_id"
                            value={song.id}
                        />

                        <button
                            type="submit"
                            name="result"
                            value="ready"
                            className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/5"
                        >
                            Quedó lista
                        </button>

                        <button
                            type="submit"
                            name="result"
                            value="needs_rehearsal"
                            className="ml-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/5"
                        >
                            Necesita otro ensayo
                        </button>

                        <button
                            type="submit"
                            name="result"
                            value="not_practiced"
                            className="ml-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-500 transition hover:bg-white/5"
                        >
                            No se practicó
                        </button>
                        </form>
                    </div>

                    {item.result && (
                        <p className="mt-3 text-xs text-zinc-500">
                        Resultado actual:{" "}
                        {translateResult(item.result)}
                        </p>
                    )}
                    </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="text-lg font-semibold">
          Agregar canción
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Selecciona una canción del repertorio.
        </p>

        {availableSongs.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">
            No hay más canciones disponibles para agregar.
          </p>
        ) : (
          <form
            action={addSongToRehearsal}
            className="mt-6 grid gap-4 sm:grid-cols-2"
          >
            <input
              type="hidden"
              name="rehearsal_id"
              value={rehearsal.id}
            />

            <label>
              <span className="mb-2 block text-sm text-zinc-400">
                Canción
              </span>

              <select
                name="song_id"
                required
                className={inputClass}
              >
                <option value="">
                  Selecciona...
                </option>

                {availableSongs.map((song) => (
                  <option
                    key={song.id}
                    value={song.id}
                  >
                    {song.title}
                    {song.artist
                      ? ` — ${song.artist}`
                      : ""}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-400">
                Prioridad
              </span>

              <select
                name="priority"
                defaultValue="2"
                className={inputClass}
              >
                <option value="1">
                  Baja
                </option>

                <option value="2">
                  Media
                </option>

                <option value="3">
                  Alta
                </option>
              </select>
            </label>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm text-zinc-400">
                Motivo
              </span>

              <input
                name="reason"
                placeholder="Ej. Erick necesita revisar el solo"
                className={inputClass}
              />
            </label>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-zinc-200"
              >
                Agregar al ensayo
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-xs uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-2 text-sm text-zinc-300">
        {value}
      </p>
    </div>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: number;
}) {
  const labels: Record<number, string> = {
    1: "Baja",
    2: "Media",
    3: "Alta",
  };

  return (
    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
      Prioridad {labels[priority] ?? priority}
    </span>
  );
}

function translateStatus(status: string) {
  const labels: Record<string, string> = {
    planned: "Planeado",
    confirmed: "Confirmado",
    completed: "Completado",
    cancelled: "Cancelado",
  };

  return labels[status] ?? status;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");

  return new Intl.DateTimeFormat("es-MX", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(
    new Date(
      2026,
      0,
      1,
      Number(hours),
      Number(minutes)
    )
  );
}

function translateResult(result: string) {
  const labels: Record<string, string> = {
    ready: "Quedó lista",
    needs_rehearsal: "Necesita otro ensayo",
    not_practiced: "No se practicó",
  };

  return labels[result] ?? result;
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-white/30";