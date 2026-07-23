import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { updateSong } from "./actions";

import DeleteSongButton from "./delete-song-button";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditSongPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: song, error } = await supabase
    .from("songs")
    .select(`
      id,
      title,
      artist,
      genre,
      status,
      musical_key,
      lead_vocal,
      duration_minutes,
      notes
    `)
    .eq("id", id)
    .single();

  if (error || !song) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link
          href="/repertoire"
          className="text-sm text-zinc-500 transition hover:text-white"
        >
          ← Volver al repertorio
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Editar canción
        </h1>

        <p className="mt-2 text-zinc-400">
          Actualiza la información de {song.title}.
        </p>
      </div>

      <form
        action={updateSong}
        className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <input type="hidden" name="id" value={song.id} />

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Canción">
            <input
              name="title"
              required
              defaultValue={song.title}
              className={inputClass}
            />
          </Field>

          <Field label="Artista">
            <input
              name="artist"
              defaultValue={song.artist ?? ""}
              className={inputClass}
            />
          </Field>

          <Field label="Género">
            <input
              name="genre"
              defaultValue={song.genre ?? ""}
              className={inputClass}
            />
          </Field>

          <Field label="Tonalidad">
            <input
              name="musical_key"
              defaultValue={song.musical_key ?? ""}
              className={inputClass}
            />
          </Field>

          <Field label="Voz principal">
            <input
              name="lead_vocal"
              defaultValue={song.lead_vocal ?? ""}
              className={inputClass}
            />
          </Field>

          <Field label="Duración">
            <input
              name="duration_minutes"
              type="number"
              min="0"
              step="0.1"
              defaultValue={song.duration_minutes ?? ""}
              className={inputClass}
            />
          </Field>

          <Field label="Estado">
            <select
              name="status"
              defaultValue={song.status}
              className={inputClass}
            >
              <option value="new">Nueva</option>
              <option value="learning">Aprendiendo</option>
              <option value="needs_rehearsal">Necesita ensayo</option>
              <option value="ready">Lista</option>
              <option value="mastered">Dominada</option>
            </select>
          </Field>
        </div>

        <div className="mt-6">
          <Field label="Notas">
            <textarea
              name="notes"
              rows={5}
              defaultValue={song.notes ?? ""}
              className={`${inputClass} resize-none`}
            />
          </Field>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <DeleteSongButton
            songId={song.id}
            songTitle={song.title}
          />

          <div className="flex gap-3">
            <Link
              href="/repertoire"
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-zinc-200"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">
        {label}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-white/30";