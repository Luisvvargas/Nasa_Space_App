import * as THREE from "three";
import { Label, PointOfInterest } from "./label";
import { createPath } from "./path"; // Import eccentric path
import { loadTexture } from "./textures";

export interface Body {
  name: string;
  radius: number;
  distance: number;
  period: number;
  daylength: number;
  textures: TexturePaths;
  type: string;
  tilt: number;
  orbits?: string;
  labels?: PointOfInterest[];
  traversable: boolean;
  offset?: number;
}

interface TexturePaths {
  map: string;
  bump?: string;
  atmosphere?: string;
  atmosphereAlpha?: string;
  specular?: string;
}

const timeFactor = 8 * Math.PI * 2; // 1s real-time => 8h simulation time

const normaliseRadius = (radius: number): number => {
  return Math.sqrt(radius) / 500;
};

const normaliseDistance = (distance: number): number => {
  return Math.pow(distance, 0.4);
};

const degreesToRadians = (degrees: number): number => {
  return (Math.PI * degrees) / 180;
};

export class PlanetaryObject {
  radius: number;
  distance: number;
  period: number;
  daylength: number;
  orbits?: string;
  type: string;
  tilt: number;
  mesh: THREE.Mesh;
  path?: THREE.Line;
  rng: number;
  map: THREE.Texture;
  bumpMap?: THREE.Texture;
  specularMap?: THREE.Texture;
  category: string;
  description: string;
  namesake: string;
  moons: number;
  labels: Label;
  hitbox: THREE.Mesh;

  constructor(body: Body) {
    const { radius, distance, period, daylength, orbits, type, tilt, category, description, namesake, moons, realRadius, realDistance } = body;

    this.radius = normaliseRadius(radius);
    this.distance = normaliseDistance(distance);
    this.period = period;
    this.daylength = daylength;
    this.orbits = orbits;
    this.type = type;
    this.category = category;
    this.description = description;
    this.namesake = namesake;
    this.moons = moons;
    this.realRadius = realRadius;
    this.realDistance = realDistance;
    this.tilt = degreesToRadians(tilt);
    this.rng = body.offset ?? Math.random() * 2 * Math.PI;

    this.loadTextures(body.textures);

    const mesh = this.createMesh();
    if (!mesh) {
      throw new Error(`Failed to create mesh for ${body.name}`);
    }
    this.mesh = mesh;

    this.hitbox = this.createHitbox();

    if (this.type === "comet" || this.type === "asteroid") {
      this.path = createPath(this.distance);
    } else if (this.orbits) {
      this.path = createPath(this.distance);
    }

    this.initLabels(body.labels);
  }

  private createHitbox = () => {
    const hitboxGeometry = new THREE.SphereGeometry(this.radius * 1.5, 32, 32);
    const hitboxMaterial = new THREE.MeshBasicMaterial({ visible: false });
    const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
    this.mesh.add(hitbox);
    return hitbox;
  };

  private initLabels = (labels?: PointOfInterest[]) => {
    this.labels = new Label(this.mesh, this.radius);

    if (labels) {
      labels.forEach((poi) => {
        this.labels.createPOILabel(poi);
      });
    }
  };

  private loadTextures(textures: TexturePaths) {
    this.map = loadTexture(textures.map);
    if (textures.bump) {
      this.bumpMap = loadTexture(textures.bump);
    }
    if (textures.specular) {
      this.specularMap = loadTexture(textures.specular);
    }
  }

  private createMesh = () => {
    // Ensure the map texture exists
    if (!this.map) {
      console.error(`Missing texture map for ${this.type}`);
      return null;
    }
  
    const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
    let material;
    if (this.type === "star") {
      material = new THREE.MeshBasicMaterial({
        map: this.map,
        lightMapIntensity: 2,
        toneMapped: false,
        color: new THREE.Color(2.5, 2.5, 2.5),
      });
    } else {
      material = new THREE.MeshPhongMaterial({
        map: this.map,
        shininess: 5,
        toneMapped: true,
      });
  
      if (this.bumpMap) {
        material.bumpMap = this.bumpMap;
        material.bumpScale = this.radius / 50;
      }
  
      if (this.specularMap) {
        material.specularMap = this.specularMap;
      }
    }
  
    const sphere = new THREE.Mesh(geometry, material);
    sphere.rotation.x = this.tilt;
    sphere.castShadow = true;
    sphere.receiveShadow = true;
  
    if (this.type === "comet") {
      // Check if the sphere mesh is correctly created
      if (!sphere) {
        console.error('Failed to create comet mesh.');
        return null;
      }
  
      const tailGeometry = new THREE.ConeGeometry(this.radius * 0.5, this.radius * 3, 32);
      const tailMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.7 });
      const tailMesh = new THREE.Mesh(tailGeometry, tailMaterial);
      tailMesh.position.set(0, 0, -this.radius * 2);
      sphere.add(tailMesh);  // Attach to comet mesh
    }
  
    return sphere;
  };
  

  private getRotation = (elapsedTime: number) => {
    return this.daylength ? (elapsedTime * timeFactor) / this.daylength : 0;
  };

  private getOrbitRotation = (elapsedTime: number) => {
    return this.daylength ? (elapsedTime * timeFactor) / (this.period * 24) : 0;
  };

  tick = (elapsedTime: number) => {
    const rotation = this.getRotation(elapsedTime);
    const orbitRotation = this.getOrbitRotation(elapsedTime);
    const orbit = orbitRotation + this.rng;

    this.mesh.position.x = Math.sin(orbit) * this.distance;
    this.mesh.position.z = Math.cos(orbit) * this.distance;

    if (this.type === "ring") {
      this.mesh.rotation.z = rotation;
    } else {
      this.mesh.rotation.y = rotation;
    }
  };

  getMinDistance = (): number => {
    return this.radius * 3.5;
  };
}
