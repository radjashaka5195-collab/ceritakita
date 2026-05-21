"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "../lib/supabase";

export async function uploadPhoto(formData: FormData) {
  try {
    if (!supabase) {
      return { error: "Koneksi Supabase belum dikonfigurasi. Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah dimasukkan di Vercel." };
    }
    const files = formData.getAll("file") as File[];
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const date = formData.get("date") as string;

    if (!files || files.length === 0 || (files.length === 1 && files[0].size === 0)) {
      return { error: "Foto wajib diunggah" };
    }

    if (!title) {
      return { error: "Judul wajib diisi" };
    }

    const savedPaths: string[] = [];

    for (const file of files) {
      if (file.size === 0) continue;
      
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from("photos")
        .upload(filename, buffer, {
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Gagal mengunggah ke Supabase Storage:", uploadError);
        return { error: `Gagal mengunggah file ${file.name}` };
      }

      const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(filename);
      savedPaths.push(publicUrl);
    }

    if (savedPaths.length === 0) {
      return { error: "Gagal mengunggah file gambar" };
    }

    const is_hero = formData.get("is_hero") === "on";

    const newPhoto = {
      id: Date.now().toString(),
      src: savedPaths[0],
      images: savedPaths,
      alt: title,
      description,
      location,
      date,
      is_hero
    };

    const { error: insertError } = await supabase
      .from("photos")
      .insert(newPhoto);

    if (insertError) {
      console.error("Gagal menyisipkan ke tabel database:", insertError);
      return { error: "Gagal menyimpan metadata ke database" };
    }

    revalidatePath("/galeri");
    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Terjadi kesalahan saat mengunggah foto" };
  }
}

export async function deletePhoto(id: string) {
  try {
    if (!supabase) {
      return { error: "Koneksi Supabase belum dikonfigurasi. Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah dimasukkan di Vercel." };
    }
    const { data: photoToDelete, error: fetchError } = await supabase
      .from("photos")
      .select("images, src")
      .eq("id", id)
      .single();

    if (fetchError || !photoToDelete) {
      console.error("Gagal mengambil data sebelum dihapus:", fetchError);
      return { error: "Foto tidak ditemukan di database" };
    }

    // Hapus file gambar fisik dari Supabase Storage
    const imagesToDelete = photoToDelete.images && photoToDelete.images.length > 0
      ? photoToDelete.images
      : [photoToDelete.src];

    const filenames = imagesToDelete.map((url: string) => {
      const parts = url.split("/");
      return parts[parts.length - 1];
    });

    if (filenames.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("photos")
        .remove(filenames);
      if (storageError) {
        console.warn("Peringatan: Gagal menghapus beberapa file di storage:", storageError);
      }
    }

    // Hapus dari database
    const { error: deleteError } = await supabase
      .from("photos")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Gagal menghapus dari database:", deleteError);
      return { error: "Gagal menghapus data dari database" };
    }

    revalidatePath("/galeri");
    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { error: "Terjadi kesalahan saat menghapus memori" };
  }
}

export async function updatePhoto(id: string, formData: FormData, keptImages: string[]) {
  try {
    if (!supabase) {
      return { error: "Koneksi Supabase belum dikonfigurasi. Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah dimasukkan di Vercel." };
    }
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const date = formData.get("date") as string;
    const files = formData.getAll("file") as File[];

    if (!title) {
      return { error: "Judul wajib diisi" };
    }

    const { data: existingPhoto, error: fetchError } = await supabase
      .from("photos")
      .select("images, src")
      .eq("id", id)
      .single();

    if (fetchError || !existingPhoto) {
      return { error: "Memori tidak ditemukan di database" };
    }

    // Simpan gambar baru jika ada
    const newSavedPaths: string[] = [];
    for (const file of files) {
      if (file.size === 0) continue;
      
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(filename, buffer, {
          contentType: file.type,
        });

      if (uploadError) {
        console.error(`Gagal mengunggah file ${file.name} ke storage:`, uploadError);
        return { error: `Gagal mengunggah file ${file.name}` };
      }

      const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(filename);
      newSavedPaths.push(publicUrl);
    }

    // Gabungkan gambar lama yang dipertahankan dengan gambar baru
    const finalImages = [...keptImages, ...newSavedPaths];

    if (finalImages.length === 0) {
      return { error: "Minimal satu foto wajib dipertahankan" };
    }

    // Hapus file fisik gambar yang dibuang dari memori
    const previousImages = existingPhoto.images && existingPhoto.images.length > 0
      ? existingPhoto.images
      : [existingPhoto.src];

    const imagesToRemove = previousImages.filter((img: string) => !keptImages.includes(img));
    const filenamesToRemove = imagesToRemove.map((url: string) => {
      const parts = url.split("/");
      return parts[parts.length - 1];
    });

    if (filenamesToRemove.length > 0) {
      const { error: removeError } = await supabase.storage
        .from("photos")
        .remove(filenamesToRemove);
      if (removeError) {
        console.warn("Peringatan: Gagal menghapus gambar usang dari storage:", removeError);
      }
    }

    const is_hero = formData.get("is_hero") === "on";

    // Perbarui data di database
    const { error: updateError } = await supabase
      .from("photos")
      .update({
        src: finalImages[0],
        images: finalImages,
        alt: title,
        description,
        location,
        date,
        is_hero
      })
      .eq("id", id);

    if (updateError) {
      console.error("Gagal memperbarui database:", updateError);
      return { error: "Gagal menyimpan perubahan ke database" };
    }

    revalidatePath("/galeri");
    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Update error:", error);
    return { error: "Terjadi kesalahan saat memperbarui memori" };
  }
}
