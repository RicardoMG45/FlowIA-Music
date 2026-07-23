import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Rehearsal = {
  id: string;
  rehearsal_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  status: string;
  objective: string | null;
  notes: string | null;
};

export default async function RehearsalsPage() {
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

  const { data: rehearsals, error } = await supabase
    .from("rehearsals")
    .select(`
      id,
      rehearsal_date,
      start_time,
      end_time,
      location,
      status,
      objective,
      notes
    `)
    .eq("organization_id", organization.id)
    .order("rehearsal_date", { ascending: false });

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">
          No pudimos cargar los ensayos
        </h1>

        <pre className="mt-4 rounded-xl bg-red-950/30 p-4 text-sm text-red-300">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  const rehearsalList = (rehearsals ?? []) as Rehearsal[];

  const upcoming = rehearsalList.filter(
    (rehearsal) =>
      rehearsal.rehearsal_date >= today()
  );

  const completed = rehearsalList.filter(
    (rehearsal) =>
      rehearsal.status === "completed"
  );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            Blue Rose
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Ensayos
          </h1>

          <p className="mt-2 max-w-2xl text-zinc-400">
            Programa ensayos, define objetivos y registra el progreso del grupo.
          </p>
        </div>

        <Link
          href="/rehearsals/new"
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          + Programar ensayo
        </Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Próximos"
          value={upcoming.length.toString()}
          subtitle="Ensayos programados"
        />

        <MetricCard
          label="Completados"
          value={completed.length.toString()}
          subtitle="Historial registrado"
        />

        <MetricCard
          label="Total"
          value={rehearsalList.length.toString()}
          subtitle="Ensayos registrados"
        />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">
          Próximos ensayos
        </h2>

        {upcoming.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
            <p className="text-zinc-400">
              No hay ensayos programados.
            </p>

            <p className="mt-2 text-sm text-zinc-600">
              Programa el próximo ensayo de Blue Rose.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {upcoming.map((rehearsal) => (
              <RehearsalCard
                key={rehearsal.id}
                rehearsal={rehearsal}
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
            {completed.map((rehearsal) => (
              <RehearsalCard
                key={rehearsal.id}
                rehearsal={rehearsal}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function RehearsalCard({
  rehearsal,
}: {
  rehearsal: Rehearsal;
}) {
  return (
    <Link
      href={`/rehearsals/${rehearsal.id}`}
      className="block rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:bg-white/[0.04]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-medium">
            {formatDate(rehearsal.rehearsal_date)}
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            {rehearsal.start_time
              ? formatTime(rehearsal.start_time)
              : "Hora pendiente"}

            {rehearsal.end_time &&
              ` – ${formatTime(rehearsal.end_time)}`}
          </p>
        </div>

        <StatusBadge status={rehearsal.status} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            Objetivo
          </p>

          <p className="mt-1 text-sm text-zinc-300">
            {rehearsal.objective ?? "Sin objetivo definido"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            Lugar
          </p>

          <p className="mt-1 text-sm text-zinc-300">
            {rehearsal.location ?? "Por definir"}
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
      <p className="text-sm text-zinc-500">{label}</p>

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
    new Date(
      2026,
      0,
      1,
      Number(hours),
      Number(minutes)
    )
  );
}