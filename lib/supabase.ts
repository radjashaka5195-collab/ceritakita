import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "Peringatan: Kredensial Supabase (NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY) belum dikonfigurasi di file .env.local"
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseServiceKey || "");
