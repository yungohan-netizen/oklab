import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Loader() {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent(prev => {
        if (prev >= 100) return 100;
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5, ease: [0.76, 0, 0.24, 1] } }}
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#050505] font-mono overflow-hidden"
    >
      {/* Cinematic Pulse */}
      <motion.div
        animate={{
          scale: [0.8, 1.1, 0.8],
          opacity: [0.1, 0.4, 0.1],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[80vw] h-[80vw] rounded-full border border-white/5"
      />

      <div className="relative flex flex-col items-center gap-8">
        <div className="flex flex-col items-center">
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-[40px] font-display font-black tracking-[-0.05em] mb-2 italic"
          >
            OKLAB
          </motion.h2>
          <div className="h-px w-64 bg-white/10 relative overflow-hidden">
            <motion.div 
              className="absolute inset-0 bg-neon-red"
              initial={{ x: "-100%" }}
              animate={{ x: `${percent - 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-[10px] opacity-30 uppercase tracking-[0.2em] w-80">
          <div className="text-left">Kernel_Link</div>
          <div className="text-right text-neon-red">Established</div>
          <div className="text-left">Spectral_Core</div>
          <div className="text-right">OKLab_v5.0</div>
          <div className="text-left">P3_Gamut</div>
          <div className="text-right">CALIBRATING...</div>
          <div className="text-left font-bold text-white pt-2">System_State</div>
          <div className="text-right font-bold text-white pt-2">{percent}%</div>
        </div>
      </div>

      {/* Decorative Diagnostic Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
        <div className="h-full w-full grid grid-cols-12 grid-rows-12 border-white/10">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-white/20" />
          ))}
        </div>
      </div>

      {/* Floating Artifacts */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-20 text-[8px] opacity-20 tracking-[1em]"
      >
        DA_CARAVAGGIO_ARCHIVE__021
      </motion.div>
    </motion.div>
  );
}
