"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function createEvent(
  formData: FormData
) {
  const supabase = await createClient();

  const name =
    formData.get("name")?.toString().trim();

  const eventDate =
    formData.get("event_date")?.toString();

  if (!name || !eventDate) {
    throw new Error(
      "Nombre y fecha son obligatorios."
    );
  }

  const { data: organization, error: organizationError } =
    await supabase
      .from("organizations")
      .select("id")
      .eq("slug", "blue-rose")
      .single();

  if (organizationError || !organization) {
    throw new Error(
      "No se pudo encontrar Blue Rose."
    );
  }

  const { error } = await supabase
    .from("events")
    .insert({
      organization_id: organization.id,
      name,
      event_date: eventDate,
      start_time: nullableString(
        formData.get("start_time")
      ),
      location: nullableString(
        formData.get("location")
      ),
      event_type: nullableString(
        formData.get("event_type")
      ),
      notes: nullableString(
        formData.get("notes")
      ),
      status:
        formData.get("status")?.toString() ??
        "planned",
    });

  if (error) {
    console.error("Event insert error:", error);

    throw new Error(
      `No se pudo guardar el evento: ${error.message}`
    );
  }

  revalidatePath("/events");
  revalidatePath("/dashboard");

  redirect("/events");
}

function nullableString(
  value: FormDataEntryValue | null
) {
  const text = value?.toString().trim();

  return text ? text : null;
}