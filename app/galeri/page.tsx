import fs from "fs/promises";
import path from "path";
import GalleryClient from "./GalleryClient";

// Force dynamic untuk memastikan data terbaru selalu diambil
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const dataPath = path.join(process.cwd(), "data", "photos.json");
  let photos = [];
  
  try {
    const fileContent = await fs.readFile(dataPath, "utf-8");
    photos = JSON.parse(fileContent);
  } catch (error) {
    console.error("Gagal membaca database foto lokal:", error);
    // Kosong jika belum ada file/foto
    photos = [];
  }

  return <GalleryClient photos={photos} />;
}
