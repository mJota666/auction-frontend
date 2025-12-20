import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const AuthScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    // Transparent background to blend with container
    scene.background = null; 

    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 100);
    camera.position.z = 6;
    camera.position.y = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    
    mountRef.current.appendChild(renderer.domElement);

    // --- Objects (Simplified Gavel) ---
    const gavelGroup = new THREE.Group();

    // Materials
    const woodMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xA0522D, 
      roughness: 0.4, 
      metalness: 0.1 
    });
    const goldMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFD700, 
      roughness: 0.1, 
      metalness: 0.9 
    });
    const darkMetalMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xE0E0E0, 
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

    // Head
    const headGroup = new THREE.Group();
    const headMainGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 32);
    const headMain = new THREE.Mesh(headMainGeo, woodMaterial);
    headMain.rotation.z = Math.PI / 2;
    headMain.castShadow = true;
    headGroup.add(headMain);

    // Rings
    const ringGeo = new THREE.TorusGeometry(0.42, 0.05, 16, 32);
    const ring1 = new THREE.Mesh(ringGeo, goldMaterial);
    ring1.rotation.y = Math.PI / 2;
    ring1.position.x = 0.5;
    headGroup.add(ring1);
    const ring2 = new THREE.Mesh(ringGeo, goldMaterial);
    ring2.rotation.y = Math.PI / 2;
    ring2.position.x = -0.5;
    headGroup.add(ring2);

    // Faces
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
    
    // Initial pose
    gavelGroup.rotation.z = Math.PI / 4;
    gavelGroup.rotation.y = -Math.PI / 4;
    
    scene.add(gavelGroup);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight1 = new THREE.PointLight(0x2563EB, 2, 10);
    rimLight1.position.set(-3, 2, -3);
    scene.add(rimLight1);

    const rimLight2 = new THREE.PointLight(0xD97706, 2, 10);
    rimLight2.position.set(3, -2, 3);
    scene.add(rimLight2);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating and rotation
      gavelGroup.rotation.y = -Math.PI / 4 + Math.sin(elapsedTime * 0.5) * 0.2;
      gavelGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.1;
      gavelGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.2;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // --- Resize ---
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
};

export default AuthScene;
