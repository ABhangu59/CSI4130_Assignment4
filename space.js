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

        // Lighting
        this.addLighting();

        // Star Particle System
        this.createStarfield();

        // Load 3D Model (replace with your model path)
        this.loadSpaceModel('./silver_surfer.glb');

        // Animation loop
        this.animate();

        // Resize handler
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    addLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }

    createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 10000;
        const positions = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        const colors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
            // Randomly distribute stars in a large spherical volume
            const r = Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 2;

            positions[i] = r * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = r * Math.cos(phi);
            
            // Random star sizes - some stars appear larger than others
            sizes[i/3] = Math.random() * 1.5 + 0.2;
            
            // Realistic star colors based on stellar classification
            const colorType = Math.random();
            if (colorType > 0.98) {
                // Blue stars (O and B class) - hottest
                colors[i] = 0.7;
                colors[i+1] = 0.7;
                colors[i+2] = 1.0;
            } else if (colorType > 0.95) {
                // White-blue stars (A class)
                colors[i] = 0.9;
                colors[i+1] = 0.9;
                colors[i+2] = 1.0;
            } else if (colorType > 0.85) {
                // White stars (F class)
                colors[i] = 1.0;
                colors[i+1] = 1.0;
                colors[i+2] = 1.0;
            } else if (colorType > 0.65) {
                // Yellow stars like our Sun (G class)
                colors[i] = 1.0;
                colors[i+1] = 1.0;
                colors[i+2] = 0.8;
            } else if (colorType > 0.4) {
                // Orange stars (K class)
                colors[i] = 1.0;
                colors[i+1] = 0.8;
                colors[i+2] = 0.5;
            } else {
                // Red stars (M class) - coolest
                colors[i] = 1.0;
                colors[i+1] = 0.5;
                colors[i+2] = 0.5;
            }
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create a circular glow texture for stars
        const starTexture = this.createRealisticStarTexture();
        
        const starMaterial = new THREE.PointsMaterial({ 
            size: 0.4,
            transparent: true,
            opacity: 1.0,
            vertexColors: true,
            map: starTexture,
            alphaTest: 0.001, // Lower value to avoid hard edges
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending, // Makes stars glow when they overlap
            depthWrite: false // Prevents z-fighting between stars
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }
    
    createRealisticStarTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');
        
        // Clear canvas
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Create a circular gradient for a realistic star appearance
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = canvas.width / 3;
        
        // Create a radial gradient
        const gradient = context.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        
        // Bright center fading to transparent edges
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        context.fill();
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    loadSpaceModel(path) {
        const loader = new GLTFLoader();
        loader.load(
            path,
            (gltf) => {
                this.spaceModel = gltf.scene;
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

    // Optional: Exhaust/Explosion Particle Effect
    createExhaustParticles(position) {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 1000;
        const positions = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i += 3) {
            positions[i] = position.x + (Math.random() - 0.5) * 2;
            positions[i + 1] = position.y + (Math.random() - 0.5) * 2;
            positions[i + 2] = position.z + (Math.random() - 0.5) * 2;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            color: 0xff6600,  // Fiery orange
            size: 0.05,
            transparent: true,
            opacity: 0.7
        });

        const exhaustParticles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(exhaustParticles);

        // Optional: Animate particle dispersion
        const animateParticles = () => {
            const positions = exhaustParticles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += (Math.random() - 0.5) * 0.1;
                positions[i + 1] += (Math.random() - 0.5) * 0.1;
                positions[i + 2] += (Math.random() - 0.5) * 0.1;
            }
            exhaustParticles.geometry.attributes.position.needsUpdate = true;
        };

        // You can call animateParticles in your animation loop for dynamic effect
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Optional: Add rotation or movement to your model
        if (this.spaceModel) {
            this.spaceModel.rotation.y += 0.01;
        }

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