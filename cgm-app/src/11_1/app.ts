// 名前：〇〇〇〇
// 学籍番号：XXXXX

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as TWEEN from "@tweenjs/tween.js";

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
        orbitControls.enableDamping = true;

        this.createScene();

        // ⭐ time を渡さないことで Tween が確実に動く
        const render: FrameRequestCallback = () => {
            orbitControls.update();
            TWEEN.update();   // ← これが重要！
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
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);

        // 赤い立方体
        const redCube = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.MeshPhongMaterial({ color: 0xff0000 })
        );
        this.scene.add(redCube);

        // 緑の立方体
        const greenCube = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.MeshPhongMaterial({ color: 0x00ff00 })
        );
        this.scene.add(greenCube);

        // ひし形の4点
        const p1 = { x: 0, y: 5 };
        const p2 = { x: 5, y: 0 };
        const p3 = { x: 0, y: -5 };
        const p4 = { x: -5, y: 0 };

        // ⭐ Tween 用の座標オブジェクト
        const redPos = { x: -2, y: 0 };
        const greenPos = { x: 2, y: 0 };

        // 毎フレーム Three.js の position に反映
        const syncPositions = () => {
            redCube.position.set(redPos.x, redPos.y, 0);
            greenCube.position.set(greenPos.x, greenPos.y, 0);
            requestAnimationFrame(syncPositions);
        };
        syncPositions();

        // 赤い立方体のアニメーション
        const tweenR1 = new TWEEN.Tween(redPos).to(p1, 1000).easing(TWEEN.Easing.Elastic.Out);
        const tweenR2 = new TWEEN.Tween(redPos).to(p2, 1000).easing(TWEEN.Easing.Elastic.Out);
        const tweenR3 = new TWEEN.Tween(redPos).to(p3, 1000).easing(TWEEN.Easing.Elastic.Out);
        const tweenR4 = new TWEEN.Tween(redPos).to(p4, 1000).easing(TWEEN.Easing.Elastic.Out);

        tweenR1.chain(tweenR2);
        tweenR2.chain(tweenR3);
        tweenR3.chain(tweenR4);
        tweenR4.chain(tweenR1);

        // 緑の立方体（逆方向）
        const tweenG1 = new TWEEN.Tween(greenPos).to(p3, 1000).easing(TWEEN.Easing.Elastic.Out);
        const tweenG2 = new TWEEN.Tween(greenPos).to(p4, 1000).easing(TWEEN.Easing.Elastic.Out);
        const tweenG3 = new TWEEN.Tween(greenPos).to(p1, 1000).easing(TWEEN.Easing.Elastic.Out);
        const tweenG4 = new TWEEN.Tween(greenPos).to(p2, 1000).easing(TWEEN.Easing.Elastic.Out);

        tweenG1.chain(tweenG2);
        tweenG2.chain(tweenG3);
        tweenG3.chain(tweenG4);
        tweenG4.chain(tweenG1);

        // ⭐ ブラウザを開いた瞬間に自動で動く
        tweenR1.start();
        tweenG1.start();
    };
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();
    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(0, 0, 20));
    document.body.appendChild(viewport);
}
