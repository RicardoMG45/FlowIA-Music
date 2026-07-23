import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { addSongToEvent } from "./actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type EventSong = {
  id: string;
  position: number;
  notes: string | null;
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

export default async function EventDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select(`
      id,
      organization_id,
      name,
      event_date,
      start_time,
      location,
      event_type,
      status,
      notes
    `)
    .eq("id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  const [eventSongsResult, repertoireResult] =
    await Promise.all([
      supabase
        .from("event_songs")
        .select(`
          id,
          position,
          notes,
          songs (
            id,
            title,
            artist,
            status
          )
        `)
        .eq("event_id", event.id)
        .order("position", {
          ascending: true,
        }),

      supabase
        .from("songs")
        .select(`
          id,
          title,
          artist,
          status
        `)
        .eq(
          "organization_id",
          event.organization_id
        )
        .order("title"),
    ]);

  const eventSongs =
    (eventSongsResult.data ?? []) as EventSong[];

  const selectedSongIds = new Set(
    eventSongs.flatMap((item) => {
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

  const readyCount = eventSongs.filter((item) => {
    const song = Array.isArray(item.songs)
      ? item.songs[0]
      : item.songs;

    return (
      song?.status === "ready" ||
      song?.status === "mastered"
    );
  }).length;

  const needsRehearsalCount =
    eventSongs.filter((item) => {
      const song = Array.isArray(item.songs)
        ? item.songs[0]
        : item.songs;

      return (
        song?.status === "needs_rehearsal" ||
        song?.status === "learning" ||
        song?.status === "new"
      );
    }).length;

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/events"
        className="text-sm text-zinc-500 transition hover:text-white"
      >
        ← Volver a eventos
      </Link>

      <div className="mt-6">
        <p className="text-sm text-zinc-500">
          Evento
        </p>

        <h1 className="mt-1 text-3xl font-semibold">
          {event.name}
        </h1>

        <p className="mt-2 text-zinc-400">
          {formatDate(event.event_date)}

          {event.start_time &&
            ` · ${formatTime(event.start_time)}`}
        </p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <InfoCard
          label="Tipo"
          value={event.event_type ?? "Evento"}
        />

        <InfoCard
          label="Lugar"
          value={event.location ?? "Por definir"}
        />

        <InfoCard
          label="Estado"
          value={translateStatus(event.status)}
        />
      </section>

      {event.notes && (
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            Logística / notas
          </p>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
            {event.notes}
          </p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold">
          Preparación del evento
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <InfoCard
            label="Setlist"
            value={eventSongs.length.toString()}
          />

          <InfoCard
            label="Listas"
            value={readyCount.toString()}
          />

          <InfoCard
            label="Necesitan preparación"
            value={needsRehearsalCount.toString()}
          />
        </div>
      </section>

      <section className="mt-10">
        <div>
          <h2 className="text-xl font-semibold">
            Setlist
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Canciones planeadas para esta presentación.
          </p>
        </div>

        {eventSongs.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
            Todavía no hay canciones en el setlist.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {eventSongs.map((item) => {
              const song = Array.isArray(item.songs)
                ? item.songs[0]
                : item.songs;

              if (!song) return null;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-sm text-zinc-500">
                    {item.position}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {song.title}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {song.artist ??
                        "Artista no especificado"}
                    </p>

                    {item.notes && (
                      <p className="mt-2 text-xs text-zinc-500">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <SongStatus
                    status={song.status}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {event.status !== "completed" &&
        event.status !== "cancelled" && (
          <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h2 className="text-lg font-semibold">
              Agregar al setlist
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Selecciona una canción del repertorio.
            </p>

            {availableSongs.length === 0 ? (
              <p className="mt-6 text-sm text-zinc-500">
                No hay más canciones disponibles.
              </p>
            ) : (
              <form
                action={addSongToEvent}
                className="mt-6 grid gap-4 sm:grid-cols-2"
              >
                <input
                  type="hidden"
                  name="event_id"
                  value={event.id}
                />

                <input
                  type="hidden"
                  name="position"
                  value={eventSongs.length + 1}
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
                    Nota
                  </span>

                  <input
                    name="notes"
                    placeholder="Ej. Abrir segundo bloque"
                    className={inputClass}
                  />
                </label>

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-zinc-200"
                  >
                    Agregar al setlist
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
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

function SongStatus({
  status,
}: {
  status: string;
}) {
  const labels: Record<string, string> = {
    new: "Nueva",
    learning: "Aprendiendo",
    needs_rehearsal: "Necesita ensayo",
    ready: "Lista",
    mastered: "Dominada",
  };

  return (
    <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
      {labels[status] ?? status}
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

const inputClass =
  "w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-white/30";