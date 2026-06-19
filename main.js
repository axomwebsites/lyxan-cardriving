import * as three from 'three';
import { initgame, startgame, updategame, stategame, getcarstate, setcarcolor } from './game.js';
import { setupui, togglemainmenu, showmainmenu, updateshopui, updatesocials } from './ui.js';
import { initaudio } from './audio.js';
import { setupinput } from './input.js';
import { loadcars, getcurrentcar, buycar } from './shop.js';

let renderer, scene, camera, clock;

function init() {
  const container = document.getElementById('game');
  scene = new three.Scene();
  camera = new three.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 2200);
  renderer = new three.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = three.PCFSoftShadowMap;
  renderer.toneMapping = three.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.domElement.className = 'webgl';
  container.appendChild(renderer.domElement);
  clock = new three.Clock();

  initgame(scene, camera);
  setupui({
    onstart: () => { startgame(); },
    onrestart: () => { startgame(); },
    onmainmenu: () => { showmainmenu(); },
    onresume: () => { togglemainmenu(false); },
    onsettings: () => {},
    onshop: () => { updateshopui(); },
    oncustomize: () => {}
  });
  setupinput();
  initaudio();
  loadcars();

  window.addEventListener('resize', onresize);
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, clock.getDelta());
  if (stategame() === 'playing') {
    updategame(dt);
  } else {
    const car = getcarstate();
    if (car && car.group) {
      car.group.rotation.y += dt * 0.3;
    }
  }
  renderer.render(scene, camera);
}

function onresize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
