import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Scene3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xF8FAFC, 0.02); // Light Fog

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    
    // Clear existing children to prevent duplicates (React StrictMode / HMR)
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);

    // --- Objects (Gavel) ---
    const gavelGroup = new THREE.Group();

    // Materials (Light Theme)
    const woodMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xA0522D, // Sienna / Lighter Wood
      roughness: 0.4, 
      metalness: 0.1 
    });
    const goldMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFD700, 
      roughness: 0.1, 
      metalness: 0.9 
    });
    const darkMetalMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xE0E0E0, // Silver/Chrome
      roughness: 0.2, 
      metalness: 0.8 
    });

    // Handle
    const handleGeo = new THREE.CylinderGeometry(0.1, 0.15, 3, 32);
    const handle = new THREE.Mesh(handleGeo, woodMaterial);
    handle.rotation.x = Math.PI / 2;
    handle.position.z = 1.5;
    handle.castShadow = true;
    gavelGroup.add(handle);

    // Head (Hammer)
    const headGroup = new THREE.Group();
    
    const headMainGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 32);
    const headMain = new THREE.Mesh(headMainGeo, woodMaterial);
    headMain.rotation.z = Math.PI / 2;
    headMain.castShadow = true;
    headGroup.add(headMain);

    // Gold rings on head
    const ringGeo = new THREE.TorusGeometry(0.42, 0.05, 16, 32);
    const ring1 = new THREE.Mesh(ringGeo, goldMaterial);
    ring1.rotation.y = Math.PI / 2;
    ring1.position.x = 0.5;
    headGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, goldMaterial);
    ring2.rotation.y = Math.PI / 2;
    ring2.position.x = -0.5;
    headGroup.add(ring2);

    // Striking faces
    const faceGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 32);
    const face1 = new THREE.Mesh(faceGeo, darkMetalMaterial);
    face1.rotation.z = Math.PI / 2;
    face1.position.x = 0.75;
    headGroup.add(face1);

    const face2 = new THREE.Mesh(faceGeo, darkMetalMaterial);
    face2.rotation.z = Math.PI / 2;
    face2.position.x = -0.75;
    headGroup.add(face2);

    gavelGroup.add(headGroup);
    
    // Initial rotation
    gavelGroup.rotation.z = Math.PI / 4;
    gavelGroup.rotation.y = -Math.PI / 4;

    scene.add(gavelGroup);

    // Podium (Base)
    const podiumGeo = new THREE.CylinderGeometry(1.5, 1.8, 0.5, 64);
    const podium = new THREE.Mesh(podiumGeo, darkMetalMaterial);
    podium.position.y = -2;
    podium.receiveShadow = true;
    scene.add(podium);

    // --- Particles ---
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x94A3B8, // Slate 400
      transparent: true,
      opacity: 0.6,
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Brighter ambient
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 10, 7);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight1 = new THREE.PointLight(0x2563EB, 1, 10); // Blue rim
    rimLight1.position.set(-3, 3, -3);
    scene.add(rimLight1);

    const rimLight2 = new THREE.PointLight(0xD97706, 1, 10); // Gold rim
    rimLight2.position.set(3, -3, 3);
    scene.add(rimLight2);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let mouseX = 0;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Particle movement
      particlesMesh.rotation.y = elapsedTime * 0.05;

      // Mouse Parallax (dampened)
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      
      const targetLookAtY = -0.5; 
      camera.lookAt(0, targetLookAtY, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Initial State
    gavelGroup.position.y = 3; // Start visible at top
    gavelGroup.rotation.set(-Math.PI / 4, -Math.PI / 4, Math.PI / 12); // Ready rotation

    // --- GSAP Animations ---
    const ctx = gsap.context(() => {
      
      // Scroll Animation (Travel & Strike)
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true
        }
      });

      // Travel Phase (0% -> 90%)
      // Move from y=3 (Ready) down to y=-0.5 (Hover)
      scrollTl.to(gavelGroup.position, {
          x: 0,
          y: -0.5,
          z: 0,
          duration: 9,
          ease: "none"
      })
      // Rotate while traveling
      .to(gavelGroup.rotation, {
          x: 0,
          y: Math.PI * 2, // Full spin
          z: 0,
          duration: 9,
          ease: "none"
        },
        "<"
      )
      // Camera follow
      .to(camera.position, {
        z: 6,
        y: 0,
        duration: 9,
        ease: "none"
      }, "<");

      // Strike Phase (90% -> 100%)
      scrollTl.to(gavelGroup.position, {
        y: -1.3, // Impact point
        duration: 1,
        ease: "power4.in"
      })
      .to(gavelGroup.rotation, {
        x: Math.PI / 8, // Strike angle
        y: Math.PI * 2, // Keep Y rotation steady
        duration: 1,
        ease: "bounce.out"
      }, "<")
      .to(camera.position, {
        y: -0.8, // Look closer at impact
        z: 4.5,
        duration: 1
      }, "<");

    }, mountRef);

    // --- Event Listeners ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      ctx.revert();
      
      // Dispose Three.js resources
      gavelGroup.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      particlesGeo.dispose();
      particlesMat.dispose();
      renderer.dispose();
      
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 0 }} />;
};

export default Scene3D;
