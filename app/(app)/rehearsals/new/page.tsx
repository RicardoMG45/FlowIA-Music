import Link from "next/link";

import { createRehearsal } from "./actions";

export default function NewRehearsalPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link
          href="/rehearsals"
          className="text-sm text-zinc-500 transition hover:text-white"
        >
          ← Volver a ensayos
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Programar ensayo
        </h1>

        <p className="mt-2 text-zinc-400">
          Organiza el próximo ensayo de Blue Rose.
        </p>
      </div>

      <form
        action={createRehearsal}
        className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Fecha">
            <input
              type="date"
              name="rehearsal_date"
              required
              className={inputClass}
            />
          </Field>

          <Field label="Estado">
            <select
              name="status"
              defaultValue="planned"
              className={inputClass}
            >
              <option value="planned">
                Planeado
              </option>

              <option value="confirmed">
                Confirmado
              </option>
            </select>
          </Field>

          <Field label="Hora de inicio">
            <input
              type="time"
              name="start_time"
              className={inputClass}
            />
          </Field>

          <Field label="Hora de término">
            <input
              type="time"
              name="end_time"
              className={inputClass}
            />
          </Field>

          <Field label="Lugar">
            <input
              name="location"
              placeholder="Ej. Casa de Diego"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-6">
          <Field label="Objetivo del ensayo">
            <input
              name="objective"
              placeholder="Ej. Preparar repertorio para evento del sábado"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-6">
          <Field label="Notas">
            <textarea
              name="notes"
              rows={5}
              placeholder="Información adicional..."
              className={`${inputClass} resize-none`}
            />
          </Field>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Link
            href="/rehearsals"
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-zinc-200"
          >
            Programar ensayo
          </button>
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