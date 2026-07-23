import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Obtener Blue Rose
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
          Verifica la conexión con Supabase.
        </p>
      </div>
    );
  }

// if (organizationError || !organization) {
//   console.error("Supabase organization error:", organizationError);

//   return (
//     <div>
//       <h1 className="text-2xl font-semibold">
//         No pudimos cargar Blue Rose
//       </h1>

//       <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-red-950/30 p-4 text-sm text-red-300">
//         {JSON.stringify(organizationError, null, 2)}
//       </pre>

//       {!organization && (
//         <p className="mt-4 text-zinc-400">
//           La consulta tampoco devolvió una organización.
//         </p>
//       )}
//     </div>
//   );
// }

  const organizationId = organization.id;

  const [
    songsResult,
    rehearsalsResult,
    eventsResult,
    tasksResult,
  ] = await Promise.all([
    supabase
      .from("songs")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),

    supabase
      .from("rehearsals")
      .select("*")
      .eq("organization_id", organizationId)
      .gte("rehearsal_date", new Date().toISOString().split("T")[0])
      .order("rehearsal_date", { ascending: true })
      .limit(1),

    supabase
      .from("events")
      .select("*")
      .eq("organization_id", organizationId)
      .gte("event_date", new Date().toISOString().split("T")[0])
      .order("event_date", { ascending: true })
      .limit(1),

    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .neq("status", "completed"),
  ]);

  const songCount = songsResult.count ?? 0;
  const taskCount = tasksResult.count ?? 0;

  const nextRehearsal = rehearsalsResult.data?.[0] ?? null;
  const nextEvent = eventsResult.data?.[0] ?? null;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-10">
        <p className="text-sm text-zinc-500">
          Operación del grupo
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Buenos días, Blue Rose
        </h1>

        <p className="mt-2 max-w-2xl text-zinc-400">
          Aquí pueden ver qué viene, qué necesita atención y cómo va
          la preparación del grupo.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Canciones"
          value={songCount.toString()}
          subtitle="En repertorio"
        />

        <MetricCard
          label="Tareas pendientes"
          value={taskCount.toString()}
          subtitle="Por completar"
        />

        <MetricCard
          label="Próximo ensayo"
          value={
            nextRehearsal
              ? formatShortDate(nextRehearsal.rehearsal_date)
              : "—"
          }
          subtitle={
            nextRehearsal?.start_time
              ? formatTime(nextRehearsal.start_time)
              : "Sin programar"
          }
        />

        <MetricCard
          label="Próximo evento"
          value={
            nextEvent
              ? formatShortDate(nextEvent.event_date)
              : "—"
          }
          subtitle={
            nextEvent?.name ?? "Sin eventos"
          }
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">
                Próximo ensayo
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                {nextRehearsal
                  ? formatLongDate(nextRehearsal.rehearsal_date)
                  : "No hay ensayo programado"}
              </h2>
            </div>

            {nextRehearsal && (
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                {nextRehearsal.status}
              </span>
            )}
          </div>

          {nextRehearsal ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <InfoItem
                label="Hora"
                value={
                  nextRehearsal.start_time
                    ? formatTime(nextRehearsal.start_time)
                    : "Pendiente"
                }
              />

              <InfoItem
                label="Lugar"
                value={nextRehearsal.location ?? "Pendiente"}
              />

              <InfoItem
                label="Objetivo"
                value={
                  nextRehearsal.objective ??
                  "Sin objetivo definido"
                }
              />
            </div>
          ) : (
            <p className="mt-6 text-sm text-zinc-500">
              Cuando agreguen su primer ensayo aparecerá aquí.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            FlowIA Agent
          </p>

          <h2 className="mt-3 text-xl font-semibold">
            ¿Qué deberían ensayar?
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Cuando agreguemos el agente, analizará repertorio, eventos
            y ensayos anteriores para recomendar las prioridades del grupo.
          </p>

          <button
            disabled
            className="mt-6 w-full cursor-not-allowed rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black opacity-50"
          >
            Próximamente
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-sm text-zinc-500">
          Próximo evento
        </p>

        {nextEvent ? (
          <>
            <h2 className="mt-1 text-xl font-semibold">
              {nextEvent.name}
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <InfoItem
                label="Fecha"
                value={formatLongDate(nextEvent.event_date)}
              />

              <InfoItem
                label="Lugar"
                value={nextEvent.location ?? "Por definir"}
              />

              <InfoItem
                label="Tipo"
                value={nextEvent.event_type ?? "Evento"}
              />
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">
            Blue Rose todavía no tiene eventos registrados.
          </p>
        )}
      </section>
    </div>
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

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-1 text-sm text-zinc-300">
        {value}
      </p>
    </div>
  );
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));
}

function formatLongDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
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