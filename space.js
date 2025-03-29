import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// Remove OrbitControls import since we're not using it

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

        // REMOVE ORBIT CONTROLS - Create dummy controls object
        this.controls = { update: function() {} };

        // Lighting - Adding a point light to shine on the model
        this.addLighting();

        // Star Particle System
        this.createStarfield();

        // Load 3D Model (replace with your model path)
        this.loadSpaceModel('./silver_surfer.glb');

        // Modify key state tracking to include movement keys
        this.keyState = {
            'W': false,  // Move forward
            'S': false,  // Move backward
            'A': false,  // Move left
            'D': false,  // Move right
            'Q': false,  // Bank left (tilt)
            'E': false,  // Bank right (tilt)
            'SHIFT': false // Speed boost
        };
        
        // Camera follow parameters - adjusted for better third-person feel
        this.cameraOffset = new THREE.Vector3(0, 2, 10); // Position behind and above
        this.cameraLookAhead = new THREE.Vector3(0, 0, -5); // Look ahead of the model
        
        // Movement parameters
        this.moveSpeed = 0.2;
        this.turnSpeed = 0.03;
        this.bankSpeed = 0.02;
        
        // Update event listeners for keydown and keyup
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
                
                // Start facing negative Z-axis
                this.spaceModel.rotation.y = Math.PI;
                
                // Position the model in front of the camera initially
                this.spaceModel.position.set(0, 0, -3);
                
                // Enhance materials to make Silver Surfer more visible
                this.spaceModel.traverse((child) => {
                    if (child.isMesh) {
                        // Create a new material to make the Silver Surfer more visible
                        const newMaterial = new THREE.MeshStandardMaterial({
                            color: 0xC0C0C0,        // Silver color
                            metalness: 0.7,          // Highly metallic
                            roughness: 0.1,          // Very smooth
                            emissive: 0x222222,      // Slight self-illumination
                            emissiveIntensity: 0.5   // Moderate intensity
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

    // Handle movement and tilting based on key input
    moveModel() {
        if (!this.spaceModel) return;
        
        // Calculate the current speed (with boost if SHIFT is pressed)
        const currentSpeed = this.keyState['SHIFT'] ? this.moveSpeed * 2 : this.moveSpeed;
        
        // Get the model's forward direction vector (negative Z in model space)
        const modelForward = new THREE.Vector3(0, 0, -1);
        modelForward.applyQuaternion(this.spaceModel.quaternion);
        modelForward.normalize();
        
        // Calculate the right vector properly by using cross product of up and forward
        const worldUp = new THREE.Vector3(0, 1, 0);
        const modelRight = new THREE.Vector3();
        modelRight.crossVectors(modelForward, worldUp).normalize();
        
        // Forward/backward movement
        if (this.keyState['W']) {
            this.spaceModel.position.addScaledVector(modelForward, currentSpeed);
        }
        if (this.keyState['S']) {
            this.spaceModel.position.addScaledVector(modelForward, -currentSpeed);
        }
        
        // Left/right movement (pure lateral movement)
        if (this.keyState['A']) {
            this.spaceModel.position.addScaledVector(modelRight, -currentSpeed);
            // Add a slight bank for visual effect
            this.spaceModel.rotation.z = Math.min(this.spaceModel.rotation.z + 0.05, 0.3);
        }
        if (this.keyState['D']) {
            this.spaceModel.position.addScaledVector(modelRight, currentSpeed);
            // Add a slight bank for visual effect
            this.spaceModel.rotation.z = Math.max(this.spaceModel.rotation.z - 0.05, -0.3);
        }
        
        // Return to level flight when not banking left/right
        if (!this.keyState['A'] && !this.keyState['D']) {
            // Return to level flight (gradually decrease z rotation)
            this.spaceModel.rotation.z *= 0.9;
        }
        
        // Gradually return to level pitch
        if (!this.keyState['W'] && !this.keyState['S']) {
            this.spaceModel.rotation.x *= 0.95;
        }
    }

    // Apply subtle hovering effect (non-looping, gentle)
    applyHoveringEffect() {
        if (this.spaceModel) {
            // Apply subtle random-like movement in X and Y directions
            this.hoverOffsetX = Math.sin(this.hoverAngle) * 0.002;  // Small oscillation on X-axis
            this.hoverOffsetY = Math.cos(this.hoverAngle) * 0.002;  // Small oscillation on Y-axis
            this.hoverOffsetZ = Math.cos(this.hoverAngle) * 0.005;  // Small oscillation on Z-axis

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

        // Call update on our dummy controls
        this.controls.update();
        
        // Render the scene
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