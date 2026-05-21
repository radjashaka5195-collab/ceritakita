"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

export default function GalleryClient({ photos }: { photos: Photo[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fungsi untuk menutup modal jika klik di luar gambar
  const handleCloseModal = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectedPhoto(null);
    }
  };

  const modalImages = selectedPhoto?.images && selectedPhoto.images.length > 0
    ? selectedPhoto.images
    : [selectedPhoto?.src || ""];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? modalImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === modalImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="py-24 px-6 relative bg-[#fdfaf6]">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-sm md:text-base font-sans tracking-[0.3em] text-pink-400 uppercase font-medium mb-4">Arsip Memori</h2>
          <h1 className="text-4xl md:text-6xl font-serif italic mb-6 tracking-tight text-neutral-800">
            Cerita Kita
          </h1>
          <p className="text-lg text-neutral-500 max-w-xl mx-auto font-light leading-relaxed">
            Catatan kecil dan potret dari setiap hari yang kita lalui bersama. Klik foto untuk membaca ceritanya.
          </p>
        </div>

        {/* Photo Grid (Scattered Polaroids) */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 mt-12">
          {photos.map((photo, index) => {
            const rotations = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3", "-rotate-2"];
            const rotationClass = rotations[index % rotations.length];
            const hasMultipleImages = photo.images && photo.images.length > 1;
            
            return (
              <div
                key={photo.id}
                onClick={() => {
                  setSelectedPhoto(photo);
                  setCurrentImageIndex(0);
                }}
                className={`group relative w-[290px] sm:w-[340px] transform ${rotationClass} hover:rotate-0 hover:-translate-y-4 transition-all duration-500 cursor-pointer`}
              >
                {/* Stacked decorative cards behind (fanning out on hover) */}
                {hasMultipleImages && (
                  <>
                    {/* Card 2 (behind, rotated left) */}
                    <div className="absolute inset-0 bg-white shadow-md rounded-sm transform -rotate-3 translate-y-1 -translate-x-1 group-hover:-rotate-8 group-hover:-translate-x-4 group-hover:translate-y-2 transition-all duration-500 border border-neutral-100 z-10" />
                    {/* Card 3 (behind, rotated right) */}
                    <div className="absolute inset-0 bg-white shadow-sm rounded-sm transform rotate-3 translate-y-2 translate-x-1 group-hover:rotate-8 group-hover:translate-x-4 group-hover:translate-y-3 transition-all duration-500 border border-neutral-100 z-0" />
                  </>
                )}

                {/* Main Polaroid Card */}
                <div className="relative bg-white p-4 pb-16 shadow-xl group-hover:shadow-2xl group-hover:shadow-pink-900/10 transition-all duration-500 rounded-sm z-20 border border-neutral-100/50">
                  <div className="relative w-full aspect-[4/5] overflow-hidden bg-neutral-100 mb-4">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110 filter saturate-90 group-hover:saturate-100"
                      sizes="(max-width: 768px) 100vw, 340px"
                    />
                    
                    {/* Multiple Photos Badge */}
                    {hasMultipleImages && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-md border border-white/50 z-30 flex items-center gap-1.5 transform group-hover:scale-105 transition-transform duration-300">
                        <svg className="w-3.5 h-3.5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] font-sans font-bold text-neutral-700 tracking-wider">
                          {photo.images!.length} Foto
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Polaroid Caption */}
                  <div className="absolute bottom-5 w-full left-0 px-4 text-center">
                    <h3 className="font-serif italic text-xl text-neutral-700 truncate">
                      {photo.alt}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal / Lightbox */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8 transition-opacity duration-300"
            onClick={handleCloseModal}
          >
            <div className="bg-[#fdfaf6] w-full max-w-6xl rounded-sm overflow-hidden flex flex-col md:flex-row shadow-2xl relative animate-in fade-in zoom-in duration-500">
              
              {/* Tombol Tutup (Mobile) */}
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center md:hidden"
              >
                ✕
              </button>

              {/* Sisi Kiri: Foto Besar / Carousel */}
              <div className="w-full md:w-1/2 bg-black relative min-h-[50vh] md:min-h-[80vh] flex items-center justify-center group/carousel">
                <Image
                  src={modalImages[currentImageIndex]}
                  alt={selectedPhoto.alt}
                  fill
                  className="object-contain transition-all duration-500 ease-in-out"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />

                {/* Left/Right Controls */}
                {modalImages.length > 1 && (
                  <>
                    {/* Tombol Kiri */}
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-sm transition-all duration-300 shadow-lg border border-white/10 active:scale-95"
                      aria-label="Foto Sebelumnya"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Tombol Kanan */}
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-sm transition-all duration-300 shadow-lg border border-white/10 active:scale-95"
                      aria-label="Foto Selanjutnya"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Lencana Indikator Posisi (Top-Left) */}
                    <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs font-semibold tracking-wider font-sans border border-white/15">
                      {currentImageIndex + 1} / {modalImages.length}
                    </div>

                    {/* Titik-titik Pagination (Bottom) */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-full border border-white/10">
                      {modalImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(idx);
                          }}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            idx === currentImageIndex 
                              ? "bg-white scale-125 shadow-md shadow-white/50" 
                              : "bg-white/40 hover:bg-white/70"
                          }`}
                          aria-label={`Ke foto ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Sisi Kanan: Detail & Deskripsi */}
              <div className="w-full md:w-1/2 bg-[#fdfaf6] p-8 md:p-14 flex flex-col max-h-[60vh] md:max-h-[80vh] overflow-y-auto relative">
                
                {/* Tombol Tutup (Desktop) */}
                <button 
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-6 right-6 w-8 h-8 text-neutral-400 hover:text-neutral-800 transition-colors hidden md:flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="mb-6">
                  <h2 className="text-4xl font-serif italic text-neutral-800 leading-tight mb-2">
                    {selectedPhoto.alt}
                  </h2>
                </div>

                <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-neutral-400 mb-10 border-b border-neutral-200 pb-8 uppercase tracking-widest font-sans">
                  {selectedPhoto.date && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {selectedPhoto.date}
                    </div>
                  )}
                  {selectedPhoto.location && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {selectedPhoto.location}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h4 className="text-xs tracking-[0.2em] uppercase font-semibold text-neutral-400 mb-4">Cerita Momen Ini</h4>
                  <p className="text-neutral-600 leading-loose font-light text-lg">
                    {selectedPhoto.description || "Belum ada cerita yang ditulis untuk foto ini."}
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
