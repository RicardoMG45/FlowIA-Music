import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: "⌂" },
  { label: "Ensayos", href: "/rehearsals", icon: "♫" },
  { label: "Repertorio", href: "/repertoire", icon: "♪" },
  { label: "Eventos", href: "/events", icon: "◉" },
  { label: "Tareas", href: "/tasks", icon: "✓" },
];

export default function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-white/10 bg-zinc-950 p-5 md:flex">
          <div className="mb-10">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
              FlowIA Music
            </p>

            <h1 className="mt-2 text-xl font-semibold">
              Blue Rose
            </h1>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                <span className="w-5 text-center text-zinc-500">
                  {item.icon}
                </span>

                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto">
            <Link
              href="/agent"
              className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
            >
              <p className="text-xs uppercase tracking-wider text-zinc-500">
                FlowIA
              </p>

              <p className="mt-1 text-sm font-medium">
                Agente Blue Rose
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Organiza tu banda con IA
              </p>
            </Link>
          </div>
        </aside>

        <main className="flex-1">
          <header className="flex h-16 items-center justify-between border-b border-white/10 px-6 lg:px-10">
            <div>
              <span className="text-sm text-zinc-500">
                Blue Rose Hub
              </span>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
              BR
            </div>
          </header>

          <div className="p-6 lg:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}