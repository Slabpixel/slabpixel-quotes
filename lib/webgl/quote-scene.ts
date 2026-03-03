/**
 * Three.js WebGL scene for the quote card grid.
 * Adapted from J0SUKE/spotify-visualiser approach:
 * - InstancedMesh of card planes scattered in 3D space
 * - Custom vertex/fragment shaders for infinite wrapping
 * - Pointer drag (X/Y) + wheel scroll (Z depth)
 * - Auto-drift animation
 * - Raycaster for click-to-select
 */

import * as THREE from "three";
import { type QuoteData } from "@/types/quote";
import { buildTextureAtlas, type TextureAtlas } from "./card-renderer";

// Inline shaders (to avoid need for GLSL loader in Next.js)
const vertexShader = /* glsl */ `
varying vec2 vUv;
varying float vVisibility;
varying vec4 vTextureCoords;
varying float vDepth;

attribute vec3 aInitialPosition;
attribute float aMeshSpeed;
attribute vec4 aTextureCoords;

uniform float uTime;
uniform vec2 uBounds;
uniform vec2 uDrag;
uniform float uScrollZ;
uniform float uSpeedZ;

float remap(float value, float minVal, float maxVal) {
  return clamp((value - minVal) / (maxVal - minVal), 0.0, 1.0);
}

void main() {
  vec3 newPosition = position + aInitialPosition;

  float maxX = uBounds.x;
  float maxY = uBounds.y;

  float maxXoffset = distance(aInitialPosition.x, maxX);
  float minXoffset = distance(aInitialPosition.x, -maxX);
  float maxYoffset = distance(aInitialPosition.y, maxY);
  float minYoffset = distance(aInitialPosition.y, -maxY);

  float xDisplacement = mod(minXoffset - uDrag.x + uTime * aMeshSpeed, maxXoffset + minXoffset) - minXoffset;
  float yDisplacement = mod(minYoffset - uDrag.y, maxYoffset + minYoffset) - minYoffset;

  float maxZ = 10.0;
  float minZ = -35.0;
  float maxZoffset = distance(aInitialPosition.z, maxZ);
  float minZoffset = distance(aInitialPosition.z, minZ);
  float zDisplacement = mod(uScrollZ + minZoffset, maxZoffset + minZoffset) - minZoffset;

  newPosition.x += xDisplacement;
  newPosition.y += yDisplacement;
  newPosition.z += zDisplacement;

  vVisibility = remap(newPosition.z, minZ, minZ + 8.0);
  float closeFade = 1.0 - remap(newPosition.z, 6.0, maxZ);
  vVisibility *= closeFade;
  vDepth = remap(newPosition.z, minZ, maxZ);

  vec4 modelPosition = modelMatrix * instanceMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  vUv = uv;
  vTextureCoords = aTextureCoords;
}
`;

const fragmentShader = /* glsl */ `
varying vec2 vUv;
varying float vVisibility;
varying vec4 vTextureCoords;
varying float vDepth;

uniform sampler2D uAtlas;
uniform sampler2D uBlurryAtlas;

float roundedRectSDF(vec2 p, vec2 b, float r) {
  vec2 d = abs(p) - b + vec2(r);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
}

void main() {
  float xStart = vTextureCoords.x;
  float xEnd = vTextureCoords.y;
  float yStart = vTextureCoords.z;
  float yEnd = vTextureCoords.w;

  vec2 atlasUV = vec2(
    mix(xStart, xEnd, vUv.x),
    mix(yStart, yEnd, 1.0 - vUv.y)
  );

  vec4 sharpColor = texture2D(uAtlas, atlasUV);
  vec4 blurryColor = texture2D(uBlurryAtlas, atlasUV);

  float blurAmount = 1.0 - smoothstep(0.0, 0.5, vDepth);
  vec4 color = mix(sharpColor, blurryColor, blurAmount * 0.6);

  vec2 center = vUv - 0.5;
  vec2 halfSize = vec2(0.5, 0.5);
  float cornerRadius = 0.04;
  float dist = roundedRectSDF(center, halfSize - vec2(0.005), cornerRadius);
  float mask = 1.0 - smoothstep(0.0, 0.005, dist);

  color.a = mask * vVisibility;

  if (color.a < 0.01) discard;

  gl_FragColor = color;
}
`;

function lerp(current: number, target: number, ease: number): number {
  return current + (target - current) * ease;
}

export interface QuoteSceneOptions {
  canvas: HTMLCanvasElement;
  quotes: QuoteData[];
  onQuoteClick?: (index: number) => void;
  /** If true, start with cards pushed far back; call playEntrance() to rush in */
  deferEntrance?: boolean;
}

