import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const Game = () => {
  const mountRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [percentile, setPercentile] = useState(0);

  // Hardcoded high scores distribution
  const highScoreDistribution = [
    { score: 0, percentile: 100 },
    { score: 5, percentile: 90 },
    { score: 10, percentile: 80 },
    { score: 15, percentile: 70 },
    { score: 20, percentile: 60 },
    { score: 25, percentile: 50 },
    { score: 30, percentile: 40 },
    { score: 35, percentile: 30 },
    { score: 40, percentile: 20 },
    { score: 45, percentile: 10 },
    { score: 50, percentile: 5 },
  ];

  const calculatePercentile = (playerScore) => {
    for (let i = highScoreDistribution.length - 1; i >= 0; i--) {
      if (playerScore >= highScoreDistribution[i].score) {
        return highScoreDistribution[i].percentile;
      }
    }
    return 100;
  };

  useEffect(() => {
    let isGameActive = true;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Cargando texturas
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('/textures/earth.jpg');
    const explosionTexture = textureLoader.load('/textures/explosion.png');

    // Creando la Tierra
    const earthGeometry = new THREE.SphereGeometry(2, 32, 32);
    const earthMaterial = new THREE.MeshBasicMaterial({
      map: earthTexture,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    const earthPosition = new THREE.Vector3(0, 0, 0);

    // Asteroides
    const asteroids = [];
    const asteroidGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ 
      map: textureLoader.load('/textures/asteroid.jpeg') 
    });

    // Grupo de explosiones
    const explosionsGroup = new THREE.Group();
    scene.add(explosionsGroup);

    let asteroidCount = -4;
    let velocity = 0.01;

    const createAsteroid = () => {
      const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
      const angle = Math.random() * Math.PI * 2;
      const distance = 8 + Math.random() * 5;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      asteroid.position.set(x, y, Math.random() * 2 - 1);
      return asteroid;
    };

    const addAsteroids = () => {
      while (asteroids.length < 4 && isGameActive) {
        asteroidCount++;
        const newAsteroid = createAsteroid();
        scene.add(newAsteroid);
        asteroids.push(newAsteroid);
      }
    };

    const createExplosion = (position, isEarthCollision = false) => {
      const explosionGeometry = new THREE.PlaneGeometry(3, 3);
      const explosionMaterial = new THREE.MeshBasicMaterial({
        map: explosionTexture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      
      const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
      explosion.position.copy(position);
      explosion.lookAt(camera.position);
      
      explosionsGroup.add(explosion);
      
      let scale = isEarthCollision ? 0.1 : 0.05;
      let opacity = isEarthCollision ? 1 : 0.7;
      const scaleIncrement = isEarthCollision ? 0.1 : 0.05;
      const opacityDecrement = isEarthCollision ? 0.02 : 0.03;
      const maxScale = isEarthCollision ? 3 : 1.5;
      
      const animateExplosion = () => {
        if (!isGameActive) return;
        
        scale += scaleIncrement;
        opacity -= opacityDecrement;
        
        explosion.scale.set(scale, scale, scale);
        explosionMaterial.opacity = opacity;
        
        if (opacity <= 0 || scale >= maxScale) {
          explosionsGroup.remove(explosion);
          return;
        }
        
        requestAnimationFrame(animateExplosion);
      };
      
      animateExplosion();
    };

    const endGame = () => {
      isGameActive = false;
      setGameOver(true);
      setScore(asteroidCount);
      const playerPercentile = calculatePercentile(asteroidCount);
      setPercentile(playerPercentile);
    };

    const moveAsteroids = () => { 
      if (!isGameActive) return;

      asteroids.forEach((asteroid, index) => {
        const direction = new THREE.Vector3().subVectors(earthPosition, asteroid.position);
        direction.normalize();
        asteroid.position.add(direction.multiplyScalar(velocity));

        const distanceToEarth = asteroid.position.distanceTo(earthPosition);
        if (distanceToEarth < 2.4) {
          createExplosion(asteroid.position.clone(), true);
          scene.remove(asteroid);
          asteroids.splice(index, 1);
          setTimeout(() => {
            endGame();
          }, 1000);
        }
      });
    };

    const onPointerClick = (event) => {
      if (!isGameActive) return;

      const pointer = new THREE.Vector2();
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointer, camera);

      const intersects = raycaster.intersectObjects(asteroids);
      if (intersects.length > 0) {
        const asteroid = intersects[0].object;
        createExplosion(asteroid.position.clone(), false);
        scene.remove(asteroid);
        asteroids.splice(asteroids.indexOf(asteroid), 1);
        addAsteroids();
      }
    };

    window.addEventListener('click', onPointerClick);

    // Incremento de velocidad
    const speedInterval = setInterval(() => {
      if (isGameActive) {
        velocity += 0.01;
      }
    }, 5000);

    const updateExplosions = () => {
      explosionsGroup.children.forEach(explosion => {
        explosion.lookAt(camera.position);
      });
    };

    camera.position.z = 10;
    addAsteroids();

    const animate = () => {
      if (!isGameActive) return;
      
      requestAnimationFrame(animate);
      earth.rotation.y += 0.03;
      moveAsteroids();
      updateExplosions();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isGameActive = false;
      clearInterval(speedInterval);
      window.removeEventListener('click', onPointerClick);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      <div ref={mountRef} />
      {gameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h2>Game Over</h2>
          <p>You survived {score} asteroids!</p>
          <p>You are in the top {percentile}% of players!</p>
          {percentile <= 10 && <p>Impressive! You're among the elite defenders!</p>}
          {percentile > 10 && percentile <= 50 && <p>Great job! Keep practicing to reach the top!</p>}
          {percentile > 50 && <p>Good attempt! Try again to improve your rank!</p>}
          <button onClick={() => window.location.reload()}>
            Play Again
          </button>
          <button onClick={() => location.href="google.com"}>
            Go to Solar System
          </button>
        </div>
        
      )}
    </>
    
  );
};

export default Game;