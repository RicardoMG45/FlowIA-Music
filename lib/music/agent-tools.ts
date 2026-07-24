import { createClient } from "@/lib/supabase/server";
import {
  getDaysRemaining,
  getPreparationScore,
  getPrioritySongs,
  type PreparationSong,
} from "@/lib/music/preparation";



export async function getRepertoire(organizationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("songs")
    .select(`
      id,
      title,
      artist,
      genre,
      status,
      musical_key,
      lead_vocal,
      notes
    `)
    .eq("organization_id", organizationId)
    .order("title");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getUpcomingEvent(organizationId: string) {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
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
    .eq("organization_id", organizationId)
    .gte("event_date", today)
    .neq("status", "cancelled")
    .neq("status", "completed")
    .order("event_date", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getRehearsals(organizationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
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
    .eq("organization_id", organizationId)
    .order("rehearsal_date", {
      ascending: false,
    })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getEventPreparation(organizationId: string) {
  const supabase = await createClient();

  const event = await getUpcomingEvent(
    organizationId
  );

  if (!event) {
    return {
      event: null,
      message: "La organización no tiene eventos próximos.",
    };
  }

  const { data, error } = await supabase
    .from("event_songs")
    .select(`
      position,
      notes,
      songs (
        id,
        title,
        status
      )
    `)
    .eq("event_id", event.id)
    .order("position");

  if (error) {
    throw new Error(error.message);
  }

  const songs: PreparationSong[] = (data ?? []).flatMap(
    (item) => {
      const song = Array.isArray(item.songs)
        ? item.songs[0]
        : item.songs;

      if (!song) return [];

      return [
        {
          id: song.id,
          title: song.title,
          status: song.status,
        },
      ];
    }
  );

  return {
    event,
    daysRemaining: getDaysRemaining(event.event_date),
    preparationScore: getPreparationScore(songs),
    setlistSize: songs.length,
    songs,
    prioritySongs: getPrioritySongs(songs),
  };
}