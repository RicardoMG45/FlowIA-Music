import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Event = {
  id: string;
  name: string;
  event_date: string;
  start_time: string | null;
  location: string | null;
  event_type: string | null;
  status: string;
  notes: string | null;
};

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", "blue-rose")
    .single();

  if (organizationError || !organization) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">
          No pudimos cargar Blue Rose
        </h1>
      </div>
    );
  }

  const { data: events, error } = await supabase
    .from("events")
    .select(`
      id,
      name,
      event_date,
      start_time,
      location,
      event_type,
      status,
      notes
    `)
    .eq("organization_id", organization.id)
    .order("event_date", { ascending: true });

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">
          No pudimos cargar los eventos
        </h1>

        <pre className="mt-4 rounded-xl bg-red-950/30 p-4 text-sm text-red-300">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  const eventList = (events ?? []) as Event[];

  const upcoming = eventList.filter(
    (event) =>
      event.event_date >= today() &&
      event.status !== "cancelled" &&
      event.status !== "completed"
  );

  const history = eventList.filter(
    (event) =>
      event.status === "completed" ||
      event.status === "cancelled"
  );

  const completed = eventList.filter(
    (event) => event.status === "completed"
  );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            Blue Rose
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Eventos
          </h1>

          <p className="mt-2 max-w-2xl text-zinc-400">
            Organiza presentaciones y mantén visible lo que viene para el grupo.
          </p>
        </div>

        <Link
          href="/events/new"
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          + Agregar evento
        </Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Próximos"
          value={upcoming.length.toString()}
          subtitle="Eventos activos"
        />

        <MetricCard
          label="Completados"
          value={completed.length.toString()}
          subtitle="Historial"
        />

        <MetricCard
          label="Total"
          value={eventList.length.toString()}
          subtitle="Eventos registrados"
        />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">
          Próximos eventos
        </h2>

        {upcoming.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
            <p className="text-zinc-400">
              No hay eventos próximos.
            </p>

            <p className="mt-2 text-sm text-zinc-600">
              Agrega la siguiente presentación de Blue Rose.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {upcoming.map((event) => (
              <EventCard
                key={event.id}
                event={event}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">
            Historial
        </h2>

        {history.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
            <p className="text-zinc-400">
                Aún no hay eventos completados o cancelados.
            </p>
            </div>
        ) : (
            <div className="mt-4 space-y-3">
            {history.map((event) => (
                <EventCard
                key={event.id}
                event={event}
                />
            ))}
            </div>
        )}
      </section>

      {completed.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">
            Historial
          </h2>

          <div className="mt-4 space-y-3">
            {completed.map((event) => (
              <EventCard
                key={event.id}
                event={event}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EventCard({
  event,
}: {
  event: Event;
}) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:bg-white/[0.04]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-medium">
            {event.name}
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            {formatDate(event.event_date)}

            {event.start_time &&
              ` · ${formatTime(event.start_time)}`}
          </p>
        </div>

        <StatusBadge status={event.status} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            Tipo
          </p>

          <p className="mt-1 text-sm text-zinc-300">
            {event.event_type ?? "Evento"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            Lugar
          </p>

          <p className="mt-1 text-sm text-zinc-300">
            {event.location ?? "Por definir"}
          </p>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const labels: Record<string, string> = {
    planned: "Planeado",
    confirmed: "Confirmado",
    completed: "Completado",
    cancelled: "Cancelado",
  };

  return (
    <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
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

      <p className="mt-3 text-3xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-500">
        {subtitle}
      </p>
    </div>
  );
}

function today() {
  return new Date().toISOString().split("T")[0];
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
    new Date(2026, 0, 1, Number(hours), Number(minutes))
  );
}