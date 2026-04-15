"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createDqcPublishTask, generateDqcPublishDiff } from "../../lib/api";

function getStringList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

export async function createDqcPublishTaskAction(formData: FormData) {
  const tableIds = getStringList(formData, "tableIds");

  const created = await createDqcPublishTask({
    title: String(formData.get("title") ?? "").trim(),
    tableIds,
    createdBy: "usr_dw_1"
  });

  await generateDqcPublishDiff(created.id);

  revalidatePath("/");
  revalidatePath("/dqc-publish");
  redirect(`/dqc-publish/${created.id}/diff`);
}
