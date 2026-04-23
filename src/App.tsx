/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence } from 'motion/react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Environment, PerspectiveCamera, Float } from '@react-three/drei';
import { motion } from 'motion/react';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';

import Scene from './components/Scene';
import Overlay from './components/Overlay';
import Loader from './components/Loader';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoverIntensity, setHoverIntensity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial tension phase
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    // Smooth Scroll Setup
    const lenis = new Lenis({
      duration: 0.8, // Ultra-responsive scroll
      infinite: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1.4,
      touchMultiplier: 2.2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // GSAP Scroll Bridge
    ScrollTrigger.create({
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    const handlePointerMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      const dist = Math.sqrt(Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2));
      setHoverIntensity(Math.min(dist * 2.5, 1));
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta && e.gamma) {
        // Map tilt (beta/gamma) to a subtle hue shift
        // Beta is front-back tilt (-180 to 180)
        // Gamma is left-right tilt (-90 to 90)
        const tilt = Math.sqrt(Math.pow(e.beta / 45, 2) + Math.pow(e.gamma / 45, 2));
        setHoverIntensity(prev => Math.max(prev, Math.min(tilt, 1)));
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      clearTimeout(timer);
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return (
    <div className="relative h-[1000vh] w-full bg-[#050505]">
      <AnimatePresence>
        {loading && <Loader key="loader" />}
      </AnimatePresence>

      {/* 3D Stage */}
      <div className="fixed inset-0 h-screen w-full">
        <Canvas 
          flat 
          dpr={[1, 2]} 
          gl={{ antialias: false, powerPreference: "high-performance" }}
        >
          <Suspense fallback={null}>
            <Scene scrollProgress={scrollProgress} hoverIntensity={hoverIntensity} />
            <Environment preset="city" />
            <EffectComposer multisampling={0}>
              <Bloom 
                intensity={1.8} 
                mipmapBlur 
                luminanceThreshold={0.05} 
                radius={0.5}
              />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
              <Noise opacity={0.02} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      {/* System Mask & Cinematic Overlays */}
      <div className="system-mask" />
      <div className="grain" />

      {/* UI Elements */}
      <Overlay 
        scrollProgress={scrollProgress} 
        hoverIntensity={hoverIntensity} 
        setHoverIntensity={setHoverIntensity} 
      />
      
      {/* Scroll Sections - Awwwards Polish */}
      <section className="relative h-[150vh] pointer-events-none" />
      
      <section className="relative h-[200vh] px-8 md:px-16 overflow-visible">
         <div className="sticky top-0 h-screen flex flex-col justify-center items-start max-w-3xl pointer-events-none">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 0.4, x: 0 }}
              className="terminal-text mb-3"
            >
              01 // THE_VISION
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[7vw] md:text-[90px] font-black leading-[0.85] tracking-tight mix-difference uppercase mb-6"
            >
              Redefining <br/> 
              <span className="italic text-transparent border-white stroke-white webkit-text-stroke-1 opacity-80">Digital</span> Alchemy
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.5 }}
              transition={{ delay: 0.6 }}
              className="max-w-sm text-xs md:text-sm leading-relaxed mix-difference"
            >
              We operate at the intersection of human perception and mathematical precision. By leveraging OKLab-native workflows, we achieve visual stability once considered impossible.
            </motion.p>
         </div>
      </section>

      <section className="relative h-[200vh] px-8 md:px-16 text-right flex justify-end">
         <div className="sticky top-0 h-screen flex flex-col justify-center items-end max-w-3xl pointer-events-none">
            <motion.span 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 0.4, x: 0 }}
              className="terminal-text mb-3"
            >
              02 // THE_CRAFT
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[7vw] md:text-[90px] font-black leading-[0.85] tracking-tight mix-difference uppercase mb-6"
            >
              Bespoke <br/> 
              Perceptual <br/>
              <span className="bg-neon-red px-3 italic text-black selection:bg-white selection:text-black">Optics</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.5 }}
              transition={{ delay: 0.6 }}
              className="max-w-sm text-xs md:text-sm leading-relaxed text-right mix-difference"
            >
              Every pixel is calibrated to the biological limit of the human retina. Our spectral cores ensure every transition resonates with absolute clarity.
            </motion.p>
         </div>
      </section>

      <section className="relative h-[200vh] px-6 md:px-16">
         <div className="sticky top-0 h-screen flex flex-col justify-center items-center max-w-full text-center pointer-events-none">
            <div className="w-full flex flex-col items-center">
              <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.4 }}
                className="terminal-text mb-4 md:mb-6"
              >
                03 // THE_REINCARNATION
              </motion.span>
              <motion.h2 
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                className="font-display text-[10vw] md:text-[80px] lg:text-[100px] font-black leading-[0.9] tracking-tighter mix-difference uppercase max-w-5xl"
              >
                The Digital <br/> Chiaroscuro
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 0.7, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 md:mt-8 max-w-lg text-[10px] md:text-xs leading-relaxed mix-difference uppercase tracking-widest px-4"
              >
                Da Caravaggio — Web designer exploring the frontiers of OKLab Lv. 4 & 5. 
                Everything is color and light. A next-gen reincarnation of master optics for the spatial web.
              </motion.p>
              <div className="mt-8 md:mt-12 flex flex-wrap justify-center gap-6 md:gap-16 terminal-text mix-difference uppercase tracking-[0.4em] md:tracking-[0.8em] text-[7px] md:text-[10px]">
                <span>SPECTRAL_SYNC</span>
                <span>OKLAB_NATIVE</span>
                <span>DARK_MODE_ONLY</span>
              </div>
            </div>
         </div>
      </section>

      <section className="relative h-[100vh] pointer-events-none" />
    </div>
  );
}
