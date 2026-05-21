"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { uploadPhoto, deletePhoto, updatePhoto } from "../actions";

type Photo = {
  id: string;
  src: string;
  images?: string[];
  alt: string;
  description?: string;
  location?: string;
  date?: string;
  is_hero?: boolean;
};

export default function AdminClient({ photos }: { photos: Photo[] }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [keptImages, setKeptImages] = useState<string[]>([]);
  
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditClick = (photo: Photo) => {
    setEditingPhoto(photo);
    setKeptImages(photo.images && photo.images.length > 0 ? photo.images : [photo.src]);
    setSelectedFiles([]);
    setMessage(null);
    // Scroll ke form di mobile
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingPhoto(null);
    setKeptImages([]);
    setSelectedFiles([]);
    setMessage(null);
  };

  const removeKeptImage = (indexToRemove: number) => {
    setKeptImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Apakah kamu yakin ingin menghapus memori "${title}"? Tindakan ini akan menghapus foto dari galeri selamanya.`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await deletePhoto(id);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: `Memori "${title}" berhasil dihapus!` });
      if (editingPhoto?.id === id) {
        handleCancelEdit();
      }
    }
    setLoading(false);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Validasi gambar wajib ada
    const hasImages = keptImages.length > 0 || selectedFiles.length > 0;
    if (!hasImages) {
      setMessage({ type: "error", text: "Minimal satu foto wajib diunggah/dipertahankan" });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.delete("file");
    selectedFiles.forEach((file) => {
      formData.append("file", file);
    });

    let result;
    if (editingPhoto) {
      result = await updatePhoto(editingPhoto.id, formData, keptImages);
    } else {
      result = await uploadPhoto(formData);
    }

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result.success) {
      setMessage({
        type: "success",
        text: editingPhoto ? "Memori berhasil diperbarui!" : "Foto berhasil ditambahkan ke Galeri!"
      });
      setSelectedFiles([]);
      setEditingPhoto(null);
      setKeptImages([]);
      formRef.current?.reset();
    }
    
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-pink-50 py-16 px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Link */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-pink-600 hover:text-pink-800 transition-colors font-medium inline-flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Beranda
          </Link>
          
          {editingPhoto && (
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Batal Edit / Tambah Baru
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: FORM (Tambah / Edit) */}
          <div className="lg:col-span-5 bg-white rounded-3xl shadow-xl shadow-pink-100 p-8 md:p-10 border border-pink-100 lg:sticky lg:top-8">
            <h1 className="text-3xl font-serif font-bold text-pink-900 mb-2">
              {editingPhoto ? "Edit Memori" : "Tambah Memori Baru"}
            </h1>
            <p className="text-pink-600 mb-8">
              {editingPhoto ? "Ubah detail atau foto dari kenangan kita." : "Tambahkan memori baru ke dalam galeri kita."}
            </p>

            {message && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
              </div>
            )}

            <form 
              ref={formRef} 
              onSubmit={onSubmit} 
              key={editingPhoto ? editingPhoto.id : 'new'} 
              className="space-y-6"
            >
              
              {/* INPUT GAMBAR LAMA (Hanya tampil saat Edit) */}
              {editingPhoto && keptImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-pink-800 mb-2">Foto Saat Ini (Pertahankan):</label>
                  <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-100">
                    {keptImages.map((src, index) => (
                      <div key={src} className="relative aspect-square rounded-xl overflow-hidden group shadow border border-white">
                        <Image
                          src={src}
                          alt="Kept photo"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeKeptImage(index)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] hover:bg-pink-600 transition-colors"
                          title="Hapus foto ini dari memori"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* INPUT GAMBAR BARU */}
              <div>
                <label className="block text-sm font-medium text-pink-800 mb-2">
                  {editingPhoto ? "Tambah Foto Baru (Opsional)" : "Unggah Foto *"}
                </label>
                
                {/* Drag / Click Upload Area */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-pink-200 rounded-2xl p-6 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50/20 transition-all flex flex-col items-center justify-center bg-white group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    name="file" 
                    accept="image/*" 
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <svg className="w-10 h-10 text-pink-400 mb-3 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium text-pink-700">
                    {editingPhoto ? "Klik untuk menambah foto" : "Klik untuk memilih foto-foto"}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">Format PNG, JPG, JPEG (Bisa pilih beberapa)</p>
                </div>

                {/* Thumbnails preview untuk file baru */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <span className="block text-xs font-semibold text-neutral-400 mb-2">Foto Baru Terpilih:</span>
                    <div className="grid grid-cols-3 gap-3 p-3 bg-pink-50/30 rounded-2xl border border-pink-100/50">
                      {selectedFiles.map((file, index) => {
                        const objectUrl = URL.createObjectURL(file);
                        return (
                          <div key={index} className="relative aspect-square rounded-xl overflow-hidden group shadow-md border border-white">
                            <img 
                              src={objectUrl} 
                              alt={file.name} 
                              className="w-full h-full object-cover"
                              onLoad={() => URL.revokeObjectURL(objectUrl)}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSelectedFile(index);
                              }}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] hover:bg-pink-600 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* INPUT DETAIL MEMORI */}
              <div>
                <label className="block text-sm font-medium text-pink-800 mb-2">Judul Singkat *</label>
                <input 
                  type="text" 
                  name="title" 
                  required
                  defaultValue={editingPhoto ? editingPhoto.alt : ""}
                  placeholder="Cth: Kencan Pertama"
                  className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-neutral-800 bg-pink-50/30"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-pink-800 mb-2">Tanggal (Opsional)</label>
                  <input 
                    type="text" 
                    name="date" 
                    defaultValue={editingPhoto?.date || ""}
                    placeholder="Cth: 14 Feb 2024"
                    className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-neutral-800 bg-pink-50/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-pink-800 mb-2">Lokasi (Opsional)</label>
                  <input 
                    type="text" 
                    name="location" 
                    defaultValue={editingPhoto?.location || ""}
                    placeholder="Cth: Cafe Senja, Jakarta"
                    className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-neutral-800 bg-pink-50/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-pink-800 mb-2">Cerita / Deskripsi (Opsional)</label>
                <textarea 
                  name="description" 
                  rows={3}
                  defaultValue={editingPhoto?.description || ""}
                  placeholder="Ceritakan momen manis di balik foto ini..."
                  className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-neutral-800 bg-pink-50/30 resize-none"
                ></textarea>
              </div>

              {/* Tampilkan di Beranda Checkbox */}
              <div className="flex items-center gap-2.5 py-1 bg-pink-50/20 px-3 py-2.5 rounded-xl border border-pink-100/50">
                <input 
                  type="checkbox" 
                  name="is_hero" 
                  id="is_hero"
                  defaultChecked={editingPhoto ? !!editingPhoto.is_hero : false}
                  className="w-4 h-4 text-pink-600 border-pink-300 rounded focus:ring-pink-400 cursor-pointer accent-pink-500"
                />
                <label htmlFor="is_hero" className="text-xs font-semibold text-pink-800 cursor-pointer select-none">
                  Tampilkan memori ini di halaman Beranda (Hero Polaroid)
                </label>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4">
                {editingPhoto && (
                  <button 
                    type="button" 
                    onClick={handleCancelEdit}
                    className="flex-1 py-3.5 rounded-xl font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-all text-center"
                  >
                    Batal
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all duration-300 ${
                    loading ? 'bg-pink-300 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600 hover:shadow-pink-500/40 hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? 'Menyimpan...' : (editingPhoto ? 'Simpan Perubahan' : 'Simpan Foto')}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: LIST OF MEMORIES */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl shadow-pink-100 p-8 md:p-10 border border-pink-100 min-h-[500px]">
            <h2 className="text-2xl font-serif font-bold text-pink-900 mb-2">Daftar Memori Kenangan</h2>
            <p className="text-pink-600 mb-8">Kelola, edit, atau hapus memori yang sudah diunggah ke galeri.</p>

            {photos.length === 0 ? (
              <div className="text-center py-20 text-neutral-400 font-light">
                <svg className="w-16 h-16 mx-auto text-pink-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Belum ada memori di galeri. Silakan tambah memori baru.
              </div>
            ) : (
              <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 scrollbar-thin">
                {photos.map((photo) => {
                  const imgCount = photo.images ? photo.images.length : 1;
                  return (
                    <div 
                      key={photo.id}
                      className={`flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                        editingPhoto?.id === photo.id 
                          ? "bg-pink-50/55 border-pink-300 ring-2 ring-pink-100" 
                          : "bg-white border-neutral-100 hover:border-pink-200 hover:shadow-md"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-full sm:w-24 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                        <Image
                          src={photo.src}
                          alt={photo.alt}
                          fill
                          className="object-cover"
                        />
                        {imgCount > 1 && (
                          <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                            {imgCount} Foto
                          </div>
                        )}
                      </div>

                      {/* Info Text */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                           <div className="flex items-center gap-2">
                            <h3 className="font-serif font-bold text-neutral-800 text-lg truncate" title={photo.alt}>
                              {photo.alt}
                            </h3>
                            {photo.is_hero && (
                              <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                📌 Beranda
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-neutral-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                            {photo.date && (
                              <span className="flex items-center">
                                <svg className="w-3.5 h-3.5 mr-1 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {photo.date}
                              </span>
                            )}
                            {photo.location && (
                              <span className="flex items-center">
                                <svg className="w-3.5 h-3.5 mr-1 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                {photo.location}
                              </span>
                            )}
                          </p>

                          <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed italic">
                            "{photo.description || "Belum ada cerita..."}"
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end mt-4 pt-3 border-t border-neutral-100">
                          <button
                            onClick={() => handleEditClick(photo)}
                            className="text-xs font-semibold text-neutral-600 hover:text-pink-600 hover:bg-pink-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(photo.id, photo.alt)}
                            className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
