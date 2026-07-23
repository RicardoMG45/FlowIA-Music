import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type Song = {
  id: string;
  title: string;
  artist: string | null;
  genre: string | null;
  status: string;
  musical_key: string | null;
  lead_vocal: string | null;
  duration_minutes: number | null;
  notes: string | null;
};

export default async function RepertoirePage() {
  const supabase = await createClient();

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("slug", "blue-rose")
    .single();

  if (organizationError || !organization) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">
          No pudimos cargar Blue Rose
        </h1>

        <p className="mt-2 text-zinc-500">
          Verifica la organización en Supabase.
        </p>
      </div>
    );
  }

  const { data: songs, error: songsError } = await supabase
    .from("songs")
    .select(
      `
        id,
        title,
        artist,
        genre,
        status,
        musical_key,
        lead_vocal,
        duration_minutes,
        notes
      `
    )
    .eq("organization_id", organization.id)
    .order("title", { ascending: true });

  if (songsError) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">
          No pudimos cargar el repertorio
        </h1>

        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-red-950/30 p-4 text-sm text-red-300">
          {JSON.stringify(songsError, null, 2)}
        </pre>
      </div>
    );
  }

  const repertoire = (songs ?? []) as Song[];

  const needsRehearsal = repertoire.filter(
    (song) => song.status === "needs_rehearsal"
  ).length;

  const ready = repertoire.filter(
    (song) => song.status === "ready" || song.status === "mastered"
  ).length;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            Blue Rose
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Repertorio
          </h1>

          <p className="mt-2 max-w-2xl text-zinc-400">
            Administra las canciones del grupo y su estado de preparación.
          </p>
        </div>

        <Link
            href="/repertoire/new"
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            + Agregar canción
        </Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Canciones"
          value={repertoire.length.toString()}
          subtitle="Repertorio total"
        />

        <MetricCard
          label="Necesitan ensayo"
          value={needsRehearsal.toString()}
          subtitle="Prioridad del grupo"
        />

        <MetricCard
          label="Listas"
          value={ready.toString()}
          subtitle="Preparadas para tocar"
        />
      </section>

      <section className="mt-8">
        {repertoire.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <p className="text-lg font-medium">
              Aún no hay canciones
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Agrega el repertorio de Blue Rose para comenzar a organizar
              ensayos y preparar al futuro agente.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="hidden grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4 border-b border-white/10 bg-white/[0.02] px-5 py-3 text-xs font-medium uppercase tracking-wider text-zinc-600 md:grid">
              <span>Canción</span>
              <span>Artista</span>
              <span>Género</span>
              <span>Tonalidad</span>
              <span>Estado</span>
            </div>

            <div>
              {repertoire.map((song) => (
                <SongRow
                  key={song.id}
                  song={song}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function SongRow({ song }: { song: Song }) {
  return (
    <div className="grid gap-3 border-b border-white/10 px-5 py-4 last:border-b-0 md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr] md:items-center md:gap-4">
      <div>
        <p className="font-medium text-zinc-100">
          {song.title}
        </p>

        {song.lead_vocal && (
          <p className="mt-1 text-xs text-zinc-600">
            Voz: {song.lead_vocal}
          </p>
        )}
      </div>

      <p className="text-sm text-zinc-400">
        {song.artist ?? "—"}
      </p>

      <p className="text-sm text-zinc-500">
        {song.genre ?? "—"}
      </p>

      <p className="text-sm text-zinc-500">
        {song.musical_key ?? "—"}
      </p>

      <div>
        <StatusBadge status={song.status} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    new: "Nueva",
    learning: "Aprendiendo",
    needs_rehearsal: "Necesita ensayo",
    ready: "Lista",
    mastered: "Dominada",
  };

  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
      {labels[status] ?? status}
    </span>
  );
}

function MetricCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-500">
        {subtitle}
      </p>
    </div>
  );
}