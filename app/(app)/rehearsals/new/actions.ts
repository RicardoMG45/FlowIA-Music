"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function createRehearsal(
  formData: FormData
) {
  const supabase = await createClient();

  const rehearsalDate = formData
    .get("rehearsal_date")
    ?.toString();

  if (!rehearsalDate) {
    throw new Error(
      "La fecha del ensayo es obligatoria."
    );
  }

  const {
    data: organization,
    error: organizationError,
  } = await supabase
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
    .from("rehearsals")
    .insert({
      organization_id: organization.id,

      rehearsal_date: rehearsalDate,

      start_time: nullableString(
        formData.get("start_time")
      ),

      end_time: nullableString(
        formData.get("end_time")
      ),

      location: nullableString(
        formData.get("location")
      ),

      objective: nullableString(
        formData.get("objective")
      ),

      notes: nullableString(
        formData.get("notes")
      ),

      status:
        formData.get("status")?.toString() ??
        "planned",
    });

  if (error) {
    console.error(
      "Rehearsal insert error:",
      error
    );

    throw new Error(
      `No se pudo crear el ensayo: ${error.message}`
    );
  }

  revalidatePath("/rehearsals");
  revalidatePath("/dashboard");

  redirect("/rehearsals");
}

function nullableString(
  value: FormDataEntryValue | null
) {
  const text = value?.toString().trim();

  return text ? text : null;
}