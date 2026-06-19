export function setupui(handlers) {
  document.getElementById('startbtn').addEventListener('click', handlers.onstart);
  document.getElementById('restartbtn').addEventListener('click', handlers.onrestart);
  document.getElementById('hamburger').addEventListener('click', () => togglemainmenu());
  document.addEventListener('keydown', e => { if (e.code === 'Escape' && document.getElementById('menuoverlay').classList.contains('open')) togglemainmenu(); });
  window.handlers = handlers;
}

export function togglemainmenu(open) {
  const overlay = document.getElementById('menuoverlay');
  const hamburger = document.getElementById('hamburger');
  const isopen = overlay.classList.contains('open');
  if (open === undefined) open = !isopen;
  if (open) {
    overlay.classList.add('open');
    hamburger.classList.add('open');
    renderMainMenu();
  } else {
    overlay.classList.remove('open');
    hamburger.classList.remove('open');
  }
}

function renderMainMenu() {
  const body = document.getElementById('menubody');
  document.getElementById('menutitle').textContent = 'menu';
  document.getElementById('menusub').textContent = '';
  body.innerHTML = `
    <div class="menuitem" data-action="resume">
      <span class="icon">▶</span>
      <span class="label">resume</span>
      <span class="arrow">→</span>
    </div>
    <div class="menuitem" data-action="settings">
      <span class="icon">⚙</span>
      <span class="label">settings</span>
      <span class="arrow">→</span>
    </div>
    <div class="menuitem" data-action="mainmenu">
      <span class="icon">🏠</span>
      <span class="label">main menu</span>
      <span class="arrow">→</span>
    </div>
  `;
  body.querySelectorAll('.menuitem').forEach(el => {
    el.addEventListener('click', () => {
      const action = el.dataset.action;
      if (action === 'resume') togglemainmenu(false);
      if (action === 'settings') renderSettings();
      if (action === 'mainmenu') window.handlers.onmainmenu();
    });
  });
}

function renderSettings() {
  const body = document.getElementById('menubody');
  document.getElementById('menutitle').textContent = 'settings';
  document.getElementById('menusub').textContent = 'adjust your experience';
  body.innerHTML = `
    <div class="settingsrow">
      <label>sound effects</label>
      <input type="range" min="0" max="100" value="60" id="soundvol" />
      <span class="val" id="soundval">60%</span>
    </div>
    <div class="settingsrow">
      <label>music</label>
      <input type="range" min="0" max="100" value="30" id="musicvol" />
      <span class="val" id="musicval">30%</span>
    </div>
    <div class="settingsrow" style="border-bottom:none;margin-top:8px;">
      <label>camera sensitivity</label>
      <input type="range" min="50" max="200" value="100" id="camsens" />
      <span class="val" id="camsensval">100%</span>
    </div>
    <div style="margin-top:16px;">
      <button class="btnsecondary" id="settingsback">← back</button>
    </div>
  `;
  document.getElementById('soundvol').addEventListener('input', e => {
    document.getElementById('soundval').textContent = e.target.value + '%';
  });
  document.getElementById('musicvol').addEventListener('input', e => {
    document.getElementById('musicval').textContent = e.target.value + '%';
  });
  document.getElementById('camsens').addEventListener('input', e => {
    document.getElementById('camsensval').textContent = e.target.value + '%';
  });
  document.getElementById('settingsback').addEventListener('click', renderMainMenu);
}

export function showmainmenu() {
  document.getElementById('start').style.display = 'flex';
  document.getElementById('gameover').style.display = 'none';
  document.getElementById('hud').classList.remove('playing');
  document.getElementById('minimap').classList.remove('playing');
  document.getElementById('hamburger').classList.remove('playing');
  // show main menu with shop, customize, socials
}

export function updateshopui() {
  
}

export function updatehud(data) {
  document.getElementById('score').textContent = Math.round(data.score).toLocaleString();
  document.getElementById('speed').textContent = Math.round(data.speed) + ' km/h';
  document.getElementById('coins').textContent = data.coins;
  document.getElementById('damagetxt').textContent = Math.round(data.damage) + '%';
  document.getElementById('damagefill').style.width = Math.max(0, 100 - data.damage) + '%';
  document.getElementById('boosttxt').textContent = Math.round(data.boost) + '%';
  document.getElementById('boostfill').style.width = data.boost + '%';
}

export function updateminimap(car, coins, gates, activegate, colliders) {
  const canvas = document.getElementById('minimap');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(6,10,24,0.85)';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w/2, h/2, w/2 - 6, 0, Math.PI * 2);
  ctx.stroke();

  const scale = 0.12;
  function mp(x, z) {
    const dx = (x - car.pos.x) * scale;
    const dz = (z - car.pos.z) * scale;
    const cos = Math.cos(-car.yaw);
    const sin = Math.sin(-car.yaw);
    return { x: w/2 + dx * cos - dz * sin, y: h/2 + dx * sin + dz * cos };
  }

  ctx.fillStyle = '#facc15';
  coins.forEach((c, i) => {
    if (!c.active || i % 2) return;
    const p = mp(c.mesh.position.x, c.mesh.position.z);
    if (p.x > 4 && p.x < w-4 && p.y > 4 && p.y < h-4) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const g = gates[activegate];
  const gp = mp(g.x, g.z);
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(gp.x, gp.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(34,197,94,0.2)';
  ctx.beginPath();
  ctx.arc(gp.x, gp.y, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for (let i = 0; i < colliders.length; i += 3) {
    const c = colliders[i];
    const p = mp(c.x, c.z);
    if (p.x > 4 && p.x < w-4 && p.y > 4 && p.y < h-4) {
      ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
    }
  }

  ctx.save();
  ctx.translate(w/2, h/2);
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = 'rgba(56,189,248,0.4)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(7, 9);
  ctx.lineTo(0, 5.5);
  ctx.lineTo(-7, 9);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function showflash(type) {
  const el = document.getElementById('flash');
  el.className = 'flash ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.className = 'flash', 130);
}

export function updatemission(text) {
  
}
