//24Fi062
//柴田芽唯

import * as THREE from "three";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private cloud!: THREE.Points;
    private particleVelocity!: THREE.Vector3[];
    private timer = new THREE.Timer();

    constructor() {}

    public createRendererDOM(
        width: number,
        height: number,
        cameraPos: THREE.Vector3
    ): HTMLCanvasElement {

        const renderer = new THREE.WebGLRenderer();

        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x000000));

        const camera = new THREE.PerspectiveCamera(
            45,
            width / height,
            0.1,
            1000
        );

        camera.position.copy(cameraPos);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        this.createScene();

        const render = () => {

            this.updateParticles();

            renderer.render(this.scene, camera);

            requestAnimationFrame(render);
        };

        render();

        return renderer.domElement;
    }

    private createScene() {

        this.scene = new THREE.Scene();

        this.createParticles();
    }

    private createParticles() {

        const particleNum = 2000;

        const geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(
            particleNum * 3
        );

        this.particleVelocity = [];

        for (let i = 0; i < particleNum; i++) {

            const x =
                (Math.random() - 0.5) * 20;

            const y =
                Math.random() * 20;

            const z =
                (Math.random() - 0.5) * 20;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            const vx =
                (Math.random() - 0.5) * 0.5;

            const vy =
                -(5 + Math.random() * 10);

            const vz =
                (Math.random() - 0.5) * 0.5;

            this.particleVelocity.push(
                new THREE.Vector3(
                    vx,
                    vy,
                    vz
                )
            );
        }

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        const material =
            new THREE.PointsMaterial({
                color: 0xffffff,
                size: 0.2,
                transparent: true,
                opacity: 0.8,
            });

        this.cloud =
            new THREE.Points(
                geometry,
                material
            );

        this.scene.add(this.cloud);
    }

    private updateParticles() {

        this.timer.update();

        const deltaTime =
            this.timer.getDelta();

        const geometry =
            this.cloud.geometry as THREE.BufferGeometry;

        const positions =
            geometry.getAttribute(
                "position"
            ) as THREE.BufferAttribute;

        for (
            let i = 0;
            i < this.particleVelocity.length;
            i++
        ) {

            positions.setX(
                i,
                positions.getX(i) +
                this.particleVelocity[i].x *
                deltaTime
            );

            positions.setY(
                i,
                positions.getY(i) +
                this.particleVelocity[i].y *
                deltaTime
            );

            positions.setZ(
                i,
                positions.getZ(i) +
                this.particleVelocity[i].z *
                deltaTime
            );

            if (
                positions.getY(i) < -10
            ) {

                positions.setX(
                    i,
                    (Math.random() - 0.5) * 20
                );

                positions.setY(
                    i,
                    15 + Math.random() * 10
                );

                positions.setZ(
                    i,
                    (Math.random() - 0.5) * 20
                );
            }
        }

        positions.needsUpdate = true;
    }
}

window.addEventListener(
    "DOMContentLoaded",
    init
);

function init() {
    alert("課題9が実行された");

    const container =
        new ThreeJSContainer();

    const canvas =
        container.createRendererDOM(
            800,
            600,
            new THREE.Vector3(
                0,
                0,
                15
            )
        );

    document.body.appendChild(
        canvas
    );
}