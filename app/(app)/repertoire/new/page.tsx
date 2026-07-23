import Link from "next/link";
import { createSong } from "./actions";

export default function NewSongPage() {
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
          Agregar canción
        </h1>

        <p className="mt-2 text-zinc-400">
          Agrega una canción al repertorio de Blue Rose.
        </p>
      </div>

      <form
        action={createSong}
        className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Canción" required>
            <input
              name="title"
              required
              placeholder="Ej. Lamento Boliviano"
              className={inputClass}
            />
          </Field>

          <Field label="Artista">
            <input
              name="artist"
              placeholder="Ej. Enanitos Verdes"
              className={inputClass}
            />
          </Field>

          <Field label="Género">
            <input
              name="genre"
              placeholder="Ej. Rock en español"
              className={inputClass}
            />
          </Field>

          <Field label="Tonalidad">
            <input
              name="musical_key"
              placeholder="Ej. Em"
              className={inputClass}
            />
          </Field>

          <Field label="Voz principal">
            <input
              name="lead_vocal"
              placeholder="Ej. Diego"
              className={inputClass}
            />
          </Field>

          <Field label="Duración aproximada">
            <input
              name="duration_minutes"
              type="number"
              min="0"
              step="0.1"
              placeholder="4.5"
              className={inputClass}
            />
          </Field>

          <Field label="Estado">
            <select
              name="status"
              defaultValue="new"
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
              placeholder="Notas del grupo, partes pendientes, arreglos, etc."
              className={`${inputClass} resize-none`}
            />
          </Field>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Link
            href="/repertoire"
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Guardar canción
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-400">
        {label}
        {required && <span className="ml-1 text-zinc-600">*</span>}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-white/30";