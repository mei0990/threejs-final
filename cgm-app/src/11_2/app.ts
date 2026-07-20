// 名前：〇〇〇〇
// 学籍番号：XXXXX

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as TWEEN from "@tweenjs/tween.js";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private light!: THREE.Light;
    private particles!: THREE.Points;

    constructor() {}

    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x000000)); // 背景黒
        renderer.shadowMap.enabled = true;

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.enableDamping = true;

        this.createScene();

        const render: FrameRequestCallback = () => {
            orbitControls.update();
            TWEEN.update();
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

        // ライト
        this.light = new THREE.DirectionalLight(0xffffff, 1);
        this.light.position.set(1, 1, 1);
        this.scene.add(this.light);

        // -------------------------
        // 1000個以上の光の点を作成
        // -------------------------
        const count = 1500;
        const positions = new Float32Array(count * 3);

        // 初期位置：球状にランダム配置
        for (let i = 0; i < count; i++) {
            const r = Math.random() * 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // -------------------------
        // Tween.js 用の座標オブジェクト
        // -------------------------
        const particleData = { scale: 1 }; // 拡散 → 収束を scale で表現

        // 拡散アニメーション
        const expand = new TWEEN.Tween(particleData)
            .to({ scale: 3 }, 2000)
            .easing(TWEEN.Easing.Cubic.Out)
            .onUpdate(() => {
                this.particles.scale.set(particleData.scale, particleData.scale, particleData.scale);
            });

        // 収束アニメーション
        const gather = new TWEEN.Tween(particleData)
            .to({ scale: 0.2 }, 2000)
            .easing(TWEEN.Easing.Elastic.Out)
            .onUpdate(() => {
                this.particles.scale.set(particleData.scale, particleData.scale, particleData.scale);
            });

        // ループ連結
        expand.chain(gather);
        gather.chain(expand);

        expand.start();
    };
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();

    // カメラ位置を調整（見やすいように z=30）
    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(0, 0, 30));
    document.body.appendChild(viewport);
}
