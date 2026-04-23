import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useMatcapTexture, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// Simplex 3D Noise Shader Chunk
const noiseShader = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0);
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(mod289(i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + mod289(i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + mod289(i.x + vec4(0.0, i1.x, i2.x, 1.0)));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const LiquidSphere = ({ scrollProgress, hoverIntensity }: { scrollProgress: number, hoverIntensity: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [scale, setScale] = useState(0);
  const { viewport } = useThree();
  
  // Responsive scale factor: smaller on mobile viewports
  const viewportScale = Math.min(viewport.width / 14, 1);
  
  // Use a reliable chrome-like matcap
  const [matcap] = useMatcapTexture('3B3C3F_DAD9D5_929290_ABACA8', 128);

  useEffect(() => {
     // Explosion intro - slower and more cinematic
     gsap.to({ val: 0 }, {
       val: 1,
       duration: 3.5,
       ease: "power4.out",
       delay: 0.8,
       onUpdate: function() {
         setScale(this.targets()[0].val);
       }
     });
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uScroll.value = scrollProgress;
      materialRef.current.uniforms.uHover.value = hoverIntensity;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.z += 0.002;
      meshRef.current.scale.setScalar(scale * viewportScale);
    }
  });

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uHover: { value: 0 },
      uMatcap: { value: matcap },
    },
    vertexShader: `
      varying vec2 vN;
      varying float vNoise;
      varying vec3 vWorldPos;
      uniform float uTime;
      uniform float uScroll;
      ${noiseShader}
      
      void main() {
        vNoise = snoise(position * 1.5 + uTime * 0.2);
        float displacement = vNoise * 0.25 * (1.0 - uScroll);
        vec3 newPosition = position + normal * displacement;
        
        vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
        vWorldPos = worldPosition.xyz;
        
        vec4 modelViewPosition = modelViewMatrix * vec4(newPosition, 1.0);
        gl_Position = projectionMatrix * modelViewPosition;
        
        vec3 e = normalize(modelViewPosition.xyz);
        vec3 n = normalize(normalMatrix * normal);
        vec3 r = reflect(e, n);
        float m = 2.0 * sqrt(pow(r.x, 2.0) + pow(r.y, 2.0) + pow(r.z + 1.0, 2.0));
        vN = r.xy / m + 0.5;
      }
    `,
    fragmentShader: `
      varying vec2 vN;
      varying float vNoise;
      varying vec3 vWorldPos;
      uniform sampler2D uMatcap;
      uniform float uTime;
      uniform float uScroll;
      uniform float uHover;
      
      // Fast conversion from OKLab to Linear RGB
      vec3 oklab_to_rgb(vec3 c) {
          float l_ = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
          float m_ = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
          float s_ = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
          l_ = l_*l_*l_; m_ = m_*m_*m_; s_ = s_*s_*s_;
          return vec3(
              +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
              -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
              -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_
          );
      }

      void main() {
        // High-fidelity chromatic shift based on normal and hover
        vec3 colorR = texture2D(uMatcap, vN + vec2(uHover * 0.05, 0.0)).rgb;
        vec3 colorG = texture2D(uMatcap, vN).rgb;
        vec3 colorB = texture2D(uMatcap, vN - vec2(uHover * 0.05, 0.0)).rgb;
        vec3 chrome = vec3(colorR.r, colorG.g, colorB.b);
        
        // Interactive OKLCH aura: perceptual uniformity demo
        float l = 0.5 + uHover * 0.25;
        float hue = atan(vWorldPos.y, vWorldPos.x) + uHover * 6.28 + uTime * 0.5;
        float chroma = 0.4 * uHover;
        
        vec3 oklch_core = oklab_to_rgb(vec3(l, chroma * cos(hue), chroma * sin(hue)));
        
        // Dynamic balance between glass and chroma
        vec3 finalColor = mix(chrome, oklch_core, uHover * 0.85);
        finalColor += pow(vNoise, 3.0) * 0.2 * uHover; // Add sparkle where noise peaks
        
        // Fade out based on scroll
        float alpha = 1.0 - smoothstep(0.45, 0.55, uScroll);
        gl_FragColor = vec4(finalColor, alpha);
        if (alpha < 0.01) discard;
      }
    `,
    transparent: true,
  }), [matcap]);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 128, 128]} />
      <shaderMaterial ref={materialRef} {...shaderArgs} />
    </mesh>
  );
};

