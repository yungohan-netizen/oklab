import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function Overlay({ 
  scrollProgress,
  hoverIntensity,
  setHoverIntensity 
}: { 
  scrollProgress: number,
  hoverIntensity: number,
  setHoverIntensity: (val: number) => void
}) {
  // Use the same symmetric loop logic for visual consistency
  const loopProgress = 1 - Math.abs(Math.cos(scrollProgress * Math.PI));
  const opacity = 1 - Math.min(loopProgress * 1.5, 1);
  
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Visibility Mask & Grid Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-px h-full bg-white/[0.02]" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-white/[0.02]" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-white/[0.02]" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-white/[0.02]" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/[0.02]" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-white/[0.02]" />
      </div>

      {/* Spectral Ribbon - Mobile Optimization */}
      <div className="absolute left-0 top-0 h-full w-12 flex items-center justify-center pointer-events-auto sm:hidden">
        <motion.div 
          className="h-[40vh] w-[2px] chromatic-spectrum opacity-20 relative group"
          whileTap={{ opacity: 0.8, scaleX: 3 }}
          drag="y"
          dragConstraints={{ top: -100, bottom: 100 }}
          onDrag={(e, info) => {
             // Map vertical drag to hue intensity
             const val = Math.abs(info.point.y / window.innerHeight);
             setHoverIntensity(Math.min(val * 1.5, 1));
          }}
        >
           <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[6px] font-mono opacity-40 uppercase tracking-widest whitespace-nowrap rotate-90 origin-center">Spectral_Hub</div>
           <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[6px] font-mono opacity-40 uppercase tracking-widest whitespace-nowrap rotate-90 origin-center">OKLAB_L5</div>
        </motion.div>
      </div>

      {/* Target Crosshairs - Scaled Down */}
      <div className="absolute top-1/2 left-2 md:left-6 w-4 md:w-6 h-[1px] bg-neon-red shadow-[0_0_8px_rgba(255,0,0,0.4)]" />
      <div className="absolute top-1/2 right-2 md:right-6 w-4 md:w-6 h-[1px] bg-neon-red shadow-[0_0_8px_rgba(255,0,0,0.4)]" />
      <div className="absolute left-1/2 top-2 md:top-6 w-[1px] h-4 md:h-6 bg-neon-red shadow-[0_0_8px_rgba(255,0,0,0.4)]" />
      <div className="absolute left-1/2 bottom-2 md:bottom-6 w-[1px] h-4 md:h-6 bg-neon-red shadow-[0_0_8_rgba(255,0,0,0.4)]" />

      {/* Top Left: System Status - Densified */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 flex flex-col gap-0.5 pointer-events-auto">
        <div className="text-[8px] md:text-[9px] tracking-[0.2em] font-bold text-neon-red uppercase">System Status</div>
        <div className="text-[8px] md:text-[9px] font-mono opacity-40">OKLAB // KERNEL-v5.0.0</div>
        <div className="text-[6px] md:text-[7px] font-mono opacity-20 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-1 group cursor-help transition-opacity hover:opacity-100">
           Da Caravaggio <span className="opacity-40 tracking-normal px-1 md:px-2">—</span> <span className="italic">Chiaroscuro_Optics</span>
        </div>
      </div>

      {/* Scroll Progress Ruler - Densified */}
      <div className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 flex flex-col items-end gap-1 opacity-20 font-mono text-[6px] md:text-[7px]">
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1 md:gap-1.5">
            <span className={cn(scrollProgress * 10 >= i ? "opacity-100 text-neon-red" : "opacity-30")}>
              {String(i * 10).padStart(3, '0')}
            </span>
            <div className={cn(
              "h-[1px] bg-white transition-all duration-500",
              i % 5 === 0 ? "w-2 md:w-3" : "w-1 md:w-1.5",
              scrollProgress * 10 >= i ? "bg-neon-red opacity-100" : "opacity-30"
            )} />
          </div>
        ))}
      </div>

      {/* Top Right: Telemetry - Densified */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 text-right hidden lg:block">
        <div className="text-[9px] tracking-[0.2em] font-bold text-white uppercase mb-0.5">Telemetry</div>
        <div className="flex flex-col gap-px font-mono text-[8px] opacity-30 uppercase">
          <div>FPS: 60.000</div>
          <div>LATENCY: 0.004 MS</div>
          <div>BUFFER: ACTIVE</div>
          <div>TEMP: 32.4 C</div>
        </div>
      </div>

      {/* Bottom Left: Coordinates - Densified */}
      <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
        <div className="text-[8px] md:text-[9px] tracking-[0.2em] font-bold text-white uppercase mb-1">Coordinates</div>
        <div className="flex flex-col font-mono text-[8px] md:text-[9px] leading-tight opacity-40">
          <span>LAT: 50.8949</span>
          <span>LON: 4.3415</span>
          <span className="text-[7px] md:text-[8px] opacity-60">ATOMIUM_v5</span>
        </div>
      </div>

      {/* Bottom Right: Spectral Analyzer - Snatched width */}
      <div className="absolute bottom-4 right-4 md:bottom-10 md:right-10 text-right flex flex-col items-end gap-2 md:gap-4 transition-transform duration-500 hover:translate-x-[-5px]">
        <div className="flex flex-col items-end border-r border-neon-red pr-2 md:pr-3 scale-[0.8] md:scale-90 origin-right">
          <div className="text-[9px] md:text-[10px] tracking-[0.4em] font-black text-neon-red uppercase mb-1">STRESS_TEST</div>
          <div className="text-[7px] md:text-[8px] font-mono max-w-[120px] md:max-w-[140px] opacity-30 uppercase leading-relaxed text-balance">
            Interactive OKLCH. Lightness stabilized.
          </div>
        </div>
        
        <div className="group w-40 md:w-52 overflow-hidden bg-white/[0.01] border border-white/5 p-2 md:p-3 backdrop-blur-md pointer-events-auto transition-all hover:bg-white/[0.03] hover:border-white/20">
          <div className="flex justify-between items-center mb-1.5 md:mb-2">
            <div className="text-[6px] md:text-[7px] font-mono opacity-30 tracking-widest uppercase">Spectrum_Lv5</div>
            <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-neon-red animate-pulse" />
          </div>
          <div className="h-1 w-full chromatic-spectrum mb-2 md:mb-3 relative">
             <div className="absolute inset-0 shadow-[0_0_10px_rgba(255,255,255,0.05)]" />
          </div>
          <div className="flex justify-between items-baseline gap-2 mb-1 md:mb-2">
            <span className="font-display text-[10px] md:text-sm font-black italic tracking-tighter mix-difference">SPECTRA_P3</span>
            <span className="text-[7px] md:text-[8px] font-mono text-neon-red font-bold">STABLE</span>
          </div>
          <div className="text-[6px] md:text-[7px] font-mono opacity-40 leading-relaxed uppercase space-y-1">
            <p className="normal-case opacity-40 leading-tight line-clamp-2">
              Mimicking human perception. Lightness remains stable.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll to Descend Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-50">
        <div className="w-px h-8 bg-white" />
        <div className="text-[9px] tracking-[0.5em] uppercase font-bold text-white">Scroll to descend</div>
        <div className="w-px h-8 bg-white" />
      </div>

      {/* Vertical Navigation Bar (Optional context check) */}
      <div className="fixed right-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "h-1 w-1 transition-all duration-700",
              Math.floor(scrollProgress * 5) === i ? "bg-neon-red scale-[2] h-4" : "bg-white/20"
            )}
          />
        ))}
      </div>
    </div>
  );
}
