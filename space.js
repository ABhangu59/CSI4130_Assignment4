import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Start Screen Class: 
class StartScreen {
  constructor(containerId, onStart) {
    this.container = document.getElementById(containerId);
    this.onStart = onStart;
    this.initialize();
  }

  initialize() {
    // Store original content of the container
    this.originalContent = this.container.innerHTML;
    
    // Create start screen elements
    const startScreen = document.createElement('div');
    startScreen.className = 'start-screen';
    startScreen.style.position = 'absolute';
    startScreen.style.top = '0';
    startScreen.style.left = '0';
    startScreen.style.width = '100%';
    startScreen.style.height = '100%';
    startScreen.style.backgroundColor = 'rgba(0, 5, 20, 0.9)';
    startScreen.style.display = 'flex';
    startScreen.style.flexDirection = 'column';
    startScreen.style.justifyContent = 'center';
    startScreen.style.alignItems = 'center';
    startScreen.style.zIndex = '1000';
    startScreen.style.backgroundImage = 'url(https://cdn.earthsky.org/2023/10/silver-surfer-cosmic-rays-nasa.jpg)';
    startScreen.style.backgroundSize = 'cover';
    startScreen.style.backgroundPosition = 'center';
    startScreen.style.backgroundBlendMode = 'soft-light';
    
    // Creating title element
    const title = document.createElement('h1');
    title.textContent = 'COSMO-SURF';
    title.style.fontFamily = '"Orbitron", sans-serif';
    title.style.fontSize = '4rem';
    title.style.color = 'silver';
    title.style.textShadow = '0 0 10px #66ccff, 0 0 20px #3399ff';
    title.style.marginBottom = '2rem';
    title.style.letterSpacing = '0.5rem';
    
    // Creating subtitle
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Surf the celestial waves through the cosmic void with the Silver Surfer, herald of Galactus';
    subtitle.style.fontFamily = '"Orbitron", sans-serif';
    subtitle.style.fontSize = '1.5rem';
    subtitle.style.color = '#a3bccc';
    subtitle.style.marginBottom = '4rem';
    
    // Creating the controls info doc
    const controls = document.createElement('div');
    controls.className = 'controls-info';
    controls.style.backgroundColor = 'rgba(0, 10, 30, 0.7)';
    controls.style.padding = '1.5rem';
    controls.style.borderRadius = '10px';
    controls.style.marginBottom = '3rem';
    controls.style.maxWidth = '500px';
    controls.style.backdropFilter = 'blur(5px)';
    controls.style.border = '1px solid rgba(102, 204, 255, 0.2)';
    controls.style.boxShadow = '0 0 20px rgba(102, 204, 255, 0.3)';
    
    // Some Inner HTML to make it look pretty 
    controls.innerHTML = `
      <h3 style="color: #66ccff; margin-bottom: 1rem; font-family: 'Orbitron', sans-serif;">NAVIGATION CONTROLS</h3>
      <ul style="color: #a3bccc; text-align: left; font-family: 'Space Mono', monospace; line-height: 1.6;">
        <li><span style="color: #66ccff;">W</span> - Move forward</li>
        <li><span style="color: #66ccff;">S</span> - Move backward</li>
        <li><span style="color: #66ccff;">A</span> - Move left</li>
        <li><span style="color: #66ccff;">D</span> - Move right</li>
        <li><span style="color: #66ccff;">Q</span> - Move up</li>
        <li><span style="color: #66ccff;">E</span> - Move down</li>
        <li><span style="color: #66ccff;">SHIFT</span> - Speed boost</li>
        <li><span style="color: #66ccff;">Mouse</span> - Look around</li>
      </ul>
    `;
    
    // Creating the start button, all through JS code
    const startButton = document.createElement('button');
    startButton.textContent = 'BEGIN JOURNEY';
    startButton.style.fontFamily = '"Orbitron", sans-serif';
    startButton.style.fontSize = '1.5rem';
    startButton.style.padding = '1rem 3rem';
    startButton.style.backgroundColor = 'rgba(102, 204, 255, 0.2)';
    startButton.style.color = '#66ccff';
    startButton.style.border = '2px solid #66ccff';
    startButton.style.borderRadius = '5px';
    startButton.style.cursor = 'pointer';
    startButton.style.transition = 'all 0.3s ease';
    startButton.style.boxShadow = '0 0 15px rgba(102, 204, 255, 0.5)';
    startButton.style.textTransform = 'uppercase';
    startButton.style.letterSpacing = '0.2rem';
    
    // CSS Styling for the Hover
    startButton.onmouseover = function() {
      this.style.backgroundColor = 'rgba(102, 204, 255, 0.4)';
      this.style.boxShadow = '0 0 20px rgba(102, 204, 255, 0.8)';
    };
    
    // CSS Styling for the Hover but when leaving 
    startButton.onmouseout = function() {
      this.style.backgroundColor = 'rgba(102, 204, 255, 0.2)';
      this.style.boxShadow = '0 0 15px rgba(102, 204, 255, 0.5)';
    };
    
    // OnClick for the Button 
    startButton.onclick = () => {
      this.hide();
    };
    
    // Importing Fonts 
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Space+Mono&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
    
    // Putting the screen together like glue 
    startScreen.appendChild(title);
    startScreen.appendChild(subtitle);
    startScreen.appendChild(controls);
    startScreen.appendChild(startButton);
    
    // Adding the start screen to the container
    this.container.appendChild(startScreen);
    
    // And at last, keep a reference. 
    this.startScreen = startScreen;
  }
  
