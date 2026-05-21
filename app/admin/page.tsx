import AdminClient from "./AdminClient";
import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let photos = [];
  
  try {
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }
    photos = data || [];
  } catch (error) {
    console.error("Gagal mengambil data foto dari Supabase:", error);
    photos = [];
  }

  return <AdminClient photos={photos} />;
}