export class QuoteScene {
  private canvas: HTMLCanvasElement;
  private quotes: QuoteData[];
  private onQuoteClick?: (index: number) => void;

  // Three.js core
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private time = 0;

  // Scene objects
  private mesh!: THREE.InstancedMesh;
  private material!: THREE.ShaderMaterial;
  private geometry!: THREE.PlaneGeometry;

  // World sizes
  private sizes = { width: 0, height: 0 };

  // Config
  private meshCount: number;
  private bounds = { maxX: 0, maxY: 0 };

  // Drag state
  private drag = {
    xCurrent: 0,
    xTarget: 0,
    yCurrent: 0,
    yTarget: 0,
    isDown: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    startTime: 0,
    moved: false,
  };
  private dragSensitivity = 1;
  private dragDamping = 0.08;

  // Scroll state
  private scroll = {
    target: 0,
    current: 0,
  };
  private speedZ = 0;
  private isEntranceActive = false;

  // Atlas data for index mapping
  private atlas: TextureAtlas | null = null;

  // Per-instance data stored for JS-side click picking
  private initialPositions: Float32Array | null = null;
  private meshSpeeds: Float32Array | null = null;

  // Card world dimensions (matches geometry)
  private cardW = 2.5;
  private cardH = 2.0;

  // Sorting buffers (reused each frame to avoid GC)
  private sortOrder: number[] = [];
  private sortedPositions: Float32Array | null = null;
  private sortedSpeeds: Float32Array | null = null;
  private sortedTexCoords: Float32Array | null = null;

  // Animation frame
  private rafId = 0;
  private isDestroyed = false;

  constructor(options: QuoteSceneOptions) {
    this.canvas = options.canvas;
    this.quotes = options.quotes;
    this.onQuoteClick = options.onQuoteClick;

    // More instances = denser field. At least 100, scale with quote count.
    this.meshCount = Math.max(100, this.quotes.length * 6);

    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.computeSizes();
    this.initMaterial();
    this.initGeometry();
    this.initMesh();
    this.bindEvents();

    // If deferring entrance, push everything far away initially
    if (options.deferEntrance) {
      this.scroll.current = -200;
      this.scroll.target = -200;
      this.material.uniforms.uScrollZ.value = -200;
    }

    // Build textures asynchronously, then fill mesh data
    this.buildTextures();

    // Start render loop
    this.animate();
  }

