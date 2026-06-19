import * as three from 'three';
import { createworld, getcolliders, getcoins, getgates, resetworld } from './world.js';
import { createcar, updatecarphysics, resetcar, getcar, setcarcolor as setcarcol } from './car.js';
import { updatehud, updateminimap, showflash, updatemission } from './ui.js';
import { playsound } from './audio.js';
import { getinput } from './input.js';
import { getcurrentcar } from './shop.js';

let scene, camera;
let carstate = { group: null, pos: new three.Vector3(), yaw: 0, speed: 0 };
let gamestate = 'start';
let score = 0, coins = 0, gatespassed = 0, damage = 0, boost = 100, distance = 0;
let totaltime = 0;
let activegate = 0;
let lastcollision = 0;
let colliders = [], coinslist = [], gateslist = [];

export function initgame(s, c) {
  scene = s;
  camera = c;
  createworld(scene);
  carstate = createcar(scene);
  resetcar(carstate);
  colliders = getcolliders();
  coinslist = getcoins();
  gateslist = getgates();
  activegate = 0;
  resetworld();
}

export function startgame() {
  gamestate = 'playing';
  score = 0;
  coins = 0;
  gatespassed = 0;
  damage = 0;
  boost = 100;
  distance = 0;
  totaltime = 0;
  lastcollision = 0;
  resetcar(carstate);
  resetworld();
  coinslist.forEach((c, i) => { c.active = true; c.mesh.visible = true; });
  gateslist.forEach((g, i) => { g.passed = false; setgateactive(i, i === 0); });
  activegate = 0;
  document.getElementById('hud').classList.add('playing');
  document.getElementById('minimap').classList.add('playing');
  document.getElementById('hamburger').classList.add('playing');
  document.getElementById('start').style.display = 'none';
  document.getElementById('gameover').style.display = 'none';
}

export function updategame(dt) {
  totaltime += dt;
  const input = getinput();
  const car = carstate;
  updatecarphysics(car, input, dt);
  handleboundaries(car);
  handlecollisions(car, dt);
  updatecollectibles(car, dt);
  updategates(car, dt);
  updatecamera(car, dt);
  updatehud({ score, coins, speed: Math.abs(car.speed) * 3.6, damage, boost });
  updateminimap(car, coinslist, gateslist, activegate, colliders);
  updateaudio(input);
}

export function stategame() { return gamestate; }

export function getcarstate() { return carstate; }

export function setcarcolor(color) {
  setcarcol(carstate, color);
}

function handleboundaries(car) {
  const half = 1000;
  let hit = false;
  if (car.pos.x > half - 8) { car.pos.x = half - 8; hit = true; }
  if (car.pos.x < -half + 8) { car.pos.x = -half + 8; hit = true; }
  if (car.pos.z > half - 8) { car.pos.z = half - 8; hit = true; }
  if (car.pos.z < -half + 8) { car.pos.z = -half + 8; hit = true; }
  if (hit) { car.speed *= -0.3; adddamage(8); }
}

function handlecollisions(car, dt) {
  const now = performance.now();
  for (let i = 0; i < colliders.length; i++) {
    const c = colliders[i];
    const dx = car.pos.x - c.x;
    const dz = car.pos.z - c.z;
    const dist = Math.hypot(dx, dz);
    const mind = c.r + 2.5;
    if (dist < mind) {
      const nx = dist > 0.001 ? dx / dist : Math.sin(car.yaw);
      const nz = dist > 0.001 ? dz / dist : Math.cos(car.yaw);
      const push = mind - dist + 0.06;
      car.pos.x += nx * push;
      car.pos.z += nz * push;
      const impact = Math.abs(car.speed);
      car.speed *= c.type === 'building' ? -0.15 : -0.25;
      if (now - lastcollision > 300) {
        lastcollision = now;
        adddamage(c.damage + Math.min(15, impact * 0.15));
        score = Math.max(0, score - c.damage * 5);
        playsound('crash');
      }
    }
  }
}

function adddamage(amount) {
  damage = Math.min(100, damage + amount);
  showflash('hit');
  if (damage >= 100 && gamestate === 'playing') endgame(true);
}

