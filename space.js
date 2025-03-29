import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// Remove OrbitControls import since we're not using it

class SpaceFlythrough {
  constructor(containerId) {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000022); // Deep space blue-black

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      69,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 10; // Move camera back to see both sun and surfer

    // Renderer with improved settings
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.physicallyCorrectLights = true; // More realistic lighting
    document.getElementById(containerId).appendChild(this.renderer.domElement);

    // REMOVE ORBIT CONTROLS - Create dummy controls object
    this.controls = { update: function () {} };

    // Lighting - Adding a point light to shine on the model
    this.addLighting();

    // Star Particle System
    this.createStarfield();

    // Create the sun at the center
    this.createSun();

    // Load Silver Surfer model
    this.loadSpaceModel("../Assets/silver_surfer.glb");

    // Modify key state tracking to include movement keys
    this.keyState = {
      W: false, // Move forward
      S: false, // Move backward
      A: false, // Move left
      D: false, // Move right
      Q: false, // Bank left (tilt)
      E: false, // Bank right (tilt)
      SHIFT: false, // Speed boost
    };

    // Camera follow parameters - adjusted for better third-person feel
    this.cameraOffset = new THREE.Vector3(0, 2, -10); // Position behind and above
    this.cameraLookAhead = new THREE.Vector3(0, 0, -5);

    // Movement parameters
    this.moveSpeed = 0.2;
    this.turnSpeed = 0.03;
    this.bankSpeed = 0.02;

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
    this.hoverDirection = 1; // Controls the oscillation direction
    this.hoverAngle = 0; // For random-like oscillation
    this.hoverOffsetX = 0; // X-axis offset
    this.hoverOffsetY = 0; // Y-axis offset

    this.trailParticles = [];
    this.maxTrailParticles = 200; // limit particles

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
    this.trailGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.trailPositions, 3)
    );

    this.trailPoints = new THREE.Points(this.trailGeometry, this.trailMaterial);
    this.scene.add(this.trailPoints);
  }

  generateTrail() {
    if (this.trailMesh) {
      this.scene.remove(this.trailMesh); // remove previous
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

    // Call update on our dummy controls
    this.controls.update();

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

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

  createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 10000;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      // Use a more uniform distribution to avoid center clustering
      // This creates a more even distribution in a cube rather than a sphere
      positions[i] = (Math.random() - 0.5) * 200; // X position
      positions[i + 1] = (Math.random() - 0.5) * 200; // Y position
      positions[i + 2] = (Math.random() - 0.5) * 200; // Z position

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

    // Create a circular glow texture for stars
    const starTexture = this.createRealisticStarTexture();

    const starMaterial = new THREE.PointsMaterial({
      size: 0.6, // Larger size for more prominent stars
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

    // Create a circular gradient for a realistic star appearance
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 3;

    // Create a radial gradient with more pronounced light effect
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

    // Add a subtle cross-shaped light diffraction effect
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

        // Enhance materials to make Silver Surfer more visible
        this.spaceModel.traverse((child) => {
          if (child.isMesh) {
            // Create a new material to make the Silver Surfer more visible
            const newMaterial = new THREE.MeshStandardMaterial({
              color: 0xc0c0c0, // Silver color
              metalness: 0.7, // Highly metallic
              roughness: 0.1, // Very smooth
              emissive: 0x222222, // Slight self-illumination
              emissiveIntensity: 0.5, // Moderate intensity
            });

            // Apply the new material
            child.material = newMaterial;
          }
        });

        this.scene.add(this.spaceModel);

        // Now that model is loaded, position camera behind it
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
      ? this.moveSpeed * 2
      : this.moveSpeed;

    // Get the model's forward direction vector (negative Z in model space)
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

  // Apply subtle hovering effect (non-looping, gentle)
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

    // Calculate the desired camera position
    const modelPosition = new THREE.Vector3();
    this.spaceModel.getWorldPosition(modelPosition);

    // Calculate offset position in world space
    const offset = this.cameraOffset.clone();
    offset.applyQuaternion(this.spaceModel.quaternion);

    // Set camera position behind the model
    const targetPosition = modelPosition.clone().add(offset);
    this.camera.position.copy(targetPosition);

    // Calculate look-ahead point
    const lookAhead = this.cameraLookAhead.clone();
    lookAhead.applyQuaternion(this.spaceModel.quaternion);
    const lookAtPoint = modelPosition.clone().add(lookAhead);

    // Make the camera look at the model
    this.camera.lookAt(lookAtPoint);
  }

  createSun() {
    const loader = new GLTFLoader();
    loader.load(
      "../Assets/sun.glb",
      (gltf) => {
        this.sun = gltf.scene;

        // Position the sun at the center
        this.sun.position.set(15, 0, 0);

        // Scale the sun to a more appropriate size
        this.sun.scale.set(0.8, 0.8, 0.8);

        // Enhance the sun's material while preserving its texture
        this.sun.traverse((child) => {
          if (child.isMesh) {
            // Clone the original material to preserve its properties
            const originalMaterial = child.material;

            // Create a new material that preserves the texture but adds glow
            const enhancedMaterial = new THREE.MeshStandardMaterial({
              map: originalMaterial.map, // Preserve the original texture                 // Orange-red glow
              emissiveIntensity: 1.0, // Strong glow
              roughness: 0.8, // Some roughness for texture detail
              metalness: 0.0, // Non-metallic
            });

            // Apply the enhanced material
            child.material = enhancedMaterial;
          }
        });

        this.scene.add(this.sun);

        // Add a point light at the sun's position
        const sunLight = new THREE.PointLight(0xffffcc, 1.5, 50);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);

        // Initialize sun pulse properties
        this.sunPulseTime = 0;
        this.sunPulseDirection = 1;
      },
      (progress) => {
        console.log(
          "Loading sun model:",
          (progress.loaded / progress.total) * 100 + "%"
        );
      },
      (error) => {
        console.error("Error loading sun model:", error);
      }
    );
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Initialize the scene
const spaceFlythrough = new SpaceFlythrough("scene-container");