const SHARD_COUNT = 5000;
const Shards = ({ scrollProgress, hoverIntensity }: { scrollProgress: number, hoverIntensity: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  const [matcap] = useMatcapTexture('3B3C3F_DAD9D5_929290_ABACA8', 128);

  const viewportScale = Math.min(viewport.width / 14, 1);

  const initialPositions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < SHARD_COUNT; i++) {
        const phi = Math.acos(-1 + (2 * i) / SHARD_COUNT);
        const theta = Math.sqrt(SHARD_COUNT * Math.PI) * phi;
        const x = 1.5 * Math.cos(theta) * Math.sin(phi);
        const y = 1.5 * Math.sin(theta) * Math.sin(phi);
        const z = 1.5 * Math.cos(phi);
        pos.push(new THREE.Vector3(x, y, z));
    }
    return pos;
  }, []);

  const randomDirs = useMemo(() => {
    return Array.from({ length: SHARD_COUNT }, () => new THREE.Vector3(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    ));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    if (materialRef.current) {
       materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
       materialRef.current.uniforms.uScroll.value = scrollProgress;
       materialRef.current.uniforms.uHover.value = hoverIntensity;
    }
    
    const t = THREE.MathUtils.smoothstep(scrollProgress, 0.4, 1.0);
    
    for (let i = 0; i < SHARD_COUNT; i++) {
      const pos = initialPositions[i].clone().add(randomDirs[i].clone().multiplyScalar(t * 2));
      dummy.position.copy(pos);
      dummy.rotation.x = i * 0.01 + t * 5;
      dummy.rotation.y = i * 0.02 + t * 5;
      
      const scale = 0.02 * (1.0 + Math.random() * 0.5) * viewportScale;
      const finalScale = t > 0.01 ? scale : 0;
      dummy.scale.setScalar(finalScale);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uHover: { value: 0 },
      uMatcap: { value: matcap },
    },
    vertexShader: `
      varying vec2 vN;
      varying vec3 vWorldPos;
      
      void main() {
        vec4 worldPosition = instanceMatrix * vec4(position, 1.0);
        vWorldPos = worldPosition.xyz;
        vec4 modelViewPosition = modelViewMatrix * worldPosition;
        gl_Position = projectionMatrix * modelViewPosition;
        
        vec3 e = normalize(modelViewPosition.xyz);
        vec3 n = normalize(normalMatrix * mat3(instanceMatrix) * normal);
        vec3 r = reflect(e, n);
        float m = 2.0 * sqrt(pow(r.x, 2.0) + pow(r.y, 2.0) + pow(r.z + 1.0, 2.0));
        vN = r.xy / m + 0.5;
      }
    `,
    fragmentShader: `
      varying vec2 vN;
      varying vec3 vWorldPos;
      uniform sampler2D uMatcap;
      uniform float uTime;
      uniform float uHover;
      
      vec3 oklab_to_rgb(vec3 c) {
          float l_ = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
          float m_ = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
          float s_ = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
          l_ = l_*l_*l_; m_ = m_*m_*m_; s_ = s_*s_*s_;
          return vec3(
              +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
              -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
              -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_
          );
      }

      void main() {
        vec3 colorR = texture2D(uMatcap, vN + vec2(uHover * 0.05, 0.0)).rgb;
        vec3 colorG = texture2D(uMatcap, vN).rgb;
        vec3 colorB = texture2D(uMatcap, vN - vec2(uHover * 0.05, 0.0)).rgb;
        vec3 chrome = vec3(colorR.r, colorG.g, colorB.b);
        
        float l = 0.5 + uHover * 0.25;
        float hue = atan(vWorldPos.y, vWorldPos.x) + uHover * 6.28 + uTime * 0.5;
        float chroma = 0.4 * uHover;
        
        vec3 oklch_core = oklab_to_rgb(vec3(l, chroma * cos(hue), chroma * sin(hue)));
        vec3 finalColor = mix(chrome, oklch_core, uHover * 0.85);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    transparent: true,
  }), [matcap]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, SHARD_COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <shaderMaterial ref={materialRef} {...shaderArgs} />
    </instancedMesh>
  );
};

export default function Scene({ scrollProgress, hoverIntensity }: { scrollProgress: number, hoverIntensity: number }) {
  const { viewport } = useThree();
  
  // Transform scroll progress into a symmetric loop (0 -> 1 -> 0)
  // This ensures that state at 1.0 is identical to state at 0.0
  const loopProgress = 1 - Math.abs(Math.cos(scrollProgress * Math.PI));

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
      <color attach="background" args={['#050505']} />
      
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group position={[0, 0, loopProgress * -10]}>
          <LiquidSphere scrollProgress={loopProgress} hoverIntensity={hoverIntensity} />
          <Shards scrollProgress={loopProgress} hoverIntensity={hoverIntensity} />
        </group>
      </Float>
      
      <DustParticles />
      
      <ambientLight intensity={0.1} />
      <spotLight position={[5, 10, 5]} intensity={2} angle={0.15} penumbra={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={new THREE.Color(0xFF0000)} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </>
  );
}

const DustParticles = () => {
  const count = 1000;
  const meshRef = useRef<THREE.Points>(null!);
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 20;
      temp[i * 3 + 1] = (Math.random() - 0.5) * 20;
      temp[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return temp;
  }, []);

  useFrame((state) => {
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.015} transparent opacity={0.2} color="white" />
    </points>
  );
};