  // This is the function to hide the start screen
  hide() {
    // Fade out animation
    this.startScreen.style.transition = 'opacity 1s ease';
    this.startScreen.style.opacity = '0';
    
    // After animation completes, we remove the start screen and call onStart callback
    setTimeout(() => {
      this.container.removeChild(this.startScreen);
      if (typeof this.onStart === 'function') {
        this.onStart();
      }
    }, 1000);
  }
  
  show() {
    this.startScreen.style.opacity = '1';
    this.container.appendChild(this.startScreen);
  }
}

let spaceFlythrough;

// Making div for the scene container if it doesn't exist
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('scene-container')) {
    const sceneContainer = document.createElement('div');
    sceneContainer.id = 'scene-container';
    sceneContainer.style.width = '100%';
    sceneContainer.style.height = '100vh';
    sceneContainer.style.position = 'relative';
    sceneContainer.style.overflow = 'hidden';
    document.body.appendChild(sceneContainer);
  }
  
  // Creating the loading indicator
  const loadingOverlay = document.createElement('div');
  loadingOverlay.style.position = 'absolute';
  loadingOverlay.style.top = '0';
  loadingOverlay.style.left = '0';
  loadingOverlay.style.width = '100%';
  loadingOverlay.style.height = '100%';
  loadingOverlay.style.backgroundColor = 'rgba(0, 5, 20, 0.9)';
  loadingOverlay.style.display = 'flex';
  loadingOverlay.style.justifyContent = 'center';
  loadingOverlay.style.alignItems = 'center';
  loadingOverlay.style.zIndex = '999';
  
  const loadingText = document.createElement('div');
  loadingText.textContent = 'LOADING UNIVERSE...';
  loadingText.style.color = '#66ccff';
  loadingText.style.fontFamily = '"Orbitron", sans-serif';
  loadingText.style.fontSize = '2rem';
  loadingText.style.textShadow = '0 0 10px #66ccff';
  
  loadingOverlay.appendChild(loadingText);
  document.getElementById('scene-container').appendChild(loadingOverlay);
  
  // Initialize the start screen after a delay to simulate loading
  setTimeout(() => {
    document.getElementById('scene-container').removeChild(loadingOverlay);
    
    // Initialize the start screen
    const startScreen = new StartScreen('scene-container', () => {
      // Create the space flythrough when the start button is clicked
      spaceFlythrough = new SpaceFlythrough('scene-container');
      
      // Add event listener for ESC key to show the start screen again
      window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          startScreen.show();
        }
      });
    });
  }, 3000);
});

