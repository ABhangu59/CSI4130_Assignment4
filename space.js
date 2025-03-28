import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class SpaceFlythrough {
    constructor(containerId) {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000022);  // Deep space blue-black

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.z = 5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById(containerId).appendChild(this.renderer.domElement);

        // Orbit Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Lighting - Adding a point light to shine on the model
        this.addLighting();

        // Star Particle System
        this.createStarfield();

        // Load 3D Model (replace with your model path)
        this.loadSpaceModel('./silver_surfer.glb');

        // Key state tracking for movement
        this.keyState = {
            'W': false,  // Tilt down (X axis)
            'S': false,  // Tilt up (X axis)
            'A': false,  // Tilt left (Z axis)
            'D': false   // Tilt right (Z axis)
        };

        // Event listeners for keydown and keyup
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));

        // Animation loop
        this.animate();

        // Resize handler
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Hover variables
        this.hoverSpeed = 0.1;
        this.hoverDirection = 1; // Controls the oscillation direction
        this.hoverAngle = 0; // For random-like oscillation
        this.hoverOffsetX = 0; // X-axis offset
        this.hoverOffsetY = 0; // Y-axis offset
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

        for (let i = 0; i < starCount * 3; i += 3) {
            const r = Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 2;

            positions[i] = r * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = r * Math.cos(phi);
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const starMaterial = new THREE.PointsMaterial({ 
            color: 0xffffff, 
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    loadSpaceModel(path) {
        const loader = new GLTFLoader();
        loader.load(
            path,
            (gltf) => {
                this.spaceModel = gltf.scene;
                this.spaceModel.rotation.y = Math.PI; // Start facing negative Z-axis
                this.scene.add(this.spaceModel);
            },
            (progress) => {
                console.log('Loading model:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Error loading model:', error);
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

    // Handle tilting based on key input
    tiltModel() {
        const tiltSpeed = 0.01; // Slow down the tilt speed

        if (this.spaceModel) {
            // Tilt down (W) - Rotate the model on the X-axis (counterclockwise)
            if (this.keyState['W']) {
                this.spaceModel.rotation.x += tiltSpeed;  // Tilting downward on X-axis
            }

            // Tilt up (S) - Rotate the model on the X-axis (clockwise)
            if (this.keyState['S']) {
                this.spaceModel.rotation.x -= tiltSpeed;  // Tilting upward on X-axis
            }

            // Tilt left (A) - Rotate the model on the Z-axis (counterclockwise)
            if (this.keyState['A']) {
                this.spaceModel.rotation.z -= tiltSpeed;  // Tilting left on Z-axis
            }

            // Tilt right (D) - Rotate the model on the Z-axis (clockwise)
            if (this.keyState['D']) {
                this.spaceModel.rotation.z += tiltSpeed;  // Tilting right on Z-axis
            }
        }
    }

    // Apply subtle hovering effect (non-looping, gentle)
    applyHoveringEffect() {
        if (this.spaceModel) {
            // Apply subtle random-like movement in X and Y directions
            this.hoverOffsetX = Math.sin(this.hoverAngle) * 0.002;  // Small oscillation on X-axis
            this.hoverOffsetY = Math.cos(this.hoverAngle) * 0.002;  // Small oscillation on Y-axis
            this.hoverOffsetZ = Math.cos(this.hoverAngle) * 0.005;  // Small oscillation on Y-axis


            this.spaceModel.position.x += this.hoverOffsetX;
            this.spaceModel.position.y += this.hoverOffsetY;
            this.spaceModel.position.z += this.hoverOffsetZ;

            // Increment the hover angle for next frame
            this.hoverAngle += 0.05; // Slow oscillation
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Tilt the model based on key input (steering effect)
        this.tiltModel();

        // Apply subtle hovering effect
        this.applyHoveringEffect();

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize the scene
const spaceFlythrough = new SpaceFlythrough('scene-container');