function updatecollectibles(car, dt) {
  for (let i = 0; i < coinslist.length; i++) {
    const c = coinslist[i];
    c.mesh.rotation.z += dt * 2.6;
    c.mesh.rotation.y += dt * 2.0;
    c.mesh.position.y = 2.6 + Math.sin(performance.now() * 0.002 + i) * 0.3;
    if (!c.active) continue;
    const dx = car.pos.x - c.mesh.position.x;
    const dz = car.pos.z - c.mesh.position.z;
    if (dx * dx + dz * dz < 20) {
      c.active = false;
      c.mesh.visible = false;
      coins++;
      score += 160;
      boost = Math.min(100, boost + 10);
      showflash('coin');
      playsound('coin');
      setTimeout(() => {
        if (!c.mesh) return;
        const p = getrandompos(performance.now() * 0.01 + i * 123);
        c.mesh.position.set(p.x, 2.6, p.z);
        c.mesh.visible = true;
        c.active = true;
      }, 2200);
    }
  }
}

function updategates(car, dt) {
  gateslist.forEach((g, i) => {
    g.group.children.forEach(mesh => {
      if (i === activegate && mesh.type === 'Mesh' && mesh.material && mesh.material.emissive) {
        const s = 1 + Math.sin(performance.now() * 0.005) * 0.03;
        mesh.scale.setScalar(s);
      }
    });
  });
  const g = gateslist[activegate];
  const dx = car.pos.x - g.x;
  const dz = car.pos.z - g.z;
  if (Math.hypot(dx, dz) < 9) {
    gatespassed++;
    score += 700 + Math.round(Math.max(0, car.speed) * 5);
    playsound('gate');
    showflash('coin');
    setgateactive(activegate, false);
    activegate = (activegate + 1) % gateslist.length;
    setgateactive(activegate, true);
    updatemission(`gate cleared! next gate ${Math.round(Math.hypot(car.pos.x - gateslist[activegate].x, car.pos.z - gateslist[activegate].z))} m away`);
  }
}

function setgateactive(index, active) {
  const c = active ? 0xfacc15 : 0x4a5a6a;
  const e = active ? 0x6b4f00 : 0x1a2230;
  const ei = active ? 0.4 : 0.1;
  gateslist[index].group.children.forEach(mesh => {
    if (mesh.type === 'Mesh') {
      mesh.material = new three.MeshStandardMaterial({ color: c, emissive: e, emissiveIntensity: ei });
    }
  });
}

function updatecamera(car, dt) {
  const behind = new three.Vector3(
    -Math.sin(car.yaw) * 14,
    7.5 + Math.min(4.5, Math.abs(car.speed) * 0.04),
    -Math.cos(car.yaw) * 14
  );
  const desired = car.pos.clone().add(behind);
  const lerp = 1 - Math.pow(0.002, dt);
  camera.position.lerp(desired, lerp);
  const lookat = car.pos.clone().add(new three.Vector3(0, 2.8, 0));
  camera.lookAt(lookat);
}

function updateaudio(input) {
  const speed = Math.abs(carstate.speed);
  const throttle = input.throttle;
  const boostactive = input.boost;
  
}

function endgame(crashed) {
  gamestate = 'gameover';
  document.getElementById('hud').classList.remove('playing');
  document.getElementById('minimap').classList.remove('playing');
  document.getElementById('hamburger').classList.remove('playing');
  document.getElementById('gameover').style.display = 'flex';
  document.getElementById('gotitle').textContent = crashed ? 'car totaled' : 'run complete';
  document.getElementById('gotext').textContent = `distance ${Math.round(distance)} m • coins ${coins} • gates ${gatespassed}`;
  document.getElementById('finalscore').textContent = Math.round(score).toLocaleString();
  playsound('crash'); 
}

function getrandompos(seed) {
  const half = 1000;
  const margin = 70;
  let x = (Math.sin(seed * 2.13) * 0.5 + 0.5) * (half - margin) * 2 - (half - margin);
  let z = (Math.sin(seed * 3.77) * 0.5 + 0.5) * (half - margin) * 2 - (half - margin);
  if (Math.hypot(x, z) < 80) { x += x < 0 ? -130 : 130; z += z < 0 ? -130 : 130; }
  return { x, z };
    }