// Add this CSS to the page
const styleElement = document.createElement('style');
styleElement.textContent = `
  body, html {
    margin: 0;
    padding: 0;
    overflow: hidden;
    width: 100%;
    height: 100%;
    background-color: #000514;
  }
  
  /* Add a pulsating animation to the start button */
  @keyframes pulse {
    0% { box-shadow: 0 0 15px rgba(102, 204, 255, 0.5); }
    50% { box-shadow: 0 0 25px rgba(102, 204, 255, 0.8); }
    100% { box-shadow: 0 0 15px rgba(102, 204, 255, 0.5); }
  }
  
  .start-screen button {
    animation: pulse 2s infinite;
  }
  
  /* Loading spinner animation */
  @keyframes loadingPulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
  }
  
  #scene-container > div:first-child {
    animation: loadingPulse 1.5s infinite;
  }
`;
document.head.appendChild(styleElement);


// CLass FOr thE galaxy: 
class SpaceFlythrough {
  constructor(containerId) {
    // Scene setup
    this.scene = new THREE.Scene();
    // Loading the HDR environment map
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('./HDR_silver_and_gold_nebulae.hdr', (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.background = texture;
        this.scene.environment = texture;
        
        // Update materials on the Silver Surfer if it's already loaded:
        if (this.spaceModel) {
          this.spaceModel.traverse((child) => {
            if (child.isMesh) {
              child.material.envMap = texture;
              child.material.envMapIntensity = 2.0;
              child.material.needsUpdate = true;
            }
          });
        }
    });

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      69,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 10; // Move camera back to see both sun and surfer

    // Our renderer with improved settings
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.physicallyCorrectLights = true; // More realistic lighting

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // playing wih lighting
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;


    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const bloomParams = {
    strength: 2.0,  // Adjusting for intensity; higher values yield a stronger bloom
    radius: 0.5,    // Controling the spread of the bloom effect
    threshold: 0.3  // Only bright parts of the scene will bloom
    };

    this.bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    bloomParams.strength,
    bloomParams.radius,
    bloomParams.threshold
    );
    this.composer.addPass(this.bloomPass);

    document.getElementById(containerId).appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.isUserInteracting = false;
    this.controls.addEventListener('start', () => { this.isUserInteracting = true; });
    this.controls.addEventListener('end', () => { this.isUserInteracting = false; });

    // Adding a point light to shine on the model
    this.addLighting();

    // Star Particle System
    this.createStarfield();

    // Creating the sun at the center
    this.createSun();

    // Loading Silver Surfer model
    this.loadSpaceModel("../Assets/silver_surfer.glb");

    this.loadSaturn("../Assets/jedi_star_fighter.glb", new THREE.Vector3(1000, 5, 0), 1);
    this.loadSaturn("../Assets/destroy.glb", new THREE.Vector3(0, 0, 700), 2);
    this.loadSaturn("../Assets/venus.glb", new THREE.Vector3(0, 0, -100), 10);
    this.loadGalactus("../Assets/galactus.glb", new THREE.Vector3(0, -800, 800), 10);


    // Modifying key state tracking to include movement keys
    this.keyState = {
      W: false, // Move forward
      S: false, // Move backward
      A: false, // Move left
      D: false, // Move right
      Q: false, // Bank left (tilt)
      E: false, // Bank right (tilt)
      SHIFT: false, // Speed boost
    };

    // Camera looks 
    this.cameraOffset = new THREE.Vector3(0, 2, -10); // Position behind and above
    this.cameraLookAhead = new THREE.Vector3(0, 0, -5);

    // Movement parameters
    this.moveSpeed = 0.2;
    this.turnSpeed = 0.03;
    this.bankSpeed = 0.05;

