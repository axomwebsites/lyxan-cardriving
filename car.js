import * as three from 'three';

export function createcar(scene) {
  const car = new three.Group();
  scene.add(car);

  const red = new three.MeshStandardMaterial({ color: 0xcc2233, roughness: 0.3, metalness: 0.25 });
  const dark = new three.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.5, metalness: 0.1 });
  const glass = new three.MeshStandardMaterial({ color: 0x88ccff, roughness: 0.1, metalness: 0.05, transparent: true, opacity: 0.7 });
  const lightmat = new three.MeshBasicMaterial({ color: 0xffffee });
  const tailmat = new three.MeshBasicMaterial({ color: 0xff2222 });
  const chrome = new three.MeshStandardMaterial({ color: 0xccccdd, roughness: 0.15, metalness: 0.9 });
  const carbon = new three.MeshStandardMaterial({ color: 0x222233, roughness: 0.4, metalness: 0.3 });
  const black = new three.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.7 });

  const body = new three.Mesh(new three.BoxGeometry(4.6, 1.2, 7.6), red);
  body.position.y = 1.5;
  body.castShadow = true;
  body.receiveShadow = true;
  car.add(body);

  const shape = new three.Shape();
  shape.moveTo(-1.9, -1.6);
  shape.quadraticCurveTo(-2.0, -0.8, -1.7, 0);
  shape.quadraticCurveTo(-1.8, 0.8, -1.9, 1.6);
  shape.lineTo(0, 2.0);
  shape.lineTo(1.9, 1.6);
  shape.quadraticCurveTo(1.8, 0.8, 1.7, 0);
  shape.quadraticCurveTo(2.0, -0.8, 1.9, -1.6);
  shape.closePath();
  const ext = new three.ExtrudeGeometry(shape, { depth: 2.2, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.15, bevelSegments: 6 });
  const nose = new three.Mesh(ext, red);
  nose.position.set(-1.1, 1.5, 3.2);
  nose.castShadow = true;
  car.add(nose);

  const cabin = new three.Mesh(new three.BoxGeometry(3.8, 1.3, 3.2), glass);
  cabin.position.set(0, 2.55, -0.4);
  cabin.castShadow = true;
  car.add(cabin);

  const pillar = new three.Mesh(new three.BoxGeometry(0.2, 0.8, 2.8), dark);
  pillar.position.set(1.8, 2.5, -0.4);
  car.add(pillar);
  const pillar2 = pillar.clone();
  pillar2.position.x = -1.8;
  car.add(pillar2);

  const hood = new three.Mesh(new three.BoxGeometry(3.2, 0.25, 1.8), carbon);
  hood.position.set(0, 2.1, 2.4);
  car.add(hood);

  const sbase = new three.Mesh(new three.BoxGeometry(4.0, 0.15, 0.6), carbon);
  sbase.position.set(0, 2.3, -3.9);
  car.add(sbase);
  const sw = new three.Mesh(new three.BoxGeometry(4.4, 0.5, 0.8), carbon);
  sw.position.set(0, 2.7, -3.9);
  car.add(sw);
  const se1 = new three.Mesh(new three.BoxGeometry(0.3, 0.6, 0.3), carbon);
  se1.position.set(-2.2, 2.5, -3.9);
  car.add(se1);
  const se2 = se1.clone();
  se2.position.x = 2.2;
  car.add(se2);

  const wheelgeo = new three.CylinderGeometry(0.7, 0.7, 0.55, 18);
  const rimgeo = new three.CylinderGeometry(0.45, 0.45, 0.56, 8);
  const spokemat = new three.MeshStandardMaterial({ color: 0xccccdd, roughness: 0.2, metalness: 0.8 });

  function addwheel(x, z) {
    const g = new three.Group();
    const tire = new three.Mesh(wheelgeo, dark);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    g.add(tire);
    const rim = new three.Mesh(rimgeo, spokemat);
    rim.rotation.z = Math.PI / 2;
    g.add(rim);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const spoke = new three.Mesh(new three.BoxGeometry(0.08, 0.56, 0.4), spokemat);
      spoke.position.set(Math.sin(a) * 0.32, 0, Math.cos(a) * 0.32);
      spoke.rotation.x = a;
      g.add(spoke);
    }
    g.position.set(x, 0.72, z);
    car.add(g);
    return g;
  }
  const fl = addwheel(-2.4, 2.4);
  const fr = addwheel(2.4, 2.4);
  const bl = addwheel(-2.4, -2.5);
  const br = addwheel(2.4, -2.5);
  const wheels = [fl, fr, bl, br];

  const h1 = new three.Mesh(new three.BoxGeometry(1.0, 0.25, 0.1), lightmat);
  h1.position.set(-1.1, 1.45, 3.9);
  car.add(h1);
  const h2 = h1.clone();
  h2.position.x = 1.1;
  car.add(h2);
  const h3 = new three.Mesh(new three.BoxGeometry(0.6, 0.2, 0.1), lightmat);
  h3.position.set(-1.6, 1.35, 3.9);
  car.add(h3);
  const h4 = h3.clone();
  h4.position.x = 1.6;
  car.add(h4);

  const t1 = new three.Mesh(new three.BoxGeometry(0.9, 0.25, 0.1), tailmat);
  t1.position.set(-1.1, 1.4, -3.9);
  car.add(t1);
  const t2 = t1.clone();
  t2.position.x = 1.1;
  car.add(t2);

  const f1 = new three.Mesh(new three.BoxGeometry(0.8, 0.5, 2.0), red);
  f1.position.set(-2.6, 1.3, 2.2);
  car.add(f1);
  const f2 = f1.clone();
  f2.position.x = 2.6;
  car.add(f2);
  const f3 = new three.Mesh(new three.BoxGeometry(0.8, 0.5, 2.0), red);
  f3.position.set(-2.6, 1.3, -2.3);
  car.add(f3);
  const f4 = f3.clone();
  f4.position.x = 2.6;
  car.add(f4);

  const m1 = new three.Mesh(new three.BoxGeometry(0.15, 0.4, 0.4), black);
  m1.position.set(-2.6, 2.1, 1.2);
  car.add(m1);
  const m2 = m1.clone();
  m2.position.x = 2.6;
  car.add(m2);

  const state = {
    group: car,
    pos: new three.Vector3(0, 0, 20),
    yaw: 0,
    speed: 0,
    roll: 0,
    pitch: 0,
    wheelrot: 0,
    steerangle: 0,
    bodyy: 0,
    wheels: wheels,
    body: body,
    nose: nose,
    cabin: cabin
  };
  return state;
}

