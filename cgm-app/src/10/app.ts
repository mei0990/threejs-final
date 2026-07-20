// 24FI062
// 柴田芽唯

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private light!: THREE.Light;

    constructor() {}

    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x495ed));
        renderer.shadowMap.enabled = true;

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const orbitControls = new OrbitControls(camera, renderer.domElement);

        this.createScene();

        const render: FrameRequestCallback = () => {
            orbitControls.update();
            renderer.render(this.scene, camera);
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);

        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";
        return renderer.domElement;
    };

    private createScene = () => {
        this.scene = new THREE.Scene();

        // === モデル（XYZ軸の矢印） ===
        const geometry = new THREE.ConeGeometry(0.25, 1);
        const redCone = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0xff0000 }));
        const greenCone = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0x00ff00 }));
        const blueCone = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0x0000ff }));

        redCone.translateX(0.5);
        redCone.rotateZ(-Math.PI / 2);
        greenCone.translateY(0.5);
        blueCone.translateZ(0.5);
        blueCone.rotateX(Math.PI / 2);

        const obj = new THREE.Group();
        obj.add(redCone);
        obj.add(greenCone);
        obj.add(blueCone);
        this.scene.add(obj);

        // === グリッド & 軸 ===
        this.scene.add(new THREE.GridHelper(10));
        this.scene.add(new THREE.AxesHelper(5));

        // === ライト ===
        this.light = new THREE.DirectionalLight(0xffffff);
        this.light.position.set(1, 1, 1).normalize();
        this.scene.add(this.light);

        // === 通過点（課題の5点） ===
        const points: THREE.Vector3[] = [
            new THREE.Vector3(0, 0, -4), // P0
            new THREE.Vector3(0, 0,  2), // P1
            new THREE.Vector3(2, 0,  2), // P2
            new THREE.Vector3(0, 2,  0), // P3
            new THREE.Vector3(-4, 2, 0)  // P4
        ];

        // === 接ベクトル（C1連続） ===
        const tangents: THREE.Vector3[] = [];

        tangents[0] = points[1].clone().sub(points[0]); // 端点
        for (let i = 1; i <= 3; i++) {
            tangents[i] = points[i + 1].clone().sub(points[i - 1]).multiplyScalar(0.5);
        }
        tangents[4] = points[4].clone().sub(points[3]); // 端点

        // === Hermite 曲線関数 ===
        const hermite = (
            p0: THREE.Vector3,
            p1: THREE.Vector3,
            v0: THREE.Vector3,
            v1: THREE.Vector3,
            u: number
        ): THREE.Vector3 => {
            const u2 = u * u;
            const u3 = u2 * u;

            const h00 = 2 * u3 - 3 * u2 + 1;
            const h10 = u3 - 2 * u2 + u;
            const h01 = -2 * u3 + 3 * u2;
            const h11 = u3 - u2;

            const result = new THREE.Vector3();
            result.addScaledVector(p0, h00);
            result.addScaledVector(v0, h10);
            result.addScaledVector(p1, h01);
            result.addScaledVector(v1, h11);
            return result;
        };

        // === アニメーション ===
        const timer = new THREE.Timer();
        let t = 0;
        const numSeg = 4; // P0-P1, P1-P2, P2-P3, P3-P4

        const update: FrameRequestCallback = () => {
            timer.update();
            t += timer.getDelta() * 0.25; // 速度調整
            t %= 1.0;

            const s = t * numSeg;
            const seg = Math.floor(s);
            const u = s - seg;

            const p0 = points[seg];
            const p1 = points[seg + 1];
            const v0 = tangents[seg];
            const v1 = tangents[seg + 1];

            const pos = hermite(p0, p1, v0, v1, u);
            obj.position.copy(pos);

            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    };
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();
    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(5, 7, 5));
    document.body.appendChild(viewport);
}
