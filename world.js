import * as three from 'three';

let colliders = [];
let coins = [];
let gates = [];
let coinGroup, gateGroup;

export function createworld(scene) {
  const half = 1000;
  const groundmat = new three.MeshLambertMaterial({ color: 0x1a2a1a });
  const ground = new three.Mesh(new three.PlaneGeometry(2000, 2000, 50, 50), groundmat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const roadmat = new three.MeshLambertMaterial({ color: 0x2a2e3a });
  const lanemat = new three.MeshBasicMaterial({ color: 0x4a4e5a });
  const linemat = new three.MeshBasicMaterial({ color: 0xf0f0e0 });

  function addroad(x, z, w, h) {
    const r = new three.Mesh(new three.PlaneGeometry(w, h), roadmat);
    r.rotation.x = -Math.PI / 2;
    r.position.set(x, 0.025, z);
    r.receiveShadow = true;
    scene.add(r);
    const lanes = Math.floor((h > w ? h : w) / 50);
    for (let i = -lanes / 2; i < lanes / 2; i++) {
      const d = new three.Mesh(new three.PlaneGeometry(h > w ? 2.0 : 14, h > w ? 14 : 2.0), lanemat);
      d.rotation.x = -Math.PI / 2;
      d.position.set(x + (h > w ? 0 : i * 50), 0.04, z + (h > w ? i * 50 : 0));
      scene.add(d);
    }
    if (h > w) {
      for (let i = -lanes / 2; i < lanes / 2; i++) {
        const l = new three.Mesh(new three.PlaneGeometry(0.6, 8), linemat);
        l.rotation.x = -Math.PI / 2;
        l.position.set(x + (i * 50) + (i >= 0 ? -25 : 25), 0.045, z);
        scene.add(l);
      }
    } else {
      for (let i = -lanes / 2; i < lanes / 2; i++) {
        const l = new three.Mesh(new three.PlaneGeometry(8, 0.6), linemat);
        l.rotation.x = -Math.PI / 2;
        l.position.set(x, 0.045, z + (i * 50) + (i >= 0 ? -25 : 25));
        scene.add(l);
      }
    }
  }
  addroad(0, 0, 36, 2000);
  addroad(0, 0, 2000, 36);
  addroad(-380, 220, 28, 680);
  addroad(360, -220, 28, 700);
  addroad(-140, 380, 780, 28);
  addroad(220, -420, 840, 28);

  createtrees(scene);
  createbuildings(scene);
  createrocks(scene);
  createcoins(scene);
  creategates(scene);

  const bmat = new three.MeshLambertMaterial({ color: 0x1a2233 });
  const wallgeo = new three.BoxGeometry(2000, 20, 6);
  const w1 = new three.Mesh(wallgeo, bmat);
  w1.position.set(0, 10, half);
  const w2 = w1.clone();
  w2.position.set(0, 10, -half);
  const w3 = new three.Mesh(new three.BoxGeometry(6, 20, 2000), bmat);
  w3.position.set(half, 10, 0);
  const w4 = w3.clone();
  w4.position.set(-half, 10, 0);
  [w1, w2, w3, w4].forEach(w => { w.castShadow = true; w.receiveShadow = true; scene.add(w); });
}

function createtrees(scene) {
  const trunkmat = new three.MeshLambertMaterial({ color: 0x4a3520 });
  const leafmat = new three.MeshLambertMaterial({ color: 0x1a4a1a });
  const trunkgeo = new three.CylinderGeometry(0.4, 0.6, 4, 6);
  const leafgeo = new three.ConeGeometry(2.4, 6, 8);
  const half = 1000;
  for (let i = 0; i < 200; i++) {
    const p = getpos(100 + i, 30);
    if (Math.abs(p.x) < 30 || Math.abs(p.z) < 30) continue;
    const trunk = new three.Mesh(trunkgeo, trunkmat);
    trunk.position.set(p.x, 2, p.z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    scene.add(trunk);
    const leaves = new three.Mesh(leafgeo, leafmat);
    leaves.position.set(p.x, 6.5, p.z);
    leaves.castShadow = true;
    scene.add(leaves);
    colliders.push({ x: p.x, z: p.z, r: 1.8, type: 'tree', damage: 6 });
  }
}

function createbuildings(scene) {
  const mats = [
    new three.MeshLambertMaterial({ color: 0x3a4a5a }),
    new three.MeshLambertMaterial({ color: 0x4a5a6a }),
    new three.MeshLambertMaterial({ color: 0x2a3a4a }),
    new three.MeshLambertMaterial({ color: 0x5a4a3a })
  ];
  const half = 1000;
  for (let i = 0; i < 45; i++) {
    const p = getpos(510 + i, 80);
    if (Math.abs(p.x) < 50 || Math.abs(p.z) < 50) continue;
    const w = rrange(900 + i, 12, 38);
    const d = rrange(1200 + i, 12, 38);
    const h = rrange(1500 + i, 16, 72);
    const mesh = new three.Mesh(new three.BoxGeometry(w, h, d), mats[i % mats.length]);
    mesh.position.set(p.x, h / 2, p.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    const roof = new three.Mesh(new three.BoxGeometry(w + 1.0, 1.2, d + 1.0),
      new three.MeshLambertMaterial({ color: 0x1a2230 }));
    roof.position.set(p.x, h + 0.6, p.z);
    roof.castShadow = true;
    scene.add(roof);
    colliders.push({ x: p.x, z: p.z, r: Math.sqrt(w * w + d * d) / 2 + 1.4, type: 'building', damage: 18 });
  }
}

function createrocks(scene) {
  const rockmat = new three.MeshLambertMaterial({ color: 0x4a4a5a });
  const half = 1000;
  for (let i = 0; i < 60; i++) {
    const p = getpos(2200 + i, 45);
    if (Math.abs(p.x) < 28 || Math.abs(p.z) < 28) continue;
    const s = rrange(2400 + i, 1.8, 4.8);
    const rock = new three.Mesh(new three.DodecahedronGeometry(s, 0), rockmat);
    rock.position.set(p.x, s * 0.5, p.z);
    rock.rotation.set(Math.sin(i) * 6.28, Math.sin(i + 1) * 6.28, Math.sin(i + 2) * 6.28);
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
    colliders.push({ x: p.x, z: p.z, r: s * 0.85, type: 'rock', damage: 12 });
  }
}

function createcoins(scene) {
  coinGroup = new three.Group();
  scene.add(coinGroup);
  const geo = new three.TorusGeometry(1.2, 0.25, 12, 20);
  const mat = new three.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xa16207,
    emissiveIntensity: 0.5,
    metalness: 0.4,
    roughness: 0.2
  });
  for (let i = 0; i < 90; i++) {
    const p = getpos(3200 + i, 40);
    const mesh = new three.Mesh(geo, mat);
    mesh.position.set(p.x, 2.6, p.z);
    mesh.rotation.y = Math.PI / 2;
    mesh.castShadow = true;
    coinGroup.add(mesh);
    coins.push({ mesh: mesh, active: true, seed: 3200 + i });
  }
}

function creategates(scene) {
  gateGroup = new three.Group();
  scene.add(gateGroup);
  const polemat = new three.MeshStandardMaterial({ color: 0xfacc15, emissive: 0x6b4f00, emissiveIntensity: 0.3 });
  const inactmat = new three.MeshStandardMaterial({ color: 0x4a5a6a, emissive: 0x1a2230, emissiveIntensity: 0.1 });
  const polegeo = new three.CylinderGeometry(0.5, 0.5, 10, 10);
  const topgeo = new three.BoxGeometry(12, 1.0, 1.0);
  const glowmat = new three.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.15 });
  const positions = [
    [0, -180], [240, -420], [560, -180], [380, 220],
    [-60, 380], [-420, 320], [-580, -160], [-220, -460],
    [160, 620], [660, 480], [-660, 580], [-600, -580]
  ];
  for (let i = 0; i < positions.length; i++) {
    const g = new three.Group();
    const left = new three.Mesh(polegeo, i === 0 ? polemat : inactmat);
    const right = new three.Mesh(polegeo, i === 0 ? polemat : inactmat);
    const top = new three.Mesh(topgeo, i === 0 ? polemat : inactmat);
    left.position.set(-6, 5, 0);
    right.position.set(6, 5, 0);
    top.position.set(0, 10, 0);
    left.castShadow = right.castShadow = top.castShadow = true;
    g.add(left, right, top);
    const glow = new three.Mesh(new three.PlaneGeometry(14, 12), glowmat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(0, 0.05, 0);
    g.add(glow);
    g.position.set(positions[i][0], 0, positions[i][1]);
    g.rotation.y = i % 2 ? Math.PI / 2 : 0;
    gateGroup.add(g);
    gates.push({ group: g, x: positions[i][0], z: positions[i][1], passed: false });
  }
}

function getpos(seed, margin) {
  const half = 1000;
  let x = (Math.sin(seed * 2.13) * 0.5 + 0.5) * (half - margin) * 2 - (half - margin);
  let z = (Math.sin(seed * 3.77) * 0.5 + 0.5) * (half - margin) * 2 - (half - margin);
  if (Math.hypot(x, z) < 80) { x += x < 0 ? -130 : 130; z += z < 0 ? -130 : 130; }
  return { x, z };
}

function rrange(seed, min, max) {
  const r = Math.sin(seed) * 0.5 + 0.5;
  return min + r * (max - min);
}

export function getcolliders() { return colliders; }
export function getcoins() { return coins; }
export function getgates() { return gates; }
export function resetworld() {
          }
