//24FI062
//柴田芽唯

import * as THREE from "three";

class ThreeJSContainer {

    private scene!: THREE.Scene;

    private torusRed!: THREE.Points;
    private torusGreen!: THREE.Points;
    private torusBlue!: THREE.Points;

    private timer = new THREE.Timer();

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

            this.timer.update();
            const deltaTime = this.timer.getDelta();

            this.update(deltaTime);

            renderer.render(this.scene, camera);

            requestAnimationFrame(render);
        };

        render();

        return renderer.domElement;
    }

    private createScene() {

        this.scene = new THREE.Scene();

        this.torusRed = this.createTorus(
            0xff0000,
            -2
        );

        this.torusGreen = this.createTorus(
            0x00ff00,
            0
        );

        this.torusBlue = this.createTorus(
            0x0000ff,
            2
        );

        this.scene.add(this.torusRed);
        this.scene.add(this.torusGreen);
        this.scene.add(this.torusBlue);
    }

    private createTorus(
        color: number,
        xPos: number
    ): THREE.Points {

        const geometry =
            new THREE.TorusGeometry(
                1,
                0.4,
                16,
                100
            );

        geometry.deleteAttribute("uv");

        const material =
            new THREE.PointsMaterial({
                map: this.generateSprite(color),
                color: color,
                size: 0.15,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

        const points =
            new THREE.Points(
                geometry,
                material
            );

        points.position.x = xPos;

        return points;
    }

    private generateSprite(
        color: number
    ): THREE.Texture {

        const canvas =
            document.createElement("canvas");

        canvas.width = 16;
        canvas.height = 16;

        const context =
            canvas.getContext("2d")!;

        const gradient =
            context.createRadialGradient(
                8, 8, 0,
                8, 8, 8
            );

        gradient.addColorStop(
            0,
            "rgba(255,255,255,1)"
        );

        const r =
            (color >> 16) & 255;

        const g =
            (color >> 8) & 255;

        const b =
            color & 255;

        gradient.addColorStop(
            0.3,
            `rgba(${r},${g},${b},1)`
        );

        gradient.addColorStop(
            1,
            "rgba(0,0,0,0)"
        );

        context.fillStyle = gradient;
        context.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        const texture =
            new THREE.Texture(canvas);

        texture.needsUpdate = true;

        return texture;
    }

    private update(
        deltaTime: number
    ) {

        // 赤
        this.torusRed.rotation.x +=
            1.0 * deltaTime;

        this.torusRed.rotation.y +=
            0.5 * deltaTime;

        // 緑
        this.torusGreen.rotation.y +=
            2.0 * deltaTime;

        // 青
        this.torusBlue.rotation.z +=
            1.5 * deltaTime;

        this.torusBlue.rotation.x +=
            0.8 * deltaTime;
    }
}

window.addEventListener(
    "DOMContentLoaded",
    init
);

function init() {

    const container =
        new ThreeJSContainer();

    const canvas =
        container.createRendererDOM(
            800,
            600,
            new THREE.Vector3(
                0,
                0,
                10
            )
        );

    document.body.appendChild(
        canvas
    );
}