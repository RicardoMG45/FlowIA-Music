export type PreparationSong = {
  id: string;
  title: string;
  status: string;
};

export function getPreparationScore(
  songs: PreparationSong[]
) {
  if (songs.length === 0) return 0;

  const readyCount = songs.filter(
    (song) =>
      song.status === "ready" ||
      song.status === "mastered"
  ).length;

  return Math.round(
    (readyCount / songs.length) * 100
  );
}

export function getPrioritySongs(
  songs: PreparationSong[]
) {
  const priority: Record<string, number> = {
    new: 4,
    learning: 3,
    needs_rehearsal: 2,
    ready: 1,
    mastered: 0,
  };

  return [...songs]
    .filter(
      (song) =>
        song.status !== "ready" &&
        song.status !== "mastered"
    )
    .sort(
      (a, b) =>
        (priority[b.status] ?? 0) -
        (priority[a.status] ?? 0)
    );
}

export function getDaysRemaining(
  eventDate: string
) {
  const today = new Date();
  const event = new Date(
    `${eventDate}T12:00:00`
  );

  today.setHours(12, 0, 0, 0);

  const difference =
    event.getTime() - today.getTime();

  return Math.max(
    0,
    Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    )
  );
}