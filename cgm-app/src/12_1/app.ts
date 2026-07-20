// 名前：芽唯（Shibata Mei）
// 学籍番号：24FI0XXX

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as CANNON from "cannon-es";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private world!: CANNON.World;

    private dominoMeshes: THREE.Mesh[] = [];
    private dominoBodies: CANNON.Body[] = [];

    private dominoCount: number = 24;
    private radius: number = 2.8; // ★ 間隔を少し詰める

    constructor() {}

    public createRendererDOM = (
        width: number,
        height: number,
        cameraPos: THREE.Vector3
    ) => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x87ceeb));

        const camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        );
        camera.position.copy(cameraPos);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const controls = new OrbitControls(camera, renderer.domElement);

        this.createScene();
        this.createPhysics();

        const animate = () => {
            controls.update();
            this.world.step(1 / 60);

            for (let i = 0; i < this.dominoCount; i++) {
                const mesh = this.dominoMeshes[i];
                const body = this.dominoBodies[i];

                mesh.position.copy(body.position as any);
                mesh.quaternion.copy(body.quaternion as any);
            }

            renderer.render(this.scene, camera);
            requestAnimationFrame(animate);
        };

        animate();

        return renderer.domElement;
    };

    private createScene = () => {
        this.scene = new THREE.Scene();

        const grid = new THREE.GridHelper(10, 10);
        this.scene.add(grid);

        const axes = new THREE.AxesHelper(5);
        this.scene.add(axes);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 5);
        this.scene.add(light);

        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambient);

        const floorMesh = new THREE.Mesh(
            new THREE.BoxGeometry(10, 0.2, 10),
            new THREE.MeshPhongMaterial({ color: 0xaaaaaa })
        );
        floorMesh.position.y = -0.1;
        this.scene.add(floorMesh);
    };

    private createPhysics = () => {
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0),
        });

        const floorBody = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(5, 0.1, 5)),
            position: new CANNON.Vec3(0, -0.1, 0),
        });
        this.world.addBody(floorBody);

        const shape = new CANNON.Box(new CANNON.Vec3(0.1, 0.5, 0.25));

        const dominoMaterial = new CANNON.Material("domino");
        dominoMaterial.friction = 0.1; // ★ 摩擦を減らす

        for (let i = 0; i < this.dominoCount; i++) {
            const angle = (i / this.dominoCount) * Math.PI * 2;

            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 1, 0.5),
                new THREE.MeshPhongMaterial({
                    color: new THREE.Color().setHSL(i / this.dominoCount, 0.8, 0.5),
                })
            );

            mesh.position.set(
                this.radius * Math.cos(angle),
                0.5,
                this.radius * Math.sin(angle)
            );

            mesh.rotation.y = -angle + Math.PI / 2;
            this.scene.add(mesh);
            this.dominoMeshes.push(mesh);

            const body = new CANNON.Body({
                mass: 1.5, // ★ 質量アップ
                shape: shape,
                position: new CANNON.Vec3(
                    this.radius * Math.cos(angle),
                    0.5,
                    this.radius * Math.sin(angle)
                ),
                material: dominoMaterial
            });

            body.quaternion.setFromEuler(0, -angle + Math.PI / 2, 0);

            this.world.addBody(body);
            this.dominoBodies.push(body);
        }

        // ★ 最初のドミノを強く倒す（高速化）
        setTimeout(() => {
            const angle = 0 * (Math.PI * 2 / this.dominoCount);

            const tangent = new CANNON.Vec3(
                -Math.sin(angle),
                0,
                Math.cos(angle)
            );

            const inward = new CANNON.Vec3(
                -Math.cos(angle),
                0,
                -Math.sin(angle)
            );

            const force = tangent.scale(4).vadd(inward.scale(1)); // ★ 強めの力

            this.dominoBodies[0].applyImpulse(force, new CANNON.Vec3(0, 0.5, 0));
        }, 500);
    };
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(
        640,
        480,
        new THREE.Vector3(6, 5, 6)
    );

    document.body.appendChild(viewport);
}
