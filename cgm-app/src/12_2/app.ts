// 名前：芽唯（Shibata Mei）
// 学籍番号：24FI0XXX

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as CANNON from "cannon-es";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private world!: CANNON.World;

    private carBody!: CANNON.Body;
    private carMesh!: THREE.Mesh;

    private wheelMeshes: THREE.Mesh[] = [];

    private engineForce: number = 0;
    private steeringAngle: number = 0;

    constructor() {}

    public createRendererDOM(width: number, height: number, cameraPos: THREE.Vector3) {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(0x87ceeb);

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const controls = new OrbitControls(camera, renderer.domElement);

        this.createScene();
        this.createPhysics();
        this.setupKeyboard();

        const animate = () => {
            controls.update();
            this.world.step(1 / 60);

            // 車体の同期
            this.carMesh.position.copy(this.carBody.position as any);
            this.carMesh.quaternion.copy(this.carBody.quaternion as any);

            // 車輪の同期（見た目だけ）
            for (let i = 0; i < 4; i++) {
                const wheel = this.wheelMeshes[i];
                const offset = [
                    [-1, -0.25, 1.5],
                    [1, -0.25, 1.5],
                    [-1, -0.25, -1.5],
                    [1, -0.25, -1.5]
                ][i];

                const pos = this.carBody.position.vadd(
                    this.carBody.quaternion.vmult(new CANNON.Vec3(offset[0], offset[1], offset[2]))
                );

                wheel.position.copy(pos as any);
                wheel.rotation.y = (i < 2) ? this.steeringAngle : 0;
            }

            renderer.render(this.scene, camera);
            requestAnimationFrame(animate);
        };

        animate();
        return renderer.domElement;
    }

    private createScene() {
        this.scene = new THREE.Scene();

        const grid = new THREE.GridHelper(20, 20);
        this.scene.add(grid);

        const axes = new THREE.AxesHelper(5);
        this.scene.add(axes);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 5);
        this.scene.add(light);

        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambient);

        // 車本体（Three）
        this.carMesh = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.5, 4),
            new THREE.MeshPhongMaterial({ color: 0xff4444 })
        );
        this.scene.add(this.carMesh);

        // 車輪（Three）
        const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        wheelGeo.rotateZ(Math.PI / 2);

        for (let i = 0; i < 4; i++) {
            const wheel = new THREE.Mesh(
                wheelGeo,
                new THREE.MeshPhongMaterial({ color: 0x333333 })
            );
            this.scene.add(wheel);
            this.wheelMeshes.push(wheel);
        }
    }

    private createPhysics() {
        this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });

        // 地面
        const ground = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Plane()
        });
        ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.world.addBody(ground);

        // 車本体（Cannon）
        this.carBody = new CANNON.Body({
            mass: 5,
            shape: new CANNON.Box(new CANNON.Vec3(1, 0.25, 2)),
            position: new CANNON.Vec3(0, 1, 0)
        });
        this.world.addBody(this.carBody);
    }

    private setupKeyboard() {
        document.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "ArrowUp":
                    this.engineForce = 50;
                    break;
                case "ArrowDown":
                    this.engineForce = -50;
                    break;
                case "ArrowLeft":
                    this.steeringAngle = 0.5;
                    break;
                case "ArrowRight":
                    this.steeringAngle = -0.5;
                    break;
            }
        });

        document.addEventListener("keyup", (event) => {
            switch (event.key) {
                case "ArrowUp":
                case "ArrowDown":
                    this.engineForce = 0;
                    break;
                case "ArrowLeft":
                case "ArrowRight":
                    this.steeringAngle = 0;
                    break;
            }
        });

        // 車の動き
        setInterval(() => {
            const forward = this.carBody.quaternion.vmult(new CANNON.Vec3(0, 0, -1));
            this.carBody.applyForce(forward.scale(this.engineForce), this.carBody.position);
        }, 16);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const container = new ThreeJSContainer();
    const viewport = container.createRendererDOM(
        640,
        480,
        new THREE.Vector3(8, 6, 8)
    );
    document.body.appendChild(viewport);
});
