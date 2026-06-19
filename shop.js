let cars = [];
let currentcarindex = 0;
let ownedcars = [];

const carcolors = [0xcc2233, 0x2233cc, 0x33cc33, 0xcccc22, 0xcc22cc, 0x22cccc, 0xff6633, 0x66ff33];
const carnames = ['ferrari', 'lamborghini', 'porsche', 'aston', 'mclaren', 'bugatti', 'koenigsegg', 'pagani'];
const carprices = [0, 500, 800, 1200, 2000, 3500, 5000, 8000];

export function loadcars() {
  cars = carcolors.map((col, i) => ({
    id: i,
    name: carnames[i],
    color: col,
    price: carprices[i],
    owned: i === 0
  }));
  ownedcars = cars.filter(c => c.owned).map(c => c.id);
  const saved = localStorage.getItem('ownedcars');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      ownedcars = parsed;
      cars.forEach(c => c.owned = ownedcars.includes(c.id));
    } catch(e) {}
  }
  const cur = localStorage.getItem('currentcar');
  if (cur) {
    const idx = parseInt(cur);
    if (!isNaN(idx) && idx >= 0 && idx < cars.length && cars[idx].owned) currentcarindex = idx;
  }
}

export function getcurrentcar() {
  return cars[currentcarindex];
}

export function buycar(id) {
  const car = cars.find(c => c.id === id);
  if (!car || car.owned) return false;
  const coins = parseInt(localStorage.getItem('coins') || '0');
  if (coins < car.price) return false;
  localStorage.setItem('coins', String(coins - car.price));
  car.owned = true;
  ownedcars.push(id);
  localStorage.setItem('ownedcars', JSON.stringify(ownedcars));
  return true;
}

export function selectcar(id) {
  const car = cars.find(c => c.id === id);
  if (!car || !car.owned) return false;
  currentcarindex = cars.indexOf(car);
  localStorage.setItem('currentcar', String(currentcarindex));
  return true;
}
