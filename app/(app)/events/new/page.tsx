import Link from "next/link";
import { createEvent } from "./actions";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link
          href="/events"
          className="text-sm text-zinc-500 transition hover:text-white"
        >
          ← Volver a eventos
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Agregar evento
        </h1>

        <p className="mt-2 text-zinc-400">
          Registra una presentación de Blue Rose.
        </p>
      </div>

      <form
        action={createEvent}
        className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Nombre del evento">
            <input
              name="name"
              required
              placeholder="Ej. Boda Ana y Carlos"
              className={inputClass}
            />
          </Field>

          <Field label="Tipo de evento">
            <input
              name="event_type"
              placeholder="Ej. Boda, bar, evento privado"
              className={inputClass}
            />
          </Field>

          <Field label="Fecha">
            <input
              type="date"
              name="event_date"
              required
              className={inputClass}
            />
          </Field>

          <Field label="Hora">
            <input
              type="time"
              name="start_time"
              className={inputClass}
            />
          </Field>

          <Field label="Lugar">
            <input
              name="location"
              placeholder="Ej. Salón Jardines"
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
        </div>

        <div className="mt-6">
          <Field label="Notas">
            <textarea
              name="notes"
              rows={5}
              placeholder="Horarios, requisitos, contacto, equipo necesario..."
              className={`${inputClass} resize-none`}
            />
          </Field>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Link
            href="/events"
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-zinc-200"
          >
            Guardar evento
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