export function resetcar(state) {
  state.pos.set(0, 0, 20);
  state.yaw = 0;
  state.speed = 0;
  state.roll = 0;
  state.pitch = 0;
  state.wheelrot = 0;
  state.steerangle = 0;
  state.bodyy = 0;
  state.group.position.copy(state.pos);
  state.group.rotation.set(0, state.yaw, 0);
}

export function updatecarphysics(state, input, dt) {
  const maxspd = input.boost ? 125 : 88;
  const revmax = -32;
  const accel = input.boost ? 65 : 40;
  const brakep = 55;
  const drag = 0.988;
  const rollf = 3.0;

  let th = input.throttle;
  if (th > 0) state.speed += th * accel * dt;
  else if (th < 0) {
    if (state.speed > 3) state.speed += th * brakep * dt;
    else state.speed += th * 26 * dt;
  } else {
    const f = rollf * dt * Math.sign(state.speed);
    if (Math.abs(state.speed) <= Math.abs(f)) state.speed = 0;
    else state.speed -= f;
  }
  state.speed *= Math.pow(drag, dt * 60);
  state.speed = Math.max(revmax, Math.min(maxspd, state.speed));

  if (input.boost) state.boost = Math.max(0, state.boost - 30 * dt);
  else state.boost = Math.min(100, state.boost + 11 * dt);

  const spdf = Math.min(1, Math.abs(state.speed) / 50);
  const turnr = (0.75 + spdf * 1.4) * input.steer * dt * Math.sign(state.speed || 1);
  if (Math.abs(state.speed) > 0.8) state.yaw -= turnr;

  state.steerangle += (input.steer * 0.35 - state.steerangle) * Math.min(1, dt * 12);

  const forward = new three.Vector3(Math.sin(state.yaw), 0, Math.cos(state.yaw));
  const move = forward.clone().multiplyScalar(state.speed * dt);
  state.pos.add(move);

  const lataccel = -input.steer * Math.abs(state.speed) * 0.012;
  state.roll += (lataccel - state.roll) * Math.min(1, dt * 8);
  state.roll = Math.max(-0.12, Math.min(0.12, state.roll));

  const pitchaccel = -th * 0.02 + (state.speed > 0 ? -state.speed * 0.0003 : 0);
  state.pitch += (pitchaccel - state.pitch) * Math.min(1, dt * 6);
  state.pitch = Math.max(-0.06, Math.min(0.06, state.pitch));

  const sus = Math.abs(state.speed) * 0.00008 + (input.boost ? 0.015 : 0);
  state.bodyy += (sus - state.bodyy) * Math.min(1, dt * 5);

  state.group.position.copy(state.pos);
  state.group.rotation.y = state.yaw;
  state.group.rotation.z = state.roll;
  state.group.rotation.x = state.pitch;

  state.wheelrot += state.speed * dt * 2.4;
  const sustravel = state.bodyy * 0.4;
  state.wheels.forEach((w, i) => {
    const isfront = i < 2;
    const steer = isfront ? state.steerangle : 0;
    w.rotation.y = steer;
    w.rotation.x = state.wheelrot;
    const basey = 0.72 + (isfront ? sustravel * 0.6 : sustravel * 0.8);
    w.position.y = basey + (isfront ? -sustravel * 0.3 : sustravel * 0.2);
    const side = i % 2 === 0 ? -1 : 1;
    const rolloff = state.roll * 0.8 * side;
    w.position.y += rolloff;
  });
}

export function setcarcolor(state, color) {
  const mat = new three.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.25 });
  state.body.material = mat;
  state.nose.material = mat;
  state.group.children.forEach(child => {
    if (child.type === 'Mesh' && child.material && child.material.color && child.material.color.getHex() === 0xcc2233) {
      child.material = mat;
    }
  });
}
