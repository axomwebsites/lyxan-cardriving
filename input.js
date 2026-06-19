const keys = {};
const mobile = { steer: 0, throttle: 0, gas: false, brake: false, boost: false, joyactive: false, joypointer: null };

export function setupinput() {
  document.addEventListener('keydown', e => { keys[e.code] = true; if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault(); });
  document.addEventListener('keyup', e => keys[e.code] = false);

  const joy = document.getElementById('joystick');
  const stick = document.getElementById('stick');
  const gasbtn = document.getElementById('gasbtn');
  const brakebtn = document.getElementById('brakebtn');
  const boostbtn = document.getElementById('boostbtn');

  joy.addEventListener('pointerdown', e => {
    mobile.joyactive = true;
    mobile.joypointer = e.pointerId;
    joy.setPointerCapture(e.pointerId);
    updatejoy(e);
  });
  joy.addEventListener('pointermove', e => { if (mobile.joyactive && e.pointerId === mobile.joypointer) updatejoy(e); });

  function endjoy(e) {
    if (e.pointerId === mobile.joypointer) {
      mobile.joyactive = false;
      mobile.joypointer = null;
      mobile.steer = 0;
      mobile.throttle = 0;
      stick.style.transform = 'translate(0px,0px)';
    }
  }
  joy.addEventListener('pointerup', endjoy);
  joy.addEventListener('pointercancel', endjoy);

  function updatejoy(e) {
    const rect = joy.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const max = rect.width * 0.32;
    const len = Math.hypot(dx, dy);
    if (len > max) { dx = dx / len * max; dy = dy / len * max; }
    stick.style.transform = `translate(${dx}px, ${dy}px)`;
    mobile.steer = Math.max(-1, Math.min(1, dx / max));
    mobile.throttle = Math.max(-1, Math.min(1, -dy / max));
  }

  function bindbtn(el, prop) {
    const on = e => { e.preventDefault(); mobile[prop] = true; el.classList.add('active'); };
    const off = e => { e.preventDefault(); mobile[prop] = false; el.classList.remove('active'); };
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off);
    el.addEventListener('pointercancel', off);
    el.addEventListener('pointerleave', off);
  }
  bindbtn(gasbtn, 'gas');
  bindbtn(brakebtn, 'brake');
  bindbtn(boostbtn, 'boost');
}

export function getinput() {
  const f = keys.KeyW || keys.ArrowUp;
  const b = keys.KeyS || keys.ArrowDown;
  const l = keys.KeyA || keys.ArrowLeft;
  const r = keys.KeyD || keys.ArrowRight;

  let th = 0;
  if (f) th += 1;
  if (b) th -= 0.7;
  th += mobile.gas ? 1 : 0;
  th -= mobile.brake ? 0.8 : 0;
  if (Math.abs(mobile.throttle) > 0.08) th += mobile.throttle > 0 ? mobile.throttle : mobile.throttle * 0.75;

  let st = 0;
  if (l) st -= 1;
  if (r) st += 1;
  st += mobile.steer;

  const useboost = (keys.ShiftLeft || keys.ShiftRight || keys.Space || mobile.boost);

  return { throttle: Math.max(-1, Math.min(1, th)), steer: Math.max(-1, Math.min(1, st)), boost: useboost };
}
