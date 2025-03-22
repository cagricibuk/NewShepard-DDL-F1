import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// Global variables for the shared WebGL context
let scene = null;
let camera = null;
let renderer = null;
let rocket = null;
let ground = null;
let animationFrameId = null; // Animasyon frame ID'sini saklamak için

const ThreeDVisualization = ({ altitude }) => {
  const mountRef = useRef(null);
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

      // Roket temsili (koni)
      const rocketGeometry = new THREE.ConeGeometry(1, 5, 32);
      const rocketMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
      rocket = new THREE.Mesh(rocketGeometry, rocketMaterial);
      rocket.position.y = 0; // Roketin başlangıç yüksekliği
      scene.add(rocket);
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
        camera.lookAt(rocket.position); // Kamera roketi takip etsin
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
  }, [altitude]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default ThreeDVisualization;