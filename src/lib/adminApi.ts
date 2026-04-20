import { supabase } from "@/integrations/supabase/client";

export async function listUsersByRole(role: "student" | "teacher") {
  const { data: roleRows, error: rErr } = await supabase
    .from("user_roles")
    .select("user_id, created_at")
    .eq("role", role);
  if (rErr) throw rErr;
  const ids = (roleRows ?? []).map((r) => r.user_id);
  if (ids.length === 0) return [];
  const { data: profs, error: pErr } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at")
    .in("id", ids);
  if (pErr) throw pErr;
  return (profs ?? []).sort((a, b) =>
    (a.full_name ?? "").localeCompare(b.full_name ?? "")
  );
}

export async function createUser(payload: {
  email: string;
  password: string;
  full_name: string;
  role: "student" | "teacher";
}) {
  const { data, error } = await supabase.functions.invoke("admin-create-user", {
    body: payload,
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data;
}

export async function deleteUser(user_id: string) {
  const { data, error } = await supabase.functions.invoke("admin-delete-user", {
    body: { user_id },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data;
}