    // Update event listeners for keydown and keyup
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));

    // Position the Silver Surfer away from the sun
    if (this.spaceModel) {
      this.spaceModel.position.set(8, 0, 0);
    }

    // Animation loop
    this.animate();

    // Resize handler
    window.addEventListener("resize", this.onWindowResize.bind(this));

    // Hover variables
    this.hoverSpeed = 0.1;
    this.hoverDirection = 1; // Controlling the oscillation direction
    this.hoverAngle = 0; // For random-like oscillation
    this.hoverOffsetX = 0; // X-axis offset
    this.hoverOffsetY = 0; // Y-axis offset

    this.trailParticles = [];
    this.maxTrailParticles = 200; // limit particles

    // Silver Surfer Trail 
    this.trailMaterial = new THREE.PointsMaterial({
      size: 0.3,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: new THREE.Color(0xa3bccc), // bluish glow
    });

    this.trailHistory = [];
    this.maxTrailPoints = 100; // number of points to form the ribbon
    this.trailMesh = null;

    this.trailPositions = new Float32Array(this.maxTrailParticles * 3); // x, y, z per particle
    this.trailGeometry = new THREE.BufferGeometry();
    this.trailGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.trailPositions, 3)
    );

    this.trailPoints = new THREE.Points(this.trailGeometry, this.trailMaterial);
    this.scene.add(this.trailPoints);
  }

  generateTrail() {
    if (this.trailMesh) {
      this.scene.remove(this.trailMesh); 
    }

    if (this.trailHistory.length < 2) return;

    const curve = new THREE.CatmullRomCurve3(this.trailHistory, false);
    const geometry = new THREE.TubeGeometry(
      curve,
      this.trailHistory.length * 2,
      0.05,
      8,
      false
    );

    const material = new THREE.MeshBasicMaterial({
      color: 0x66ccff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.trailMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.trailMesh);
  }

  // function for surfer trail 
  updateRibbonTrail() {
    if (!this.spaceModel) return;

    const pos = new THREE.Vector3();
    this.spaceModel.getWorldPosition(pos);

    this.trailHistory.unshift(pos.clone());

    if (this.trailHistory.length > this.maxTrailPoints) {
      this.trailHistory.pop();
    }

    this.generateTrail();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    // Move the model based on key input
    this.moveModel();

    // Update camera position to follow the model
    this.updateCamera();

    // Apply subtle hovering effect
    this.applyHoveringEffect();

    // Make the point light follow the model
    if (this.spaceModel && this.pointLight) {
      const modelPosition = new THREE.Vector3();
      this.spaceModel.getWorldPosition(modelPosition);

      // Position light slightly above and in front of the model
      const lightOffset = new THREE.Vector3(0, 1, -2);
      lightOffset.applyQuaternion(this.spaceModel.quaternion);
      this.pointLight.position.copy(modelPosition).add(lightOffset);
    }

    if (this.sun) {
      this.sun.rotation.y += 0.002;

      // Pulsating effect for the sun
      this.sunPulseTime += 0.05 * this.sunPulseDirection;
      if (this.sunPulseTime > 1) {
        this.sunPulseDirection = -1;
      } else if (this.sunPulseTime < 0) {
        this.sunPulseDirection = 1;
      }

      // Apply pulsating effect to sun's emissive intensity
      this.sun.traverse((child) => {
        if (child.isMesh && child.material) {
          // Pulsate between 0.8 and 1.2 intensity
          child.material.emissiveIntensity =
            1.0 + Math.sin(this.sunPulseTime * Math.PI) * 0.2;
        }
      });
    }

    this.updateRibbonTrail();

    // Calling update on our dummy controls
    this.controls.update();

    // Rendering the scene
    this.composer.render();
    this.renderer.render(this.scene, this.camera);
  }

  // Lighting working: 
  addLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Brighter ambient light
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Brighter directional light
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);

    // Adding a point light to shine on the model
    this.pointLight = new THREE.PointLight(0xffffff, 2, 10); // White light with intensity of 2
    this.pointLight.position.set(0, 1, 2); // Position the light slightly above and in front
    this.scene.add(this.pointLight);
  }

  // Starfield Creation
  createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 20000;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      // Use a more uniform distribution to avoid center clustering
      // This creates a more even distribution in a cube rather than a sphere
      positions[i] = (Math.random() - 0.5) * 1000; // X position
      positions[i + 1] = (Math.random() - 0.5) * 1000; // Y position
      positions[i + 2] = (Math.random() - 0.5) * 600; // Z position

      // Create a minimum distance from center to avoid clustering
      const distFromCenter = Math.sqrt(
        positions[i] * positions[i] +
          positions[i + 1] * positions[i + 1] +
          positions[i + 2] * positions[i + 2]
      );

      // If too close to center, push it outward
      if (distFromCenter < 20) {
        const factor = 20 / distFromCenter;
        positions[i] *= factor;
        positions[i + 1] *= factor;
        positions[i + 2] *= factor;
      }

      // Mix of larger and smaller stars
      sizes[i / 3] = Math.random() * 1.2 + 0.2;

      // Realistic star colors based on stellar classification
      const colorType = Math.random();
      if (colorType > 0.98) {
        // Blue stars (O and B class) - hottest
        colors[i] = 0.7;
        colors[i + 1] = 0.7;
        colors[i + 2] = 1.0;
      } else if (colorType > 0.95) {
        // White-blue stars (A class)
        colors[i] = 0.9;
        colors[i + 1] = 0.9;
        colors[i + 2] = 1.0;
      } else if (colorType > 0.85) {
        // White stars (F class)
        colors[i] = 1.0;
        colors[i + 1] = 1.0;
        colors[i + 2] = 1.0;
      } else if (colorType > 0.65) {
        // Yellow stars like our Sun (G class)
        colors[i] = 1.0;
        colors[i + 1] = 1.0;
        colors[i + 2] = 0.8;
      } else if (colorType > 0.4) {
        // Orange stars (K class)
        colors[i] = 1.0;
        colors[i + 1] = 0.8;
        colors[i + 2] = 0.5;
      } else {
        // Red stars (M class) - coolest
        colors[i] = 1.0;
        colors[i + 1] = 0.5;
        colors[i + 2] = 0.5;
      }
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    starGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Making a circular glow texture for stars
    const starTexture = this.createRealisticStarTexture();

    const starMaterial = new THREE.PointsMaterial({
      size: 0.6, 
      transparent: true,
      opacity: 0.95, // Slightly higher opacity
      vertexColors: true,
      map: starTexture,
      alphaTest: 0.001,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(stars);
  }

  createRealisticStarTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 64; // Increased resolution for better quality
    canvas.height = 64;
    const context = canvas.getContext("2d");

    // Clear canvas
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Creating a circular gradient for a realistic star appearance
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 3;

    // Creating a radial gradient with more pronounced light effect
    const gradient = context.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    );

    // Brighter center with more defined glow
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.9)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
    gradient.addColorStop(0.8, "rgba(255, 255, 255, 0.2)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.fill();

    // Adding a subtle cross-shaped light diffraction effect
    context.globalCompositeOperation = "lighter";

    // Horizontal light streak
    const horizontalGradient = context.createLinearGradient(
      0,
      centerY,
      canvas.width,
      centerY
    );
    horizontalGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    horizontalGradient.addColorStop(0.4, "rgba(255, 255, 255, 0)");
    horizontalGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
    horizontalGradient.addColorStop(0.6, "rgba(255, 255, 255, 0)");
    horizontalGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    context.fillStyle = horizontalGradient;
    context.fillRect(0, centerY - radius / 6, canvas.width, radius / 3);

    // Vertical light streak
    const verticalGradient = context.createLinearGradient(
      centerX,
      0,
      centerX,
      canvas.height
    );
    verticalGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    verticalGradient.addColorStop(0.4, "rgba(255, 255, 255, 0)");
    verticalGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
    verticalGradient.addColorStop(0.6, "rgba(255, 255, 255, 0)");
    verticalGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    context.fillStyle = verticalGradient;
    context.fillRect(centerX - radius / 6, 0, radius / 3, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // Function to load Galactus
  loadGalactus(path, position, scale) {
    const loader = new GLTFLoader();
    loader.load(
      path,
      (gltf) => {
        const galactus = gltf.scene;
        // Position and scale Galactus
        galactus.position.copy(position);
        galactus.scale.set(scale, scale, scale);
        
        // Rotate Galactus 180 degrees around the Y axis
        galactus.rotation.y = Math.PI;
        
        // Optionally update its materials to use the environment map
        galactus.traverse((child) => {
          if (child.isMesh) {
            child.material.envMap = this.scene.environment;
            child.material.envMapIntensity = 2.0;
            child.material.needsUpdate = true;
          }
        });
        
        // Attach a point light to Galactus (if needed)
        const galactusLight = new THREE.PointLight(0xffffff, 2, 50);
        galactusLight.position.set(0, 5, 0);
        galactus.add(galactusLight);
        
        // Add Galactus to the scene
        this.scene.add(galactus);
      },
      (progress) => {
        console.log("Loading Galactus: " + (progress.loaded / progress.total) * 100 + "%");
      },
      (error) => {
        console.error("Error loading Galactus model:", error);
      }
    );
  }
  
  // Function to load Surfer
  loadSpaceModel(path) {
    const loader = new GLTFLoader();
    loader.load(
      path,
      (gltf) => {
        this.spaceModel = gltf.scene;

        // Start facing negative Z-axis
        this.spaceModel.rotation.y = Math.PI;

        // Position the model in front of the camera initially
        this.spaceModel.position.set(0, 0, -3);
        this.spaceModel.rotation.z = Math.PI;

        // Enhance materials to make Silver Surfer more visible
        this.spaceModel.traverse((child) => {
            if (child.isMesh) {
              const newMaterial = new THREE.MeshStandardMaterial({
                color: 0xc0c0c0,      // Silver color
                metalness: 1.0,       // Fully metallic
                roughness: 0.1,       // Lower roughness for sharper reflections
                emissive: 0x222222,   // Slight self-illumination
                emissiveIntensity: 0.5,
                envMap: this.scene.environment, 
                envMapIntensity: 3.0,
              });
              child.material = newMaterial;
            }
        });          

        this.scene.add(this.spaceModel);
        this.updateCamera();
      },
      (progress) => {
        console.log(
          "Loading model:",
          (progress.loaded / progress.total) * 100 + "%"
        );
      },
      (error) => {
        console.error("Error loading model:", error);
      }
    );
  }

  // Event handler for keydown
  onKeyDown(event) {
    const key = event.key.toUpperCase();
    if (key in this.keyState) {
      this.keyState[key] = true;
    }
  }

  // Event handler for keyup
  onKeyUp(event) {
    const key = event.key.toUpperCase();
    if (key in this.keyState) {
      this.keyState[key] = false;
    }
  }

  // Handle movement and tilting based on key input
  moveModel() {
    if (!this.spaceModel) return;

    // Calculate the current speed (with boost if SHIFT is pressed)
    const currentSpeed = this.keyState["SHIFT"]
      ? this.moveSpeed * 2.5
      : this.moveSpeed;

    // Get the model's forward direction vector 
    const modelForward = new THREE.Vector3(0, 0, -1); // <- model's forward
    modelForward.applyQuaternion(this.spaceModel.quaternion);
    modelForward.normalize();

    // Calculate the right vector properly by using cross product of up and forward
    const worldUp = new THREE.Vector3(0, 1, 0);
    const modelRight = new THREE.Vector3();
    modelRight.crossVectors(modelForward, worldUp).normalize();

    // Forward/backward movement
    if (this.keyState["S"]) {
      this.spaceModel.position.addScaledVector(modelForward, currentSpeed);
    }
    if (this.keyState["W"]) {
      this.spaceModel.position.addScaledVector(modelForward, -currentSpeed);
    }

    // Left/right movement (pure lateral movement)
    if (this.keyState["D"]) {
      this.spaceModel.position.addScaledVector(modelRight, -currentSpeed);
      // Add a slight bank for visual effect
      this.spaceModel.rotation.z = Math.min(
        this.spaceModel.rotation.z + 0.05,
        0.3
      );
    }
    if (this.keyState["A"]) {
      this.spaceModel.position.addScaledVector(modelRight, currentSpeed);
      // Add a slight bank for visual effect
      this.spaceModel.rotation.z = Math.max(
        this.spaceModel.rotation.z - 0.05,
        -0.3
      );
    }

    // Up/down movement
    if (this.keyState["Q"]) {
      this.spaceModel.position.y += currentSpeed;
    }
    if (this.keyState["E"]) {
      this.spaceModel.position.y -= currentSpeed;
    }
    
    // Return to level flight when not banking left/right
    if (!this.keyState["A"] && !this.keyState["D"]) {
      // Return to level flight (gradually decrease z rotation)
      this.spaceModel.rotation.z *= 0.9;
    }

    // Gradually return to level pitch
    if (!this.keyState["W"] && !this.keyState["S"]) {
      this.spaceModel.rotation.x *= 0.95;
    }
  }

  // Apply subtle hovering effect 
  applyHoveringEffect() {
    if (this.spaceModel) {
      // Apply subtle random-like movement in X and Y directions
      this.hoverOffsetX = Math.sin(this.hoverAngle) * 0.002; // Small oscillation on X-axis
      this.hoverOffsetY = Math.cos(this.hoverAngle) * 0.002; // Small oscillation on Y-axis
      this.hoverOffsetZ = Math.cos(this.hoverAngle) * 0.005; // Small oscillation on Z-axis
      this.spaceModel.position.x += this.hoverOffsetX;
      this.spaceModel.position.y += this.hoverOffsetY;
      this.spaceModel.position.z += this.hoverOffsetZ;

      // Increment the hover angle for next frame
      this.hoverAngle += 0.05; // Slow oscillation
    }
  }

  updateCamera() {
        if (!this.spaceModel) return;
    
        // Get Silver Surfer's world position
        const modelPosition = new THREE.Vector3();
        this.spaceModel.getWorldPosition(modelPosition);
    
        // Always update OrbitControls target so Silver Surfer remains centered
        this.controls.target.copy(modelPosition);
    
        // Only update the camera's position when the user is not interacting
        if (!this.isUserInteracting) {
        // Clone the fixed offset and rotate it according to Silver Surfer's orientation
        const offset = this.cameraOffset.clone();
        offset.applyQuaternion(this.spaceModel.quaternion);
        // Ensure the offset keeps its original magnitude
        offset.setLength(this.cameraOffset.length());
    
        // Calculate the desired camera position
        const desiredPosition = modelPosition.clone().add(offset);
        // Smoothly interpolate to the desired position
        this.camera.position.lerp(desiredPosition, 0.1);
        }
    
        this.controls.update();
    }
  
    // Creating the sun 
  createSun() {
    const loader = new GLTFLoader();
    loader.load(
      "../Assets/sun.glb",
      (gltf) => {
        this.sun = gltf.scene;
  
        // Position & scale the sun
        this.sun.position.set(0, 0, -1000);
        this.sun.scale.set(15, 15, 15);
  
        // Enhance the sun's material with a warmer, orange-red glow
        this.sun.traverse((child) => {
          if (child.isMesh) {
            const originalMaterial = child.material;
            const enhancedMaterial = new THREE.MeshStandardMaterial({
              map: originalMaterial.map,           // Preserve the original texture
              emissive: new THREE.Color(0xff4500),   // Warmer orange-red glow
              emissiveIntensity: 1.0,
              roughness: 0.8,
              metalness: 0.0,
            });
            child.material = enhancedMaterial;
          }
        });
  
        this.scene.add(this.sun);
  
        // Add a point light near the sun with a warm color tone
        const sunLight = new THREE.PointLight(0xffe0b3, 1.5, 50);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);
  
        // Initialize sun pulse properties
        this.sunPulseTime = 0;
        this.sunPulseDirection = 1;
      },
      (progress) => {
        console.log("Loading sun model:", (progress.loaded / progress.total) * 100 + "%");
      },
      (error) => {
        console.error("Error loading sun model:", error);
      }
    );
  }

  // Load Function 
  loadSaturn(path, position, scale) {
    const loader = new GLTFLoader();
    loader.load(
      path,
      (gltf) => {
        const saturn = gltf.scene;
        // Position and scale Saturn
        saturn.position.copy(position);
        saturn.scale.set(scale, scale, scale);
        
        // Optionally update Saturn's materials to use the environment map for reflections
        saturn.traverse((child) => {
          if (child.isMesh) {
            child.material.envMap = this.scene.environment;
            child.material.envMapIntensity = 2.0;
            child.material.needsUpdate = true;
          }
        });
        
        // Add Saturn to the scene
        this.scene.add(saturn);
      },
      (progress) => {
        console.log("Loading Saturn: " + (progress.loaded / progress.total) * 100 + "%");
      },
      (error) => {
        console.error("Error loading Saturn model:", error);
      }
    );
  }
  
  // Window Resizer 
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// EOF 
// Good work team 
// Thanks TA for grading 