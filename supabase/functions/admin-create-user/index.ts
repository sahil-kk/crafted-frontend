// Admin-only edge function to create student/teacher users with an email + temp password.
// Caller must be authenticated and have the 'admin' role.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Payload {
  email: string;
  password: string;
  full_name?: string;
  role: "student" | "teacher";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
      Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Missing auth" }, 401);
    }

    // Verify caller
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: "Invalid session" }, 401);
    }

    // Check admin role via RPC (uses caller's JWT → RLS/security definer)
    const { data: isAdmin, error: roleErr } = await userClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (roleErr || !isAdmin) {
      return json({ error: "Forbidden: admin only" }, 403);
    }

    const body = (await req.json()) as Payload;
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const full_name = (body.full_name ?? "").trim();
    const role = body.role;

    if (!email || !password || !["student", "teacher"].includes(role)) {
      return json({ error: "Invalid payload" }, 400);
    }
    if (password.length < 8) {
      return json({ error: "Password must be at least 8 characters" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Create the user (email confirmed so they can log in right away)
    const { data: created, error: createErr } = await admin.auth.admin
      .createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });

    if (createErr || !created.user) {
      return json({ error: createErr?.message ?? "Create failed" }, 400);
    }

    const newUserId = created.user.id;

    // The handle_new_user trigger inserts a 'student' role by default.
    // If requested role is teacher, upgrade it.
    if (role === "teacher") {
      await admin.from("user_roles").delete().eq("user_id", newUserId);
      await admin
        .from("user_roles")
        .insert({ user_id: newUserId, role: "teacher" });
    }

    // Keep profile full_name in sync
    if (full_name) {
      await admin
        .from("profiles")
        .update({ full_name, email })
        .eq("id", newUserId);
    }

    return json({ ok: true, user_id: newUserId });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
