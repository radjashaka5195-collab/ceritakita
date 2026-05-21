import Link from "next/link";
import Image from "next/image";
import GalleryClient from "./galeri/GalleryClient";
import { supabase } from "../lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
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

  const heroPhotos = photos.filter((p: any) => p.is_hero === true);
  const heroPhoto1 = heroPhotos[0]?.src || "/images/galeri/cafe-date-1.jpg";
  const heroPhoto2 = heroPhotos[1]?.src || "/images/galeri/cafe-date-2.jpg";

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfaf6] relative overflow-hidden">
        {/* Soft elegant gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-rose-50/30 to-orange-50/20"></div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-orange-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>

        <main className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 max-w-7xl mx-auto w-full pt-20 lg:pt-32 pb-20 gap-12 lg:gap-8">
          
          {/* Left Column: Text */}
          <div className="w-full lg:flex-1 text-center lg:text-left space-y-8 lg:pr-12">
            <div>
              <h2 className="text-xs md:text-sm font-sans tracking-[0.4em] text-pink-500 uppercase font-semibold mb-6 inline-block border-b border-pink-200 pb-2">The Story of Us</h2>
              <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-serif font-medium text-neutral-800 tracking-tighter leading-[1.1] mb-2 drop-shadow-sm">
                Radja <br className="hidden lg:block"/>
                <span className="font-light italic text-pink-400">&</span> Bila
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-neutral-500 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
              Sebuah ruang kecil untuk mendokumentasikan setiap perjalanan dan cerita yang kita bagi bersama.
            </p>
            
            <div className="pt-6 flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <a 
                href="#galeri"
                className="group relative px-10 py-5 bg-neutral-900 text-white rounded-full font-sans text-sm tracking-widest uppercase overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-pink-900/20"
              >
                <span className="relative z-10 font-medium transition-colors group-hover:text-white">Jelajahi Memori</span>
                <div className="absolute inset-0 bg-pink-500 transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100"></div>
              </a>
            </div>
          </div>

          {/* Right Column: Floating Double Polaroids */}
          <div className="w-full lg:flex-1 relative h-[320px] sm:h-[450px] md:h-[600px] flex items-center justify-center lg:justify-end">
            
            {/* Background Blob just for the photos */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-rose-300/40 rounded-full mix-blend-multiply filter blur-3xl"></div>

            {/* Photo 2 (Back) */}
            <div className="absolute w-36 h-48 sm:w-48 sm:h-64 md:w-64 md:h-[340px] lg:w-72 lg:h-[384px] bg-white p-2.5 sm:p-3 pb-10 sm:pb-14 shadow-2xl shadow-pink-900/10 transform rotate-6 translate-x-10 sm:translate-x-12 md:translate-x-24 -translate-y-6 sm:-translate-y-8 hover:rotate-12 hover:-translate-y-12 transition-all duration-700 rounded-sm z-10">
              <div className="relative w-full h-full overflow-hidden bg-neutral-100 filter grayscale hover:grayscale-0 transition-all duration-700">
                <Image
                  src={heroPhoto2}
                  alt="Our Photo 2"
                  fill
                  sizes="(max-width: 640px) 150px, (max-width: 768px) 200px, 300px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Photo 1 (Front) */}
            <div className="absolute w-44 h-[220px] sm:w-56 sm:h-[280px] md:w-72 md:h-[360px] lg:w-80 lg:h-[400px] bg-white p-2.5 sm:p-3 pb-12 sm:pb-16 shadow-2xl shadow-neutral-900/20 transform -rotate-6 -translate-x-6 sm:-translate-x-8 md:-translate-x-12 translate-y-6 sm:translate-y-12 hover:-rotate-3 hover:scale-105 hover:translate-y-8 transition-all duration-700 rounded-sm z-20">
              <div className="relative w-full h-full overflow-hidden bg-neutral-100">
                <Image
                  src={heroPhoto1}
                  alt="Our Photo 1"
                  fill
                  sizes="(max-width: 640px) 180px, (max-width: 768px) 250px, 350px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>

          </div>
        </main>

      {/* CSS untuk animasi blob (sebagai fallback Tailwind utility) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}} />
      </div>

      <div id="galeri">
        <GalleryClient photos={photos} />
      </div>
    </>
  );
}
