import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class LiveStage {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  private mirrorBall!: THREE.Mesh;
  private mirrorLights: THREE.PointLight[] = [];
  private movingLights: THREE.PointLight[] = [];
  private bigLights: THREE.Mesh[] = [];

  private particles!: THREE.Points;
  private beams: THREE.Mesh[] = [];
  private rings: THREE.Mesh[] = [];
  private glows: THREE.Mesh[] = [];

  private clock = new THREE.Clock();

  constructor() {
    this.init();
  }

  private init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0030a0);
    this.scene.fog = new THREE.Fog(0x0030a0, 10, 150);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 12, 30);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;

    // ライブ照明フルセット
    this.createWashLights();
    this.createFrontLights();
    this.createBackLights();
    this.createTopLights();
    this.createMovingLights();
    this.createBigLights();

    // ステージ構造
    this.createStage();
    this.createMirrorBall();
    this.createParticles();
    this.createBeams();
    this.createRings();
    this.createGlows();
    this.createLightWalls();

    window.addEventListener("resize", this.onResize);
    this.animate(controls);
  }

  // ----------------------------------------------------------
  // ライブ照明
  // ----------------------------------------------------------

  private createWashLights() {
    const wash = new THREE.HemisphereLight(0x88bbff, 0x000022, 1.4);
    this.scene.add(wash);
  }

  private createFrontLights() {
    const front = new THREE.PointLight(0xffffff, 12, 180);
    front.position.set(0, 14, 40);
    this.scene.add(front);

    const left = new THREE.PointLight(0xffffff, 8, 160);
    left.position.set(-20, 12, 35);
    this.scene.add(left);

    const right = new THREE.PointLight(0xffffff, 8, 160);
    right.position.set(20, 12, 35);
    this.scene.add(right);
  }

  private createBackLights() {
    const colors = [0x3366ff, 0x8844ff, 0x55aaff];

    colors.forEach((c, i) => {
      const back = new THREE.PointLight(c, 10, 200);
      back.position.set((i - 1) * 15, 14, -35);
      this.scene.add(back);
    });
  }

  private createTopLights() {
    for (let i = 0; i < 4; i++) {
      const spot = new THREE.SpotLight(0x88bbff, 10, 250, Math.PI / 6, 0.4);
      spot.position.set(Math.cos(i) * 12, 26, Math.sin(i) * 12);
      spot.target.position.set(0, 4, 0);
      this.scene.add(spot);
      this.scene.add(spot.target);
    }
  }

  private createMovingLights() {
    for (let i = 0; i < 6; i++) {
      const light = new THREE.PointLight(0x66ccff, 6, 180);
      light.position.set(Math.cos(i) * 18, 10, Math.sin(i) * 18);
      this.scene.add(light);
      this.movingLights.push(light);
    }
  }

  private createBigLights() {
    const geo = new THREE.SphereGeometry(3.5, 32, 32);

    for (let i = 0; i < 4; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x88bbff,
        transparent: true,
        opacity: 0.6
      });

      const sphere = new THREE.Mesh(geo, mat);
      const angle = (i / 4) * Math.PI * 2;

      sphere.position.set(Math.cos(angle) * 30, 14, Math.sin(angle) * 30);

      const light = new THREE.PointLight(0x88bbff, 12, 200);
      light.position.copy(sphere.position);

      this.scene.add(light);
      this.scene.add(sphere);

      this.bigLights.push(sphere);
    }
  }

  // ----------------------------------------------------------
  // ステージ（黒＋反射）
  // ----------------------------------------------------------

  private createStage() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 1,
        roughness: 0.05
      })
    );
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    const stage = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 8, 1.2, 64),
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 1,
        roughness: 0.1,
        emissive: 0x111111,
        emissiveIntensity: 0.4
      })
    );
    stage.position.y = 0.6;
    this.scene.add(stage);
  }

  // ----------------------------------------------------------
  // ミラーボール（タイル柄）
  // ----------------------------------------------------------

  private createMirrorBall() {
    const texture = this.generateTileTexture();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);

    this.mirrorBall = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 64, 64),
      new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 1,
        roughness: 0.02,
        emissive: 0x3366ff,
        emissiveIntensity: 0.7
      })
    );
    this.mirrorBall.position.set(0, 8, 0);
    this.scene.add(this.mirrorBall);

    // ミラーボール周囲の光源
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const light = new THREE.PointLight(0x99ddff, 3, 18);
      light.position.set(Math.cos(angle) * 3, 8, Math.sin(angle) * 3);
      this.scene.add(light);
      this.mirrorLights.push(light);
    }
  }

  private generateTileTexture(): THREE.Texture {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = "#cccccc";
    for (let y = 0; y < size; y += 16) {
      for (let x = 0; x < size; x += 16) {
        ctx.fillRect(x, y, 14, 14);
      }
    }

    return new THREE.CanvasTexture(canvas);
  }

  // ----------------------------------------------------------
  // パーティクル
  // ----------------------------------------------------------

  private createParticles() {
    const count = 2000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const r = Math.random() * 40;
      const a = Math.random() * Math.PI * 2;
      const h = 2 + Math.random() * 20;

      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = h;
      pos[i * 3 + 2] = Math.sin(a) * r;

      const c = new THREE.Color();
      c.setHSL(0.55 + Math.random() * 0.1, 0.9, 0.9);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

    this.particles = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.35,
        vertexColors: true,
        transparent: true,
        opacity: 1.0
      })
    );

    this.scene.add(this.particles);
  }

  // ----------------------------------------------------------
  // ビームライト
  // ----------------------------------------------------------

  private createBeams() {
    const beamGeo = new THREE.CylinderGeometry(0.15, 0.6, 30, 20, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x66ccff,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < 6; i++) {
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(Math.cos(i) * 10, 6, Math.sin(i) * 10);
      this.scene.add(beam);
      this.beams.push(beam);
    }
  }

  // ----------------------------------------------------------
  // リング
  // ----------------------------------------------------------

  private createRings() {
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(3 + i * 1.5, 0.08, 16, 100),
        new THREE.MeshBasicMaterial({ color: 0x55aaff })
      );
      ring.position.set(0, 8, 0);
      this.scene.add(ring);
      this.rings.push(ring);
    }
  }

  // ----------------------------------------------------------
  // グロー球
  // ----------------------------------------------------------

  private createGlows() {
    for (let i = 0; i < 8; i++) {
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x99ddff })
      );
      glow.position.set(Math.cos(i) * 5, 8, Math.sin(i) * 5);
      this.scene.add(glow);
      this.glows.push(glow);
    }
  }

  // ----------------------------------------------------------
  // 光の壁
  // ----------------------------------------------------------

  private createLightWalls() {
    const wallGeo = new THREE.PlaneGeometry(120, 50);
    const wallMat = new THREE.MeshBasicMaterial({
      color: 0x4477ff,
      transparent: true,
      opacity: 0.15
    });

    const back = new THREE.Mesh(wallGeo, wallMat);
    back.position.set(0, 15, -50);
    this.scene.add(back);

    const left = new THREE.Mesh(wallGeo, wallMat);
    left.rotation.y = Math.PI / 2;
    left.position.set(-50, 15, 0);
    this.scene.add(left);

    const right = new THREE.Mesh(wallGeo, wallMat);
    right.rotation.y = -Math.PI / 2;
    right.position.set(50, 15, 0);
    this.scene.add(right);
  }

  // ----------------------------------------------------------
  // アニメーション
  // ----------------------------------------------------------

  private animate(controls: OrbitControls) {
    const render = () => {
      const t = this.clock.getElapsedTime();

      // ミラーボール揺れ＋回転
      this.mirrorBall.position.y = 8 + Math.sin(t * 2) * 0.4;
      this.mirrorBall.rotation.x += 0.01;
      this.mirrorBall.rotation.y += 0.04;
      this.mirrorBall.rotation.z += 0.02;

      // ミラーボール周囲の光源
      this.mirrorLights.forEach((light, i) => {
        light.position.y = 8 + Math.sin(t * 3 + i) * 0.8;
      });

      // ムービングライト
      this.movingLights.forEach((ml, i) => {
        const a = t * 0.6 + i;
        ml.position.x = Math.cos(a) * 18;
        ml.position.z = Math.sin(a) * 18;
      });

      // 巨大ライト
      this.bigLights.forEach((bl, i) => {
        const a = t * 0.3 + i;
        bl.position.x = Math.cos(a) * 30;
        bl.position.z = Math.sin(a) * 30;
      });

      // パーティクル上昇
      const posAttr = this.particles.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i);
        y += 0.03;
        if (y > 25) y = 2;
        y += Math.sin(t * 3 + i) * 0.08;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;

      // ビーム回転
      this.beams.forEach((beam, i) => {
        beam.rotation.y += 0.01;
        beam.rotation.z = Math.sin(t + i) * 0.4;
        beam.rotation.x = Math.cos(t + i) * 0.4;
      });

      // リング回転
      this.rings.forEach((ring, i) => {
        ring.rotation.y = t * (i + 1);
        ring.rotation.x = Math.PI / 2;
      });

      // グロー球
      this.glows.forEach((g, i) => {
        const a = t + i;
        g.position.x = Math.cos(a) * 5;
        g.position.z = Math.sin(a) * 5;
      });

      // カメラ揺れ
      this.camera.position.x = Math.sin(t * 0.15) * 2;
      this.camera.lookAt(0, 8, 0);

      controls.update();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(render);
    };
    render();
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };
}

window.addEventListener("DOMContentLoaded", () => new LiveStage());
