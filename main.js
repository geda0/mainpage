import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

function createScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 100, 250);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    return { scene, camera, renderer };
}

function createControls(camera, renderer) {
    return new OrbitControls(camera, renderer.domElement);
}

function addLight(scene) {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 10);
    scene.add(light);
}

function createRain(settings) {
    const rainGeo = new THREE.SphereGeometry(0.5, 8, 8);
    const rainMaterial = new THREE.MeshBasicMaterial({ color: settings.rainColor, transparent: true, opacity: 0.5 });
    const rain = [];

    for (let i = 0; i < settings.rainCount; i++) {
        const raindrop = new THREE.Mesh(rainGeo, rainMaterial);
        raindrop.position.set(Math.random() * 400 - 200, Math.random() * settings.rainHeight, Math.random() * 500 - 200);
        rain.push(raindrop);
    }

    return rain;
}

function addRainToScene(rain, scene) {
    for (const raindrop of rain) {
        scene.add(raindrop);
    }
}

function createStickman() {
    const stickmanMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(10), stickmanMaterial);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 40), stickmanMaterial);
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 40), stickmanMaterial);
    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 40), stickmanMaterial);
    const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 40), stickmanMaterial);
    const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 40), stickmanMaterial);

    head.position.y = 60;
    body.position.y = 30;
    leg1.position.set(0, 0, 10);
    leg2.position.set(0, 0, -10);
    arm1.position.set(0, 30, 20);
    arm2.position.set(0, 30, -20);
    leg1.rotation.x = Math.PI / 2;
    leg2.rotation.x = Math.PI / 2;
    arm1.rotation.z = Math.PI / 2;
    arm2.rotation.z = Math.PI / 2;

    const stickman = new THREE.Group();
    stickman.add(head);
    stickman.add(body);
    stickman.add(leg1);
    stickman.add(leg2);
    stickman.add(arm1);
    stickman.add(arm2);

    return stickman;
}


async function loadCharacterModel(scene, stickman, modelPath) {
    return new Promise((resolve, reject) => {
        const loader = new FBXLoader();
        loader.load(modelPath, (object) => {
            mixer = new THREE.AnimationMixer(object);
            const action = mixer.clipAction(object.animations[0]);
            action.play();
            character = object;
            character.position.set(0, 0, 0);
            scene.remove(stickman);
            scene.add(character);
            resolve();
        }, undefined, reject);
    });
}

function updateCharacter(mixer, delta) {
    if (mixer) {
        mixer.update(delta);
    }
}

function animateStickman(stickman, stickmanArmSpeed, stickmanLegSpeed) {
    stickmanArmAngle += stickmanArmSpeed;
    stickmanLegAngle += stickmanLegSpeed;

    stickman.children[4].rotation.x = Math.sin(stickmanArmAngle) * 0.5; // Left arm
    stickman.children[5].rotation.x = -Math.sin(stickmanArmAngle) * 0.5; // Right arm

    stickman.children[2].rotation.z = Math.sin(stickmanLegAngle) * 0.5; // Left leg
    stickman.children[3].rotation.z = -Math.sin(stickmanLegAngle) * 0.5; // Right leg
}

function mainAnimationLoop(scene, camera, renderer, clock, controls, stickman, stickmanArmSpeed, stickmanLegSpeed, mixer, rain, settings) {
    const animate = function () {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();

        // Stickman animation update
        animateStickman(stickman, stickmanArmSpeed, stickmanLegSpeed);

        // Character animation update
        updateCharacter(mixer, delta);

        // Rain system update
        updateRain(rain, settings);

        // Update camera controls
        controls.update();

        // Render the scene
        renderer.render(scene, camera);
    };

    animate();
}

function updateRain(rain, settings) {
    const rainColor = new THREE.Color(settings.rainColor);
    for (let i = 0; i < rain.length; i++) {
        const raindrop = rain[i];
        raindrop.position.y -= settings.rainSpeed;
        if (raindrop.position.y < 0) {
            raindrop.position.y = Math.random() * settings.rainHeight;
        }
        raindrop.material.color.set(rainColor);
    }
}

// Initialize the scene, camera, and renderer
const { scene, camera, renderer } = createScene();

// Initialize OrbitControls
const controls = createControls(camera, renderer);

// Add light to the scene
addLight(scene);

// Create and add rain to the scene
const settings = {
    clearColor: '#ffffff',
    rainColor: 0x42a4f5,
    rainCount: 1500,
    rainHeight: 300,
    rainSpeed: 2
};
const rain = createRain(settings);
addRainToScene(rain, scene);

// Create and load the character model
const stickman = createStickman();
const modelPath = 'path/to/your/model/file.fbx';

loadCharacterModel(scene, stickman, modelPath).then(mixer => {

    // Configure the stickman animation speed
    const stickmanArmSpeed = 1;
    const stickmanLegSpeed = 1;

    // Start the main animation loop
    mainAnimationLoop(scene, camera, renderer, new THREE.Clock(), controls, stickman, stickmanArmSpeed, stickmanLegSpeed, mixer, rain, settings);
}).catch(error => {
    console.error('Error loading the character model:', error);
});

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});