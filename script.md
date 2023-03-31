
we can use these scripts
    <script async src="https://unpkg.com/es-module-shims@1.6.3/dist/es-module-shims.js"></script>
    <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@0.150.1/build/three.module.js",
                "three/addons/": "https://unpkg.com/three@0.150.1/examples/jsm/"
            }
        }
    </script>

    and any of this code as we see fit
    <script type="module">
        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 100, 250);

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 10, 10);
        scene.add(light);

        const loader = new FBXLoader();
        const clock = new THREE.Clock();
        let mixer;
        let character;
        let stickmanArmAngle = 0;
        let stickmanLegAngle = 0;
        const stickmanArmSpeed = 0.1;
        const stickmanLegSpeed = 0.15;

        const settings = {
            clearColor: '#119911',
            rainColor: '#00f0ff',
            rainCount: 9999,
            rainHeight: 500,
            rainSpeed: 4
        };

        const rainGeo = new THREE.SphereGeometry(0.5, 8, 8);
        const rainMaterial = new THREE.MeshBasicMaterial({ color: settings.rainColor, transparent: true, opacity: 0.5 });
        const rain = [];
        const rainHeight = settings.rainHeight;
        const rainSpeed = settings.rainSpeed;

        const bgColorPicker = document.getElementById('bgColorPicker');
        bgColorPicker.addEventListener('input', () => {
            renderer.setClearColor(bgColorPicker.value);
        });

        const rainColorPicker = document.getElementById('rainColorPicker');
        rainColorPicker.addEventListener('input', () => {
            settings.rainColor = rainColorPicker.value;
        });

        for (let i = 0; i < settings.rainCount; i++) {
            const raindrop = new THREE.Mesh(rainGeo, rainMaterial);
            raindrop.position.set(Math.random() * 400 - 200, Math.random() * rainHeight, Math.random() * 500 - 200);
            scene.add(raindrop);
            rain.push(raindrop);
        }

        function createStickman() {
            const stickmanMaterial = new THREE.MeshBasicMaterial({ color: 0x991199 });
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

        // async function loadCharacterModel(modelPath) {
        //     return new Promise((resolve, reject) => {
        //         loader.load(modelPath, (object) => {
        //             mixer = new THREE.AnimationMixer(object);
        //             const action = mixer.clipAction(object.animations[0]);
        //             action.play();
        //             character = object;
        //             character.position.set(0, 0, 0);
        //             scene.remove(stickman);
        //             scene.add(character);
        //             resolve();
        //         }, undefined, reject);
        //     });
        // }

        function updateCharacter(delta) {
            if (mixer) {
                mixer.update(delta);
            }
        }

        const model1Button = document.getElementById('model-1');
        const model2Button = document.getElementById('model-2');
        const model3Button = document.getElementById('model-3');
        const modelSelection = document.getElementById('model-selection');

        const stickman = createStickman();
        // Update model buttons event listeners
        model1Button.addEventListener('click', async () => {
            modelSelection.style.display = 'none';
            scene.add(stickman);
            await loadCharacterModel('models/Ch03_nonPBR.fbx', animations);
        });

        model2Button.addEventListener('click', async () => {
            modelSelection.style.display = 'none';
            scene.add(stickman);
            await loadCharacterModel('models/Remy.fbx', animations);
        });

        model3Button.addEventListener('click', async () => {
            modelSelection.style.display = 'none';
            scene.add(stickman);
            await loadCharacterModel('models/Ch21_nonPBR.fbx', animations);
        });
        
        function animateStickman() {
            stickmanArmAngle += stickmanArmSpeed;
            stickmanLegAngle += stickmanLegSpeed;
            stickman.children[4].rotation.x = Math.sin(stickmanArmAngle) * 0.5; // Left arm
            stickman.children[5].rotation.x = -Math.sin(stickmanArmAngle) * 0.5; // Right arm

            stickman.children[2].rotation.z = Math.sin(stickmanLegAngle) * 0.5; // Left leg
            stickman.children[3].rotation.z = -Math.sin(stickmanLegAngle) * 0.5; // Right leg
        }

        // Add the animation files to an array
        const animations = ['run.fbx', 'Cartwheel.fbx', 'Capoeira.fbx'];
        let activeAnimationIndex = 0;

        // ...

        let actions = [];

        async function loadCharacterModel(modelPath, animationPaths) {
            return new Promise((resolve, reject) => {
                loader.load(modelPath, async (object) => {
                    mixer = new THREE.AnimationMixer(object);
                    character = object;
                    character.position.set(0, 0, 0);
                    scene.remove(stickman);
                    scene.add(character);

                    // Load animations
                    for (const animationPath of animationPaths) {
                        await new Promise((resolveAnim, rejectAnim) => {
                            loader.load('models/' + animationPath, (anim) => {
                                const action = mixer.clipAction(anim.animations[0]);
                                action.setLoop(THREE.LoopRepeat);
                                actions.push(action);
                                resolveAnim();
                            }, undefined, rejectAnim);
                        });
                    }

                    // Play the first animation
                    playAnimation(activeAnimationIndex);
                    resolve();
                }, undefined, reject);
            });
        }

        function playAnimation(index) {
            activeAnimationIndex = index;
            actions.forEach((action, i) => {
                if (i === index) {
                    action.reset().play();
                    updateCircle(i, true);
                } else {
                    action.stop();
                    updateCircle(i, false);
                }
            });
        }

        // ...

        function updateCircle(index, isActive) {
            const circle = document.getElementById('circle-' + index);
            if (isActive) {
                circle.style.borderColor = 'green';
            } else {
                circle.style.borderColor = 'transparent';
            }
        }

        // Create circles for each animation
        const circleContainer = document.createElement('div');
        circleContainer.style.position = 'fixed';
        circleContainer.style.top = '10px';
        circleContainer.style.left = '10px';
        document.body.appendChild(circleContainer);

        animations.forEach((animation, index) => {
            const circle = document.createElement('div');
            circle.id = 'circle-' + index;
            circle.style.width = '20px';
            circle.style.height = '20px';
            circle.style.border = '2px solid transparent';
            circle.style.borderRadius = '50%';
            circle.style.backgroundColor = 'red';
            circle.style.marginRight = '5px';
            circleContainer.appendChild(circle);

            circle.addEventListener('click', () => {
                playAnimation(index);
            });
        });

        const animate = function () {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            animateStickman();
            if (mixer) {
                mixer.update(delta);
            }
            updateCharacter(delta);

            const rainColor = new THREE.Color(settings.rainColor);
            for (let i = 0; i < rain.length; i++) {
                const raindrop = rain[i];
                raindrop.position.y -= rainSpeed;
                if (raindrop.position.y < 0) {
                    raindrop.position.y = Math.random() * rainHeight;
                }
                raindrop.material.color.set(rainColor);
            }

            controls.update();
            renderer.render(scene, camera);
        };

        animate();
    </script>
Begin::
Make my world

html5 canvas fullscreen world. make it a huge world, zoom out.
Add a colorpicker to change canvas background color.
Add rain to cover the world and a colorpicker to change rain color.

initially I have these puppet models, [Ch03_nonPBR.fbx, Remy.fbx, Ch21_nonPBR.fbx] under models/ . will add more later

a puppet has mobility animations (currently only ['run.fbx', 'Cartwheel.fbx',] under models/ .will add more later) and idling (currently only ['Capoeira.fbx', 'Dance.fbx'] under models/ . will add more later)

one by one each puppet will go to a free space once ready (loaded one by one),
keeping distance between the puppets (puppets are very large). the puppets do not collide. once idle, a puppet plays any combination of idling animations available in any order.

with a right click the master casts a void eating itself.

 the puppets follow the master's void (mobility animations, realistically as possible). puppets take a group formation with the master's orders around the void (while keeping distance from each other and avoiding collision)


Implementation notes:
Use classes for better code quality (CustomWorld the world, rain, Puppet the character, MasterOfPuppets to orchestrate the puppets, Engine for phisycs etc...)

