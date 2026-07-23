"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateSongStatus } from "./actions";

import {
  useMemo,
  useState,
  useTransition,
} from "react";


export type Song = {
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

const filters = [
  { label: "Todas", value: "all" },
  { label: "Nuevas", value: "new" },
  { label: "Aprendiendo", value: "learning" },
  { label: "Necesita ensayo", value: "needs_rehearsal" },
  { label: "Listas", value: "ready" },
  { label: "Dominadas", value: "mastered" },
];

export default function RepertoireList({
  songs,
}: {
  songs: Song[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredSongs = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return songs.filter((song) => {
      const matchesFilter =
        filter === "all" || song.status === filter;

      const matchesSearch =
        !normalizedSearch ||
        song.title.toLowerCase().includes(normalizedSearch) ||
        song.artist?.toLowerCase().includes(normalizedSearch) ||
        song.genre?.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [songs, search, filter]);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-4">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar canción, artista o género..."
          className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-white/30"
        />

        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={
                filter === item.value
                  ? "rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black"
                  : "rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white"
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {filteredSongs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
          <p className="text-sm text-zinc-400">
            No encontramos canciones con esos filtros.
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
            {filteredSongs.map((song) => (
              <SongRow
                key={song.id}
                song={song}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SongRow({ song }: { song: Song }) {
  return (
    <div className="grid gap-3 border-b border-white/10 px-5 py-4 last:border-b-0 md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr] md:items-center md:gap-4">
      <div>
        <Link
          href={`/repertoire/${song.id}`}
          className="font-medium text-zinc-100 transition hover:text-white hover:underline"
        >
          {song.title}
        </Link>

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

      <StatusSelect song={song} />
    </div>
  );
}

function StatusSelect({ song }: { song: Song }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(status: string) {
    startTransition(async () => {
      await updateSongStatus(song.id, status);
      router.refresh();
    });
  }

  return (
    <select
      value={song.status}
      disabled={isPending}
      onChange={(event) => handleChange(event.target.value)}
      className="w-fit rounded-full border border-white/10 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-300 outline-none transition hover:border-white/20 disabled:opacity-50"
    >
      <option value="new">Nueva</option>
      <option value="learning">Aprendiendo</option>
      <option value="needs_rehearsal">
        Necesita ensayo
      </option>
      <option value="ready">Lista</option>
      <option value="mastered">Dominada</option>
    </select>
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
    <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
      {labels[status] ?? status}
    </span>
  );
}