  private initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  }

  private initScene() {
    this.scene = new THREE.Scene();
  }

  private initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    this.camera.position.z = 10;
    this.scene.add(this.camera);
  }

  private computeSizes() {
    const fov = this.camera.fov * (Math.PI / 180);
    const height = this.camera.position.z * Math.tan(fov / 2) * 2;
    const width = height * this.camera.aspect;
    this.sizes = { width, height };

    this.bounds = {
      maxX: width * 2,
      maxY: height * 2,
    };
  }

  private initMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uBounds: {
          value: new THREE.Vector2(this.bounds.maxX, this.bounds.maxY),
        },
        uDrag: { value: new THREE.Vector2(0, 0) },
        uScrollZ: { value: 0 },
        uSpeedZ: { value: 0 },
        uAtlas: { value: null },
        uBlurryAtlas: { value: null },
      },
    });
  }

  private initGeometry() {
    // Card aspect ratio: 500×400 (5:4 horizontal)
    const cardW = 2.5;
    const cardH = 2.0;
    this.geometry = new THREE.PlaneGeometry(cardW, cardH, 1, 1);
  }

  private initMesh() {
    this.mesh = new THREE.InstancedMesh(
      this.geometry,
      this.material,
      this.meshCount,
    );
    this.scene.add(this.mesh);
  }

  private async buildTextures() {
    this.atlas = await buildTextureAtlas(this.quotes);

    // Create Three.js textures from canvases
    const atlasTexture = new THREE.CanvasTexture(this.atlas.canvas);
    atlasTexture.minFilter = THREE.LinearFilter;
    atlasTexture.magFilter = THREE.LinearFilter;
    atlasTexture.needsUpdate = true;

    const blurryTexture = new THREE.CanvasTexture(this.atlas.blurryCanvas);
    blurryTexture.minFilter = THREE.LinearFilter;
    blurryTexture.magFilter = THREE.LinearFilter;
    blurryTexture.needsUpdate = true;

    this.material.uniforms.uAtlas.value = atlasTexture;
    this.material.uniforms.uBlurryAtlas.value = blurryTexture;

    this.fillMeshData();
  }

  private fillMeshData() {
    if (!this.atlas) return;

    const count = this.meshCount;
    const initialPosition = new Float32Array(count * 3);
    const meshSpeed = new Float32Array(count);
    const textureCoords = new Float32Array(count * 4);

    for (let i = 0; i < count; i++) {
      // Scatter across the wrapping space
      initialPosition[i * 3 + 0] = (Math.random() - 0.5) * this.bounds.maxX * 2; // X
      initialPosition[i * 3 + 1] = (Math.random() - 0.5) * this.bounds.maxY * 2; // Y
      initialPosition[i * 3 + 2] = Math.random() * (7 - -30) - 30; // Z: -30 to 7

      // Random auto-drift speed per instance
      meshSpeed[i] = Math.random() * 0.3 + 0.3;

      // Cycle through quote textures
      const quoteIdx = i % this.atlas!.imageInfos.length;
      const info = this.atlas!.imageInfos[quoteIdx];
      textureCoords[i * 4 + 0] = info.uvs.xStart;
      textureCoords[i * 4 + 1] = info.uvs.xEnd;
      textureCoords[i * 4 + 2] = info.uvs.yStart;
      textureCoords[i * 4 + 3] = info.uvs.yEnd;
    }

    // Store for JS-side click picking + sorting
    this.initialPositions = initialPosition;
    this.meshSpeeds = meshSpeed;

    // Pre-allocate sort buffers (reused every frame)
    this.sortOrder = Array.from({ length: count }, (_, i) => i);
    this.sortedPositions = new Float32Array(count * 3);
    this.sortedSpeeds = new Float32Array(count);
    this.sortedTexCoords = new Float32Array(count * 4);

    this.geometry.setAttribute(
      "aInitialPosition",
      new THREE.InstancedBufferAttribute(initialPosition, 3),
    );
    this.geometry.setAttribute(
      "aMeshSpeed",
      new THREE.InstancedBufferAttribute(meshSpeed, 1),
    );
    this.geometry.setAttribute(
      "aTextureCoords",
      new THREE.InstancedBufferAttribute(textureCoords, 4),
    );
  }

  // ── Event handlers ──

  private onPointerDown = (e: PointerEvent) => {
    this.drag.isDown = true;
    this.drag.startX = e.clientX;
    this.drag.startY = e.clientY;
    this.drag.lastX = e.clientX;
    this.drag.lastY = e.clientY;
    this.drag.startTime = Date.now();
    this.drag.moved = false;
    this.canvas.setPointerCapture(e.pointerId);
    this.canvas.style.cursor = "grabbing";
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.drag.isDown) return;

    const dx = e.clientX - this.drag.lastX;
    const dy = e.clientY - this.drag.lastY;
    this.drag.lastX = e.clientX;
    this.drag.lastY = e.clientY;

    // Check if moved enough to count as drag
    const totalDx = Math.abs(e.clientX - this.drag.startX);
    const totalDy = Math.abs(e.clientY - this.drag.startY);
    if (totalDx > 5 || totalDy > 5) {
      this.drag.moved = true;
    }

    const worldPerPixelX =
      (this.sizes.width / window.innerWidth) * this.dragSensitivity;
    const worldPerPixelY =
      (this.sizes.height / window.innerHeight) * this.dragSensitivity;

    this.drag.xTarget += -dx * worldPerPixelX;
    this.drag.yTarget += dy * worldPerPixelY;
  };

  private onPointerUp = (e: PointerEvent) => {
    this.canvas.style.cursor = "grab";

    if (!this.drag.moved && Date.now() - this.drag.startTime < 300) {
      // This was a click, not a drag — detect which card
      this.handleClick(e);
    }

    this.drag.isDown = false;
    try {
      this.canvas.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const normalized = e.deltaY * 0.003;
    this.scroll.target += normalized * this.sizes.height * 0.3;
    this.speedZ += normalized * 0.5;
  };

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.computeSizes();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

    this.material.uniforms.uBounds.value.set(
      this.bounds.maxX,
      this.bounds.maxY,
    );
  };

  private bindEvents() {
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    this.canvas.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("resize", this.onResize);

    this.canvas.style.cursor = "grab";
  }

  private unbindEvents() {
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("resize", this.onResize);
  }

  // ── Depth sorting (back-to-front) ──
  // Without sorting, instances render in buffer-index order and far cards
  // can paint over near cards. We re-sort every frame so the painter's
  // algorithm produces correct z-layering with transparent blending.

  private computeWrappedZ(i: number): number {
    if (!this.initialPositions) return 0;
    const iz = this.initialPositions[i * 3 + 2];
    const maxZ = 10;
    const minZ = -35;
    const scrollZ = this.scroll.current;

    const maxZoff = Math.abs(iz - maxZ);
    const minZoff = Math.abs(iz - minZ);
    const rangeZ = maxZoff + minZoff;
    const zDisp =
      ((((scrollZ + minZoff) % rangeZ) + rangeZ) % rangeZ) - minZoff;
    return iz + zDisp;
  }

  private sortInstancesByDepth() {
    if (
      !this.initialPositions ||
      !this.meshSpeeds ||
      !this.sortedPositions ||
      !this.sortedSpeeds ||
      !this.sortedTexCoords
    )
      return;

    const posAttr = this.geometry.getAttribute(
      "aInitialPosition",
    ) as THREE.InstancedBufferAttribute;
    const spdAttr = this.geometry.getAttribute(
      "aMeshSpeed",
    ) as THREE.InstancedBufferAttribute;
    const texAttr = this.geometry.getAttribute(
      "aTextureCoords",
    ) as THREE.InstancedBufferAttribute;
    if (!posAttr || !spdAttr || !texAttr) return;

    const srcPos = this.initialPositions;
    const srcSpd = this.meshSpeeds;
    const srcTex = texAttr.array as Float32Array;

    // Sort ascending by wrapped Z → back-to-front (far drawn first)
    const order = this.sortOrder;
    for (let i = 0; i < this.meshCount; i++) order[i] = i;
    order.sort((a, b) => this.computeWrappedZ(a) - this.computeWrappedZ(b));

    // Scatter into sorted buffers
    const dstPos = this.sortedPositions;
    const dstSpd = this.sortedSpeeds;
    const dstTex = this.sortedTexCoords;

    for (let dst = 0; dst < this.meshCount; dst++) {
      const src = order[dst];
      dstPos[dst * 3 + 0] = srcPos[src * 3 + 0];
      dstPos[dst * 3 + 1] = srcPos[src * 3 + 1];
      dstPos[dst * 3 + 2] = srcPos[src * 3 + 2];
      dstSpd[dst] = srcSpd[src];
      dstTex[dst * 4 + 0] = srcTex[src * 4 + 0];
      dstTex[dst * 4 + 1] = srcTex[src * 4 + 1];
      dstTex[dst * 4 + 2] = srcTex[src * 4 + 2];
      dstTex[dst * 4 + 3] = srcTex[src * 4 + 3];
    }

    // Copy back to source arrays (so click picking uses current order)
    srcPos.set(dstPos);
    srcSpd.set(dstSpd);

    // Upload to GPU
    (posAttr.array as Float32Array).set(dstPos);
    posAttr.needsUpdate = true;
    (spdAttr.array as Float32Array).set(dstSpd);
    spdAttr.needsUpdate = true;
    (texAttr.array as Float32Array).set(dstTex);
    texAttr.needsUpdate = true;
  }

  // ── Click → manual screen-space picking ──
  // We mirror the vertex shader's wrapping math in JS to find card centers,
  // then project to NDC to find which card the mouse click lands on.

  private getInstanceCenter(i: number): THREE.Vector3 | null {
    if (!this.initialPositions || !this.meshSpeeds) return null;

    const ix = this.initialPositions[i * 3 + 0];
    const iy = this.initialPositions[i * 3 + 1];
    const iz = this.initialPositions[i * 3 + 2];
    const speed = this.meshSpeeds[i];

    const maxX = this.bounds.maxX;
    const maxY = this.bounds.maxY;
    const maxZ = 10;
    const minZ = -35;

    const currentTime = this.material.uniforms.uTime.value;
    const dragX = this.drag.xCurrent;
    const dragY = this.drag.yCurrent;
    const scrollZ = this.scroll.current;

    // Mirror vertex shader wrapping (GLSL mod always returns positive)
    const maxXoff = Math.abs(ix - maxX);
    const minXoff = Math.abs(ix + maxX);
    const rangeX = maxXoff + minXoff;
    const xDisp =
      ((((minXoff - dragX + currentTime * speed) % rangeX) + rangeX) % rangeX) -
      minXoff;

    const maxYoff = Math.abs(iy - maxY);
    const minYoff = Math.abs(iy + maxY);
    const rangeY = maxYoff + minYoff;
    const yDisp = ((((minYoff - dragY) % rangeY) + rangeY) % rangeY) - minYoff;

    const maxZoff = Math.abs(iz - maxZ);
    const minZoff = Math.abs(iz - minZ);
    const rangeZ = maxZoff + minZoff;
    const zDisp =
      ((((scrollZ + minZoff) % rangeZ) + rangeZ) % rangeZ) - minZoff;

    const fx = ix + xDisp;
    const fy = iy + yDisp;
    const fz = iz + zDisp;

    // Check visibility (same as shader)
    const vis = Math.min(1, Math.max(0, (fz - minZ) / 8));
    const closeFade = 1 - Math.min(1, Math.max(0, (fz - 6) / (maxZ - 6)));
    if (vis * closeFade < 0.15) return null; // Skip invisible cards

    return new THREE.Vector3(fx, fy, fz);
  }

  private handleClick(e: PointerEvent) {
    if (!this.atlas || !this.onQuoteClick || !this.initialPositions) return;

    const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
    const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;

    let closestIdx = -1;
    let closestDist = Infinity;

    const tempVec = new THREE.Vector3();

    for (let i = 0; i < this.meshCount; i++) {
      const center = this.getInstanceCenter(i);
      if (!center) continue;

      // Compute approximate screen extent of this card
      const depth = Math.abs(center.z - this.camera.position.z);
      const fovTan = Math.tan((this.camera.fov * Math.PI) / 360);
      const halfW = (this.cardW * 0.5) / (depth * fovTan * this.camera.aspect);
      const halfH = (this.cardH * 0.5) / (depth * fovTan);

      // Project center
      tempVec.copy(center).project(this.camera);

      // Check if click is within approximate card rectangle
      if (
        Math.abs(ndcX - tempVec.x) < halfW &&
        Math.abs(ndcY - tempVec.y) < halfH &&
        tempVec.z < 1 // In front of camera
      ) {
        // Prefer closer cards (smaller z = closer to camera = larger on screen)
        const dist = center.z;
        if (dist > closestDist) {
          // Higher z = closer to camera in our setup
          closestDist = dist;
          closestIdx = i;
        }
      }
    }

    if (closestIdx >= 0) {
      const quoteIdx = closestIdx % this.quotes.length;
      this.onQuoteClick(quoteIdx);
    }
  }

  // ── Entrance animation ──

  /** Rush cards from far away to resting position with high velocity feel */
  playEntrance() {
    this.scroll.target = 0;
    this.speedZ = 15;
    this.isEntranceActive = true;
  }

  // ── Render loop ──

  private animate = () => {
    if (this.isDestroyed) return;
    this.rafId = requestAnimationFrame(this.animate);

    const now = this.clock.getElapsedTime();
    const delta = now - this.time;
    this.time = now;
    const normalizedDelta = delta / (1 / 60);

    // Update time uniform
    this.material.uniforms.uTime.value += normalizedDelta * 0.012;

    // Smooth drag interpolation
    this.drag.xCurrent = lerp(
      this.drag.xCurrent,
      this.drag.xTarget,
      this.dragDamping,
    );
    this.drag.yCurrent = lerp(
      this.drag.yCurrent,
      this.drag.yTarget,
      this.dragDamping,
    );
    this.material.uniforms.uDrag.value.set(
      this.drag.xCurrent,
      this.drag.yCurrent,
    );

    // Smooth scroll interpolation
    // Use a slower lerp during entrance for a longer, more dramatic rush
    const scrollEase = this.isEntranceActive ? 0.025 : 0.1;
    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      scrollEase,
    );
    this.material.uniforms.uScrollZ.value = this.scroll.current;

    // Check if entrance is done
    if (
      this.isEntranceActive &&
      Math.abs(this.scroll.current - this.scroll.target) < 0.5
    ) {
      this.isEntranceActive = false;
    }

    // Decay speed
    this.speedZ *= this.isEntranceActive ? 0.97 : 0.85;
    this.material.uniforms.uSpeedZ.value = this.speedZ;

    // Sort instances back-to-front for correct transparent z-layering
    this.sortInstancesByDepth();

    this.renderer.render(this.scene, this.camera);
  };

  // ── Cleanup ──

  destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.rafId);
    this.unbindEvents();
    this.geometry.dispose();
    this.material.dispose();
    this.mesh.dispose();
    this.renderer.dispose();

    // Dispose textures
    if (this.material.uniforms.uAtlas.value) {
      this.material.uniforms.uAtlas.value.dispose();
    }
    if (this.material.uniforms.uBlurryAtlas.value) {
      this.material.uniforms.uBlurryAtlas.value.dispose();
    }
  }
}
