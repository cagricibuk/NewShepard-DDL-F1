import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { normalize } from 'three/src/math/MathUtils.js';

// Global variables for the shared WebGL context
let scene = null;
let camera = null;
let renderer = null;
let rocket = null;
let ground = null;
let animationFrameId = null; // Animasyon frame ID'sini saklamak için

const ThreeDVisualization = ({ altitude }) => {
  const mountRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false); // Modelin yüklenip yüklenmediğini takip etmek için state
  const initialAltitude = 1126; // Başlangıç yüksekliği (ASL)

  useEffect(() => {
    // Debug: Component mounted
    console.log('ThreeDVisualization mounted');

    // Create the shared WebGL context if it doesn't exist
    if (!renderer) {
      // Sahne oluştur
      scene = new THREE.Scene();

      // Kamera oluştur
      camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
      camera.position.set(0, 10, 20);
      camera.lookAt(0, 0, 0);

      // Renderer oluştur
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      mountRef.current.appendChild(renderer.domElement);

      // Işık ekle
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(5, 5, 5).normalize();
      scene.add(light);

      // Yeryüzü temsili (düzlem)
      const groundGeometry = new THREE.PlaneGeometry(100, 100);
      const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
      ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = Math.PI / 2; // Düzlemi yatay hale getir
      ground.position.y = -10; // Yeryüzünü aşağıya taşı
      scene.add(ground);

      // Roket modelini yükle
      const loader = new GLTFLoader();
      loader.load('/models/rocket.glb', (gltf) => {
        rocket = gltf.scene;
        rocket.position.y = 0; // Roketin başlangıç yüksekliği
        rocket.scale.set(3, 3, 3); // Modelin boyutunu ayarla (isteğe bağlı)
        scene.add(rocket);
        setModelLoaded(true); // Model yüklendiğinde state'i güncelle
      }, undefined, (error) => {
        console.error('An error happened while loading the rocket model:', error);
      });
    }

    // Animasyon fonksiyonu
    const animate = () => {
      if (!renderer) {
        console.error('Renderer is null. Animation stopped.');
        return; // Renderer yoksa animasyonu durdur
      }

      animationFrameId = requestAnimationFrame(animate);

      // Yükseklik değerini normalize et (başlangıç yüksekliğini sıfır kabul et)
      const normalizedAltitude = altitude - initialAltitude;

      // Yükseklik değerine göre roketin pozisyonunu güncelle
      if (normalizedAltitude !== undefined && rocket) {
        rocket.position.y = normalizedAltitude; // Roketin yüksekliğini güncelle
      }

      // Kamera pozisyonunu roketin yüksekliğine göre ayarla
      if (camera) {
        camera.position.y = 10 + (normalizedAltitude || 0); // Kamera roketi takip etsin
        camera.lookAt(rocket ? rocket.position : normalizedAltitude); // Roket yoksa (0, 0, 0) noktasına bak
      }

      // Render the scene
      renderer.render(scene, camera);
    };

    animate(); // Animasyonu başlat

    // Temizleme fonksiyonu
    return () => {
      // Debug: Component unmounted
      console.log('ThreeDVisualization unmounted');

      // Animasyonu durdur
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // Renderer'ı temizleme (sadece son bileşen unmount olduğunda)
      if (mountRef.current && renderer) {
        mountRef.current.removeChild(renderer.domElement);
        renderer.dispose();
        renderer = null;
        scene = null;
        camera = null;
        rocket = null;
        ground = null;
      }
    };
  }, [altitude, modelLoaded]); // modelLoaded state'ini dependency array'e ekle

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default ThreeDVisualization;