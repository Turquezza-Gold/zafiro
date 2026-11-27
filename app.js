'use strict';
/* ==========================================================
   Zafiro · Finanzas privadas
   Todo se guarda SOLO en este dispositivo (localStorage).
   No hay servidor, cuentas, login ni envío de datos.
   ========================================================== */

const KEY = 'zafiro.v1';
const APP_VERSION = '1.4.1';

/* ---------------- Utilidades ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const num = (v) => {
  if (v === '' || v == null) return null;
  let s = String(v).trim().replace(/\s/g, '').replace(/^(s\/|us\$|\$)/i, '');
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
  else s = s.replace(',', '.');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
};
const fmt = new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 });
const sym = (cur) => (cur === 'USD' ? 'US$' : 'S/');
const money = (n, cur = 'PEN') => (n == null || Number.isNaN(n) ? '—' : `${n < 0 ? '−' : ''}${sym(cur)} ${fmt.format(Math.abs(n))}`);
const money0 = (n, cur = 'PEN') => (n == null || Number.isNaN(n) ? '—' : `${n < 0 ? '−' : ''}${sym(cur)} ${fmt0.format(Math.abs(n))}`);
const pct = (x) => `${Math.round((x || 0) * 100)}%`;
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;

/* ---------------- Fechas ---------------- */
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hoyISO = () => iso(new Date());
const fromISO = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const hoyDate = () => fromISO(hoyISO());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const diasEntre = (a, b) => Math.round((fromISO(iso(b)) - fromISO(iso(a))) / 864e5);
const finDeMes = (y, m) => new Date(y, m + 1, 0).getDate();
const fechaDia = (y, m, dia) => { const b = new Date(y, m, 1); return new Date(b.getFullYear(), b.getMonth(), Math.min(dia, finDeMes(b.getFullYear(), b.getMonth()))); };
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_C = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const toD = (d) => (typeof d === 'string' ? fromISO(d) : d);
const fCorta = (d) => { d = toD(d); return `${d.getDate()} ${MESES_C[d.getMonth()]}`; };
const fMedia = (d) => { d = toD(d); return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`; };
const fLarga = (d) => { d = toD(d); return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`; };
const mesKey = (d) => (typeof d === 'string' ? d.slice(0, 7) : `${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
const mesNombre = (mk) => { const [y, m] = mk.split('-').map(Number); return `${MESES[m - 1]} ${y}`; };
const mesCorto = (mk) => MESES_C[Number(mk.slice(5, 7)) - 1];
const mesMover = (mk, n) => mesKey(new Date(Number(mk.slice(0, 4)), Number(mk.slice(5, 7)) - 1 + n, 1));
const enDias = (d) => { const n = diasEntre(hoyDate(), toD(d)); return n === 0 ? 'hoy' : n === 1 ? 'mañana' : n < 0 ? `hace ${-n} d` : `en ${n} días`; };

/* ---------------- Íconos ---------------- */
const svg = (d, s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  home: svg('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>'),
  list: svg('<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>'),
  chart: svg('<path d="M3 21h18"/><rect x="5" y="11" width="3" height="7" rx="1"/><rect x="10.5" y="5" width="3" height="13" rx="1"/><rect x="16" y="8" width="3" height="10" rx="1"/>'),
  target: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>'),
  sliders: svg('<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 30),
  x: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
  mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', 16),
  spark: svg('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>', 15),
  card: svg('<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>'),
  bank: svg('<path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>'),
  cash: svg('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>'),
  phone: svg('<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18h2"/>'),
  down: svg('<path d="M12 4v13M6 11l6 6 6-6M5 20h14"/>'),
  swap: svg('<path d="M4 8h14l-3-3M20 16H6l3 3"/>'),
  arrowIn: svg('<path d="M12 20V7M6 13l6-6 6 6"/>'),
  upload: svg('<path d="M12 16V4M6 9l6-6 6 6M5 20h14"/>'),
  left: svg('<path d="m15 18-6-6 6-6"/>'),
  right: svg('<path d="m9 18 6-6-6-6"/>'),
  chevron: svg('<path d="m9 18 6-6-6-6"/>', 18),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', 18),
  shield: svg('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
  alert: svg('<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>'),
  ant: svg('<circle cx="12" cy="7" r="2.2"/><ellipse cx="12" cy="12.5" rx="2.4" ry="2.6"/><ellipse cx="12" cy="18.5" rx="3" ry="3"/><path d="M9.8 11 6 9M14.2 11 18 9M9.6 13.5 5.5 14M14.4 13.5l4.1.5M10 16.5 6.5 19M14 16.5l3.5 2.5"/>'),
  building: svg('<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3"/>'),
  tag: svg('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.2"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
};

/* ---------------- Datos base ---------------- */
const CUENTAS_BASE = [
  { id: 'bbva-platinum', nombre: 'BBVA Platinum', tipo: 'credito', moneda: 'PEN' },
  { id: 'plin', nombre: 'Plin', tipo: 'billetera', moneda: 'PEN', asociadaA: null, asociadaTexto: 'BBVA', nota: 'Asociada a BBVA por ahora; puede pasar a Banbif.' },
  { id: 'yape', nombre: 'Yape', tipo: 'billetera', moneda: 'PEN', asociadaA: 'bcp', asociadaTexto: 'BCP' },
  { id: 'bcp', nombre: 'BCP', tipo: 'debito', moneda: 'PEN' },
  { id: 'cmr', nombre: 'CMR Falabella', tipo: 'credito', moneda: 'PEN' },
  { id: 'ripley', nombre: 'Ripley Silver', tipo: 'credito', moneda: 'PEN' },
  { id: 'diners-titanium', nombre: 'Diners Titanium Signature', tipo: 'credito', moneda: 'USD', compraPEN: true },
  { id: 'diners-sphera', nombre: 'Diners Sphera', tipo: 'credito', moneda: 'USD', compraPEN: true, lineaDe: 'diners-titanium' },
  { id: 'pichincha', nombre: 'Tarjeta Joven Pichincha', tipo: 'credito', moneda: 'USD' },
  { id: 'pacificard', nombre: 'Pacificard', tipo: 'credito', moneda: 'USD' },
  { id: 'efectivo', nombre: 'Efectivo', tipo: 'efectivo', moneda: 'PEN' },
];
const ALIAS = {
  yape: ['yape', 'llape'],
  plin: ['plin', 'plim'],
  bcp: ['bcp', 'b c p', 'be ce pe'],
  'bbva-platinum': ['bbva platinum', 'bbva', 'platinum', 'b b v a', 'continental'],
  cmr: ['cmr falabella', 'cmr', 'falabella', 'c m r'],
  ripley: ['ripley silver', 'ripley', 'riple'],
  'diners-titanium': ['diners titanium signature', 'diners titanium', 'titanium signature', 'titanium', 'titanio', 'signature'],
  'diners-sphera': ['diners sphera', 'diners esfera', 'sphera', 'esfera'],
  pichincha: ['tarjeta joven pichincha', 'tarjeta joven', 'pichincha'],
  pacificard: ['pacificard', 'pacifi card', 'pacific card'],
  efectivo: ['en efectivo', 'efectivo', 'cash'],
};
const TIPOS_CUENTA = { credito: 'Crédito', debito: 'Débito / cuenta', efectivo: 'Efectivo', billetera: 'Billetera' };

const CATS_BASE = [
  { id: 'super', nombre: 'Supermercado y mercado', nivel: 'necesario' },
  { id: 'vivienda', nombre: 'Vivienda y servicios', nivel: 'necesario' },
  { id: 'transporte', nombre: 'Transporte', nivel: 'necesario' },
  { id: 'salud', nombre: 'Salud y farmacia', nivel: 'necesario' },
  { id: 'telefonia', nombre: 'Celular e internet', nivel: 'necesario' },
  { id: 'educacion', nombre: 'Educación', nivel: 'necesario' },
  { id: 'comida-fuera', nombre: 'Comida fuera y delivery', nivel: 'moderado' },
  { id: 'ropa', nombre: 'Ropa y calzado', nivel: 'moderado' },
  { id: 'cuidado', nombre: 'Cuidado personal', nivel: 'moderado' },
  { id: 'hogar', nombre: 'Hogar', nivel: 'moderado' },
  { id: 'regalos', nombre: 'Regalos', nivel: 'moderado' },
  { id: 'comisiones', nombre: 'Intereses y comisiones', nivel: 'prescindible' },
  { id: 'antojos', nombre: 'Antojos y snacks', nivel: 'prescindible' },
  { id: 'entretenimiento', nombre: 'Salidas y entretenimiento', nivel: 'prescindible' },
  { id: 'suscripciones', nombre: 'Suscripciones', nivel: 'prescindible' },
  { id: 'impulso', nombre: 'Compras por impulso', nivel: 'prescindible' },
];
const NIVELES = {
  necesario: { nombre: 'Necesario', color: '#0ca30c' },
  moderado: { nombre: 'Moderado', color: '#fab219' },
  prescindible: { nombre: 'Prescindible', color: '#d03b3b' },
  sin: { nombre: 'Sin detalle', color: '#d03b3b' },
};
const ICONOS_PLAN = ['🏠', '✈️', '🚗', '🛡️', '🎓', '💍', '💻', '🏖️', '👶', '🐶', '🎁', '📈'];

function cuentaBase(c) {
  return Object.assign({
    saldo: null, saldoTs: null, limite: null, diaCorte: null, diaPago: null, minimo: null, ec: null,
    ultimos4: '', asociadaA: null, asociadaTexto: '', nota: '', compraPEN: false, activa: true, custom: false, lineaDe: null,
  }, c);
}
function planBase(p) {
  return Object.assign({ id: uid(), nombre: 'Mi plan', motivo: '', icono: '🎯', meta: null, modo: 'manual', ahorrado: 0, fechaObjetivo: null, demo: false }, p);
}
// Gasto fijo: algo que pagas cada mes (alquiler, internet, streaming…)
function fijoBase(f) {
  const x = Object.assign({ id: uid(), descripcion: '', monto: null, moneda: 'PEN', cuentaId: null, categoriaId: null, dia: 1, activo: true, demo: false }, f);
  x.dia = Math.min(31, Math.max(1, parseInt(x.dia, 10) || 1));
  x.moneda = x.moneda === 'USD' ? 'USD' : 'PEN';
  return x;
}
function planDepto() {
  return planBase({ id: 'departamento', nombre: 'Departamento', motivo: 'Cuota inicial de mi depa', icono: '🏠', meta: 15500, modo: 'neto' });
}
function estadoInicial() {
  return {
    version: 1,
    cuentas: CUENTAS_BASE.map((c) => cuentaBase({ ...c })),
    categorias: CATS_BASE.map((c) => ({ ...c })),
    movimientos: [],
    planes: [planDepto()],
    fijos: [],
    ajustes: { tc: null, ahorroMensual: null, umbralHormiga: 20, presupuesto: null, ultimaExportacion: null, proyFecha: null, abrirEnGasto: false },
    ejemplo: null,
  };
}
function normalizar(raw) {
  const base = estadoInicial();
  if (!raw || typeof raw !== 'object') return base;
  const s = base;
  if (Array.isArray(raw.cuentas) && raw.cuentas.length) {
    s.cuentas = raw.cuentas.filter((c) => c && c.id && c.nombre).map((c) => {
      const x = cuentaBase({ ...c });
      x.ultimos4 = String(x.ultimos4 || '').replace(/\D/g, '').slice(-4); // nunca más de 4 dígitos
      if (x.id === 'diners-sphera' && !('lineaDe' in c)) x.lineaDe = 'diners-titanium'; // Diners comparten línea
      delete x.numero;
      return x;
    });
  }
  if (Array.isArray(raw.categorias) && raw.categorias.length) {
    s.categorias = raw.categorias.filter((c) => c && c.nombre).map((c) => ({ id: c.id || uid(), nombre: String(c.nombre), nivel: ['necesario', 'moderado', 'prescindible'].includes(c.nivel) ? c.nivel : 'moderado' }));
  }
  if (Array.isArray(raw.movimientos)) {
    s.movimientos = raw.movimientos.filter((m) => m && typeof m.monto === 'number' && m.fecha).map((m) => ({
      id: m.id || uid(), tipo: ['gasto', 'ingreso', 'pago'].includes(m.tipo) ? m.tipo : 'gasto', monto: m.monto,
      moneda: m.moneda === 'USD' ? 'USD' : 'PEN', montoCargo: typeof m.montoCargo === 'number' ? m.montoCargo : null,
      descripcion: String(m.descripcion || ''), cuentaId: m.cuentaId || null, destinoId: m.destinoId || null,
      categoriaId: m.categoriaId || null, fecha: String(m.fecha).slice(0, 10), empresa: !!m.empresa,
      nota: String(m.nota || ''), creado: Number(m.creado) || Date.now(), demo: !!m.demo, yaEnSaldo: !!m.yaEnSaldo, fijoId: m.fijoId || null,
    }));
  }
  if (Array.isArray(raw.planes)) s.planes = raw.planes.map((p) => planBase({ ...p }));
  if (Array.isArray(raw.fijos)) s.fijos = raw.fijos.filter((f) => f && typeof f === 'object').map((f) => fijoBase({ ...f }));
  s.ajustes = { ...base.ajustes, ...(raw.ajustes || {}) };
  s.ejemplo = raw.ejemplo || null;
  return s;
}

/* ---------------- Estado ---------------- */
let S = cargar();
const hoyMk = () => mesKey(new Date());
const ui = { tab: 'inicio', filtro: 'todos', mesMov: hoyMk(), q: '', mesAn: hoyMk(), trendSel: null };

function cargar() {
  try { const raw = localStorage.getItem(KEY); return raw ? normalizar(JSON.parse(raw)) : estadoInicial(); } catch { return estadoInicial(); }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { toast('No se pudo guardar: memoria llena. Exporta tu respaldo.'); }
}

/* ---------------- Consultas ---------------- */
const getCuenta = (id) => S.cuentas.find((c) => c.id === id) || null;
const getCat = (id) => S.categorias.find((c) => c.id === id) || null;
const getPlan = (id) => S.planes.find((p) => p.id === id) || null;
// Línea compartida: una tarjeta que usa el saldo y límite de otra (ej. Diners Sphera → Diners Titanium)
const lineaPrincipal = (c) => { if (!c || c.tipo !== 'credito' || !c.lineaDe || c.lineaDe === c.id) return null; const p = getCuenta(c.lineaDe); return p && p.tipo === 'credito' && !p.lineaDe ? p : null; };
const compartenCon = (c) => S.cuentas.filter((x) => x.activa && x.id !== c.id && lineaPrincipal(x)?.id === c.id);
// Cada tarjeta tiene su propia deuda; si comparte línea, solo usa el límite de la principal.
const miembrosLinea = (c) => { const p = lineaPrincipal(c) || c; return [p, ...compartenCon(p)]; };
const tarjetas = () => S.cuentas.filter((c) => c.activa && c.tipo === 'credito');
const resolveCuenta = (id) => { const c = getCuenta(id); if (!c) return null; if (c.tipo === 'billetera') return c.asociadaA ? getCuenta(c.asociadaA) : null; return c; };
const nombreCuenta = (id) => { const c = getCuenta(id); return c ? c.nombre : null; };

function montoEn(m, cuenta) {
  if (m.moneda === cuenta.moneda) return m.monto;
  if (cuenta.moneda === 'USD' && m.montoCargo != null) return m.montoCargo;
  const tc = S.ajustes.tc;
  if (!tc) return null;
  return cuenta.moneda === 'USD' ? m.monto / tc : m.monto * tc;
}
function toPEN(m) {
  if (m.moneda === 'PEN') return m.monto;
  return S.ajustes.tc ? m.monto * S.ajustes.tc : null;
}
// Efecto de un movimiento sobre el saldo de una cuenta (en tarjetas: sobre la deuda)
function efectoEn(m, c) {
  const orig = resolveCuenta(m.cuentaId);
  const dest = m.destinoId ? resolveCuenta(m.destinoId) : null;
  const cred = c.tipo === 'credito';
  let d = 0, rel = false;
  if (orig && orig.id === c.id) {
    rel = true;
    const a = montoEn(m, c);
    if (a == null) return null;
    if (m.tipo === 'gasto') d += cred ? a : -a;
    else if (m.tipo === 'ingreso') d += cred ? -a : a;
    else if (m.tipo === 'pago') d += cred ? a : -a;
  }
  if (dest && dest.id === c.id && m.tipo === 'pago' && (!orig || orig.id !== c.id)) {
    rel = true;
    const a = montoEn(m, c);
    if (a == null) return null;
    d += cred ? -a : a;
  }
  return rel ? d : undefined;
}
function saldoActual(c) {
  if (!c || c.tipo === 'billetera' || c.saldo == null) return null;
  let s = c.saldo;
  for (const m of S.movimientos) {
    if (m.empresa || m.yaEnSaldo || !(m.creado > (c.saldoTs || 0))) continue;
    const e = efectoEn(m, c);
    if (e == null) continue;
    s += e;
  }
  return round2(s);
}
function patrimonio() {
  const r = { liqPEN: 0, liqUSD: 0, debPEN: 0, debUSD: 0, sinSaldo: 0, conSaldo: 0 };
  for (const c of S.cuentas) {
    if (!c.activa || c.tipo === 'billetera') continue;
    const s = saldoActual(c);
    if (s == null) { r.sinSaldo++; continue; }
    r.conSaldo++;
    if (c.tipo === 'credito') { if (c.moneda === 'USD') r.debUSD += s; else r.debPEN += s; }
    else if (c.moneda === 'USD') r.liqUSD += s; else r.liqPEN += s;
  }
  const tc = S.ajustes.tc;
  r.liq = r.liqPEN + (tc ? r.liqUSD * tc : 0);
  r.deu = r.debPEN + (tc ? r.debUSD * tc : 0);
  r.neto = round2(r.liq - r.deu);
  r.usdSinConv = !tc && (r.liqUSD !== 0 || r.debUSD !== 0);
  return r;
}

/* ----- Ciclo de facturación de tarjetas ----- */
function ciclo(c) {
  if (!c.diaCorte || !c.diaPago) return null;
  const t = hoyDate();
  let corte = fechaDia(t.getFullYear(), t.getMonth(), c.diaCorte);
  if (corte > t) corte = fechaDia(t.getFullYear(), t.getMonth() - 1, c.diaCorte);
  const corteAnt = fechaDia(corte.getFullYear(), corte.getMonth() - 1, c.diaCorte);
  const corteSig = fechaDia(corte.getFullYear(), corte.getMonth() + 1, c.diaCorte);
  const pagoDe = (ct) => fechaDia(ct.getFullYear(), ct.getMonth() + (c.diaPago > c.diaCorte ? 0 : 1), c.diaPago);
  return { corte, corteAnt, corteSig, pagoUlt: pagoDe(corte), pagoSig: pagoDe(corteSig) };
}
function cargosEntre(c, a, b) {
  const aI = iso(a), bI = iso(b);
  let total = 0, n = 0;
  for (const m of S.movimientos) {
    if (m.empresa || (m.tipo !== 'gasto' && m.tipo !== 'ingreso')) continue;
    const o = resolveCuenta(m.cuentaId);
    if (!o || o.id !== c.id || !(m.fecha > aI && m.fecha <= bI)) continue;
    const v = montoEn(m, c);
    if (v == null) continue;
    total += m.tipo === 'gasto' ? v : -v; n++;
  }
  return { total: round2(total), n };
}
function pagosEntre(c, a, b) {
  const aI = iso(a), bI = iso(b);
  let total = 0;
  for (const m of S.movimientos) {
    if (m.tipo !== 'pago' || m.empresa) continue;
    const d = resolveCuenta(m.destinoId);
    if (!d || d.id !== c.id || !(m.fecha > aI && m.fecha <= bI)) continue;
    const v = montoEn(m, c);
    if (v != null) total += v;
  }
  return round2(total);
}
function estadoTarjeta(c) {
  const deuda = saldoActual(c);
  // Límite: el propio o el de la línea compartida. El cupo se descuenta con la deuda de todas las tarjetas de la línea.
  const miembros = miembrosLinea(c);
  const compartida = miembros.length > 1;
  const limite = (lineaPrincipal(c) || c).limite;
  let deudaLinea = 0;
  for (const m of miembros) { const s = m.id === c.id ? deuda : saldoActual(m); if (s != null) deudaLinea += s; }
  deudaLinea = round2(deudaLinea);
  const hayDeuda = miembros.some((m) => saldoActual(m) != null);
  const e = {
    c, deuda, moneda: c.moneda, limite, compartida, miembros, deudaLinea,
    cupo: limite != null && hayDeuda ? round2(limite - deudaLinea) : null,
    uso: limite ? Math.max(0, deudaLinea) / limite : null, cy: ciclo(c), proximoPago: null, aPagar: null,
    fuente: '', minimo: c.minimo, cicloActual: null, pagado: 0, estimado: false,
  };
  const cy = e.cy;
  if (!cy) return e;
  const t = hoyDate();
  e.cicloActual = cargosEntre(c, cy.corte, t);
  const usarEC = (fecha) => c.ec && c.ec.pagoFecha === iso(fecha);
  if (t <= cy.pagoUlt) {
    e.proximoPago = cy.pagoUlt;
    if (usarEC(cy.pagoUlt)) { e.aPagar = c.ec.monto; e.minimo = c.ec.minimo ?? c.minimo; e.fuente = 'Según tu estado de cuenta'; }
    else {
      const f = cargosEntre(c, cy.corteAnt, cy.corte);
      e.estimado = true;
      e.aPagar = f.n ? f.total : null;
      e.fuente = f.n ? `Estimado con tus consumos del ${fCorta(addDays(cy.corteAnt, 1))} al ${fCorta(cy.corte)}` : 'Sin consumos registrados en ese periodo';
    }
    e.pagado = pagosEntre(c, cy.corte, t);
  } else {
    e.proximoPago = cy.pagoSig;
    if (usarEC(cy.pagoSig)) { e.aPagar = c.ec.monto; e.minimo = c.ec.minimo ?? c.minimo; e.fuente = 'Según tu estado de cuenta'; }
    else {
      e.estimado = true;
      e.aPagar = e.cicloActual.n ? e.cicloActual.total : null;
      e.fuente = e.cicloActual.n ? `Va sumando: consumos desde el ${fCorta(addDays(cy.corte, 1))} (cierra el ${fCorta(cy.corteSig)})` : `Ciclo en curso: cierra el ${fCorta(cy.corteSig)}`;
    }
    e.pagado = pagosEntre(c, cy.pagoUlt, t);
  }
  if (e.aPagar != null) {
    e.aPagar = Math.max(0, round2(e.aPagar - e.pagado));
    if (deuda != null) e.aPagar = Math.min(e.aPagar, Math.max(0, deuda));
  }
  return e;
}

/* ----- Resumen del mes ----- */
const umbralHormiga = () => Number(S.ajustes.umbralHormiga) || 20;
function resumenMes(mk) {
  const r = {
    total: 0, usdSinConv: 0, n: 0, ingresos: 0, porCat: new Map(), porNivel: { necesario: 0, moderado: 0, prescindible: 0, sin: 0 },
    porCuenta: new Map(), hormiga: { total: 0, n: 0, items: new Map() }, empresa: { total: 0, n: 0 }, mayor: null, porConfirmar: 0, dias: new Map(),
  };
  for (const m of S.movimientos) {
    if (mesKey(m.fecha) !== mk) continue;
    const v = toPEN(m);
    if (m.empresa) { if (m.tipo === 'gasto') { r.empresa.n++; if (v != null) r.empresa.total += v; } continue; }
    if (m.tipo === 'ingreso') { if (v != null) r.ingresos += v; continue; }
    if (m.tipo !== 'gasto') continue;
    if (!m.cuentaId || !m.categoriaId) r.porConfirmar++;
    if (v == null) { r.usdSinConv += m.monto; continue; }
    r.total += v; r.n++;
    const cat = getCat(m.categoriaId);
    const key = cat ? cat.id : '_pc';
    const nivel = cat ? cat.nivel : 'sin';
    const pc = r.porCat.get(key) || { id: key, nombre: cat ? cat.nombre : 'Por confirmar', nivel, total: 0, n: 0 };
    pc.total += v; pc.n++; r.porCat.set(key, pc);
    r.porNivel[nivel] += v;
    const cu = getCuenta(m.cuentaId);
    const ck = cu ? cu.id : '_pc';
    const pcu = r.porCuenta.get(ck) || { nombre: cu ? cu.nombre : 'Por confirmar', total: 0, n: 0 };
    pcu.total += v; pcu.n++; r.porCuenta.set(ck, pcu);
    if (v > 0 && v <= umbralHormiga()) {
      r.hormiga.total += v; r.hormiga.n++;
      const k = norm(m.descripcion) || '(sin descripción)';
      const it = r.hormiga.items.get(k) || { nombre: m.descripcion || '(sin descripción)', total: 0, n: 0 };
      it.total += v; it.n++; r.hormiga.items.set(k, it);
    }
    if (!r.mayor || v > r.mayor.v) r.mayor = { m, v };
    r.dias.set(m.fecha, (r.dias.get(m.fecha) || 0) + v);
  }
  return r;
}
function gastoHasta(mk, dia) {
  let t = 0;
  for (const m of S.movimientos) {
    if (m.tipo !== 'gasto' || m.empresa || mesKey(m.fecha) !== mk || Number(m.fecha.slice(8, 10)) > dia) continue;
    const v = toPEN(m); if (v != null) t += v;
  }
  return t;
}

/* ----- Gastos fijos ----- */
const getFijo = (id) => S.fijos.find((f) => f.id === id) || null;
function pagoDeFijo(f, mk) {
  const dn = norm(f.descripcion);
  return S.movimientos.find((m) => m.tipo === 'gasto' && mesKey(m.fecha) === mk &&
    (m.fijoId === f.id || (!m.fijoId && dn && norm(m.descripcion) === dn && (m.cuentaId || null) === (f.cuentaId || null)))) || null;
}
function fijosMes(mk = hoyMk()) {
  const t = hoyDate();
  const [y, mo] = mk.split('-').map(Number);
  const lst = S.fijos.filter((f) => f.activo).map((f) => {
    const fecha = fechaDia(y, mo - 1, f.dia);
    const pago = pagoDeFijo(f, mk);
    return { f, fecha, pago, vencido: !pago && fecha < t, dias: diasEntre(t, fecha) };
  }).sort((a, b) => a.fecha - b.fecha);
  const pen = (monto, moneda) => toPEN({ monto: monto || 0, moneda });
  let total = 0, pagado = 0, pendiente = 0;
  for (const x of lst) {
    const v = pen(x.f.monto, x.f.moneda) || 0;
    total += v;
    if (x.pago) pagado += toPEN(x.pago) || 0; else pendiente += v;
  }
  return { lst, total: round2(total), pagado: round2(pagado), pendiente: round2(pendiente) };
}

/* ----- Planes ----- */
function ahorradoPlan(p) {
  if (p.modo === 'neto') { const pt = patrimonio(); return pt.conSaldo ? Math.max(0, pt.neto) : 0; }
  return Number(p.ahorrado) || 0;
}
function mesesHasta(fecha) { return Math.max(0, diasEntre(hoyDate(), toD(fecha)) / 30.4375); }
function infoPlan(p) {
  const ah = ahorradoPlan(p);
  const meta = Number(p.meta) || 0;
  const falta = Math.max(0, meta - ah);
  const prog = meta ? Math.min(1, ah / meta) : 0;
  const am = S.ajustes.ahorroMensual;
  let llegada = null, necesario = null, mesesObj = null;
  if (falta > 0 && am > 0) { const meses = Math.ceil(falta / am); const d = new Date(); llegada = new Date(d.getFullYear(), d.getMonth() + meses, 1); }
  if (falta > 0 && p.fechaObjetivo) { mesesObj = mesesHasta(p.fechaObjetivo); necesario = mesesObj > 0 ? falta / Math.max(1, mesesObj) : falta; }
  return { ah, meta, falta, prog, llegada, necesario, mesesObj };
}

/* ----- Consejos automáticos (solo con tus números) ----- */
function consejos() {
  const out = [];
  const t = hoyDate();
  const mk = mesKey(t);
  const r = resumenMes(mk);
  const p = patrimonio();
  const tc = S.ajustes.tc;
  for (const c of tarjetas()) {
    const e = estadoTarjeta(c);
    if (e.proximoPago && e.aPagar > 0) {
      const d = diasEntre(t, e.proximoPago);
      if (d >= 0 && d <= 5) out.push({ tono: 'alerta', icono: '⏰', texto: `Pago de ${c.nombre} ${enDias(e.proximoPago)} (${fCorta(e.proximoPago)}): aprox. ${money(e.aPagar, c.moneda)}. Deja el dinero listo en tu cuenta antes de esa fecha.` });
    }
    if (lineaPrincipal(c)) continue; // el uso de una línea compartida se avisa una sola vez
    const quien = e.compartida ? `La línea de ${e.miembros.map((m) => m.nombre).join(' + ')}` : c.nombre;
    if (e.uso != null && e.uso >= 0.7) out.push({ tono: 'alerta', icono: '💳', texto: `${quien} está al ${pct(e.uso)} de su límite. Usar más del 30% del límite puede afectar tu historial crediticio.` });
    else if (e.uso != null && e.uso >= 0.3) out.push({ tono: 'info', icono: '💳', texto: `${quien} está al ${pct(e.uso)} de su límite. Lo ideal es mantenerla por debajo del 30%.` });
  }
  if (p.conSaldo && p.neto < 0) out.push({ tono: 'alerta', icono: '⚖️', texto: `Tus deudas superan tu dinero disponible por ${money(-p.neto)}. Prioriza pagar primero la tarjeta con mayor interés.` });
  if (r.hormiga.total > 0 && r.total > 0) {
    const share = r.hormiga.total / r.total;
    const anual = (r.hormiga.total / t.getDate()) * 365;
    out.push({ tono: share >= 0.1 ? 'alerta' : 'info', icono: '🐜', texto: `Tus gastos hormiga (hasta ${money0(umbralHormiga())}) suman ${money(r.hormiga.total)} este mes, el ${pct(share)} de tu gasto. A este ritmo serían unos ${money0(anual)} al año.`, accion: { label: 'Ver gastos hormiga', action: 'tab', tab: 'analisis' } });
  }
  const presc = r.porNivel.prescindible + r.porNivel.sin;
  if (r.total > 0 && presc / r.total >= 0.25) out.push({ tono: 'alerta', icono: '✂️', texto: `El ${pct(presc / r.total)} de tu gasto del mes es prescindible o sin detalle (${money(presc)}). Recortar la mitad te daría ${money(presc / 2)} más de ahorro.` });
  const pend = S.movimientos.filter((m) => !m.empresa && m.tipo === 'gasto' && (!m.cuentaId || !m.categoriaId)).length;
  if (pend) out.push({ tono: 'info', icono: '📝', texto: `Tienes ${plural(pend, 'gasto', 'gastos')} por confirmar (sin cuenta o categoría). Complétalos para que tus números sean exactos.`, accion: { label: 'Revisar', action: 'ver-porconfirmar' } });
  const prevMk = mesMover(mk, -1);
  const prev = gastoHasta(prevMk, t.getDate());
  if (prev > 0 && r.total > 0) {
    if (r.total > prev * 1.2) out.push({ tono: 'alerta', icono: '📈', texto: `Vas ${pct(r.total / prev - 1)} por encima de lo que llevabas a esta fecha el mes pasado (${money(prev)}).` });
    else if (r.total < prev * 0.85) out.push({ tono: 'bien', icono: '👏', texto: `Vas ${pct(1 - r.total / prev)} por debajo de lo que llevabas a esta fecha el mes pasado. ¡Buen ritmo!` });
  }
  const pres = Number(S.ajustes.presupuesto);
  if (pres > 0 && r.total > 0) {
    const usado = r.total / pres;
    const fd = finDeMes(t.getFullYear(), t.getMonth());
    const quedan = fd - t.getDate() + 1;
    const resto = pres - r.total;
    if (resto < 0) out.push({ tono: 'alerta', icono: '🚨', texto: `Pasaste tu presupuesto del mes por ${money(-resto)}.` });
    else if (usado > t.getDate() / fd + 0.1) out.push({ tono: 'alerta', icono: '🧭', texto: `Llevas el ${pct(usado)} de tu presupuesto y va el ${pct(t.getDate() / fd)} del mes. Te quedan ${money(resto)} para ${quedan} días (${money(resto / quedan)} por día).` });
    else out.push({ tono: 'bien', icono: '🧭', texto: `Vas bien con tu presupuesto: te quedan ${money(resto)} para ${quedan} días (${money(resto / quedan)} por día).` });
  }
  if (r.ingresos > 0 && r.total > r.ingresos) out.push({ tono: 'alerta', icono: '⚠️', texto: `Este mes gastaste ${money(r.total - r.ingresos)} más de lo que registraste como ingresos.` });
  const am = S.ajustes.ahorroMensual;
  for (const pl of S.planes) {
    const ip = infoPlan(pl);
    if (ip.necesario != null && am != null && pl.fechaObjetivo) {
      if (ip.necesario > am) out.push({ tono: 'alerta', icono: pl.icono, texto: `Para "${pl.nombre}" al ${fMedia(pl.fechaObjetivo)} necesitas ahorrar ${money(ip.necesario)} al mes; hoy planeas ${money(am)}.` });
      else out.push({ tono: 'bien', icono: pl.icono, texto: `Con ${money(am)} al mes llegas a "${pl.nombre}" antes de tu fecha objetivo.` });
    }
  }
  const top = [...r.porCat.values()].sort((a, b) => b.total - a.total)[0];
  if (top && r.total > 0) out.push({ tono: 'info', icono: '🔎', texto: `Tu mayor gasto del mes es ${top.nombre}: ${money(top.total)} (${pct(top.total / r.total)} del total).` });
  if (!tc && S.movimientos.some((m) => m.moneda === 'USD') ) out.push({ tono: 'info', icono: '💱', texto: 'Tienes montos en dólares. Ingresa tu tipo de cambio para sumarlos a tus totales.', accion: { label: 'Ingresar tipo de cambio', action: 'sheet-param' } });
  if (S.fijos.some((f) => f.activo)) {
    const fm = fijosMes();
    const venc = fm.lst.filter((x) => x.vencido);
    const pronto = fm.lst.filter((x) => !x.pago && x.dias >= 0 && x.dias <= 3);
    if (venc.length) out.push({ tono: 'alerta', icono: '📌', texto: `Tienes ${plural(venc.length, 'gasto fijo vencido', 'gastos fijos vencidos')} sin registrar: ${venc.map((x) => x.f.descripcion).join(', ')}. Si ya los pagaste, regístralos para que tus números cuadren.` });
    if (pronto.length) out.push({ tono: 'info', icono: '📅', texto: `Pronto vence: ${pronto.map((x) => `${x.f.descripcion} (${fCorta(x.fecha)}, ${money(x.f.monto, x.f.moneda)})`).join(', ')}.` });
  }
  if (!out.length) out.push({ tono: 'bien', icono: '✨', texto: 'Registra tus gastos unos días y aquí aparecerán consejos basados en tus propios números.' });
  const orden = { alerta: 0, info: 1, bien: 2 };
  return out.sort((a, b) => orden[a.tono] - orden[b.tono]);
}

/* ---------------- Dictado: "almuerzo 12 soles Yape" ---------------- */
const NUM_PAL = {
  cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19,
  veinte: 20, veintiun: 21, veintiuno: 21, veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26,
  veintisiete: 27, veintiocho: 28, veintinueve: 29, treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70,
  ochenta: 80, noventa: 90, cien: 100, ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400, quinientos: 500,
  seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900, mil: 1000,
};
const MONEDA_PAL = { soles: 'PEN', sol: 'PEN', lucas: 'PEN', luca: 'PEN', pen: 'PEN', dolares: 'USD', dolar: 'USD', usd: 'USD', dollars: 'USD' };
const RELLENO = new Set(['con', 'en', 'por', 'de', 'del', 'el', 'la', 'los', 'las', 'un', 'una', 'a', 'al', 'y', 'para', 'pague', 'gaste', 'compre', 'me', 'mi', 'mis', 'tarjeta', 'cuenta', 'usando', 'desde', 'que', 'fue', 'mediante']);
const CAT_STOP = new Set(['compras', 'fuera', 'personal', 'cuidado', 'salidas', 'servicios', 'por', 'con']);

function parseDictado(texto) {
  const out = { monto: null, moneda: null, cuentaId: null, ambigua: null, descripcion: '', categoriaId: null, catFuente: '', fecha: null, empresa: false };
  if (!texto || !texto.trim()) return out;
  let pre = ` ${texto} `
    .replace(/u\.?\s?s\.?\s?\$/gi, ' dólares ')
    .replace(/\$/g, ' dólares ')
    .replace(/s\/\.?/gi, ' soles ')
    .replace(/(\d)(soles|sol|lucas|d[oó]lares)\b/gi, '$1 $2');
  let toks = pre.split(/\s+/)
    .map((o) => o.replace(/^[¿¡"'(\[]+|[?!"')\],;:.]+$/g, ''))
    .filter(Boolean)
    .map((o) => ({ o, n: norm(o) }));

  // Palabras numéricas → dígitos ("doce soles" → 12)
  const res = [];
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.n in NUM_PAL) {
      let j = i, total = 0, cur = 0, words = 0;
      while (j < toks.length) {
        const w = toks[j].n;
        if (w in NUM_PAL) { const v = NUM_PAL[w]; if (v === 1000) { total += (cur || 1) * 1000; cur = 0; } else cur += v; words++; j++; }
        else if (w === 'y' && words && j + 1 < toks.length && toks[j + 1].n in NUM_PAL) j++;
        else break;
      }
      const solo = words === 1 && ['un', 'una', 'uno'].includes(t.n);
      if (solo && !MONEDA_PAL[toks[j]?.n]) { res.push(t); continue; }
      const val = String(total + cur);
      res.push({ o: val, n: val });
      i = j - 1;
    } else res.push(t);
  }
  toks = res;
  // "12 con 50" → 12.50
  for (let i = 0; i + 2 < toks.length; i++) {
    if (/^\d+$/.test(toks[i].n) && toks[i + 1].n === 'con' && /^\d{1,2}$/.test(toks[i + 2].n)) {
      const v = `${toks[i].n}.${toks[i + 2].n.padEnd(2, '0')}`;
      toks.splice(i, 3, { o: v, n: v });
    }
  }
  const used = new Array(toks.length).fill(false);

  // Monto: preferimos el número que va junto a "soles"/"dólares"
  let best = -1, bestScore = -1;
  toks.forEach((t, i) => {
    if (!/^\d+([.,]\d+)*$/.test(t.n)) return;
    let sc = 1;
    if (MONEDA_PAL[toks[i + 1]?.n]) sc += 3;
    if (MONEDA_PAL[toks[i - 1]?.n]) sc += 2;
    if (sc > bestScore) { best = i; bestScore = sc; }
  });
  if (best >= 0) {
    out.monto = num(toks[best].n);
    used[best] = true;
    const cn = MONEDA_PAL[toks[best + 1]?.n] || MONEDA_PAL[toks[best - 1]?.n];
    if (cn) out.moneda = cn;
  }
  toks.forEach((t, i) => { if (MONEDA_PAL[t.n]) { used[i] = true; if (!out.moneda) out.moneda = MONEDA_PAL[t.n]; } });

  // Cuenta
  const alias = [];
  for (const c of S.cuentas) {
    if (!c.activa) continue;
    new Set([...(ALIAS[c.id] || []), norm(c.nombre)]).forEach((a) => alias.push({ id: c.id, parts: norm(a).split(/\s+/) }));
  }
  alias.sort((a, b) => b.parts.length - a.parts.length);
  outer: for (const a of alias) {
    for (let i = 0; i + a.parts.length <= toks.length; i++) {
      if (a.parts.every((p, k) => toks[i + k].n === p && !used[i + k])) {
        out.cuentaId = a.id;
        for (let k = 0; k < a.parts.length; k++) used[i + k] = true;
        if (toks[i - 1]?.n === 'diners') used[i - 1] = true;
        break outer;
      }
    }
  }
  toks.forEach((t, i) => { if (t.n === 'diners' && !used[i]) { used[i] = true; if (!out.cuentaId) out.ambigua = 'Diners'; } });

  // Fecha
  toks.forEach((t, i) => {
    if (used[i]) return;
    if (t.n === 'hoy') { used[i] = true; out.fecha = hoyISO(); }
    else if (t.n === 'ayer') { used[i] = true; out.fecha = iso(addDays(hoyDate(), -1)); }
    else if (t.n === 'anteayer' || t.n === 'antier') { used[i] = true; out.fecha = iso(addDays(hoyDate(), -2)); }
  });
  // Pagado por la empresa
  toks.forEach((t, i) => {
    if (t.n !== 'empresa') return;
    out.empresa = true; used[i] = true;
    for (let k = i - 1; k >= 0 && ['la', 'por', 'de', 'pagado', 'pagada', 'lo', 'paga', 'pago'].includes(toks[k].n); k--) used[k] = true;
  });

  // Descripción: lo que queda, sin palabras de relleno en los extremos
  const rest = toks.filter((t, i) => !used[i]);
  while (rest.length && RELLENO.has(rest[0].n)) rest.shift();
  while (rest.length && RELLENO.has(rest[rest.length - 1].n)) rest.pop();
  out.descripcion = rest.map((t) => t.o).join(' ');

  // Categoría: solo si la usaste antes con la misma descripción o la nombraste
  const dn = norm(out.descripcion);
  if (dn) {
    const prev = [...S.movimientos].reverse().find((m) => m.categoriaId && norm(m.descripcion) === dn && getCat(m.categoriaId));
    if (prev) { out.categoriaId = prev.categoriaId; out.catFuente = 'como la última vez'; }
  }
  if (!out.categoriaId) {
    const raiz = (w) => w.replace(/(es|s)$/, '');
    const words = new Set(toks.map((t) => raiz(t.n)));
    for (const c of S.categorias) {
      const cw = norm(c.nombre).split(/\s+/).filter((w) => w.length >= 4 && !CAT_STOP.has(w));
      if (cw.some((w) => words.has(raiz(w)))) { out.categoriaId = c.id; out.catFuente = 'porque la nombraste'; break; }
    }
  }
  return out;
}

/* ---------------- Render general ---------------- */
function render() {
  const v = $('#view');
  v.innerHTML = (VIEWS[ui.tab] || vInicio)();
  $$('.tabbar .tab[data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === ui.tab));
  $('#fecha-hoy').textContent = cap(fLarga(new Date()));
}
function initChrome() {
  $('#btn-ajustes').innerHTML = ICON.sliders;
  const tabs = { inicio: [ICON.home, 'Inicio'], movimientos: [ICON.list, 'Movimientos'], analisis: [ICON.chart, 'Análisis'], planes: [ICON.target, 'Planes'] };
  for (const [k, [i, l]] of Object.entries(tabs)) $(`#tab-${k}`).innerHTML = `${i}<span>${l}</span>`;
  $('#tab-add').innerHTML = `<span class="add-circle">${ICON.plus}</span><span class="add-lbl">Gasto</span>`;
}

const sec = (title, body, extra = '', id = '') => `<section class="card"${id ? ` id="${id}"` : ''}><div class="card-head"><h3 class="card-title">${title}</h3>${extra}</div>${body}</section>`;

/* ---------------- INICIO ---------------- */
function vInicio() {
  const p = patrimonio();
  const r = resumenMes(hoyMk());
  return [
    bannersHTML(),
    heroHTML(p),
    `<button class="btn btn-primary btn-xl cta-gasto" data-action="nuevo-mov" data-tipo="gasto"><span class="plus">+</span> Gasto <small>${ICON.mic} dicta o escribe</small></button>`,
    onboardingHTML(p),
    fijosHTML(),
    pagosHTML(p),
    tarjetasHTML(),
    categoriasMesHTML(r),
    metaDeptoHTML(),
    proyeccionHTML(p),
    consejosHTML(3),
  ].join('');
}
function fijosHTML() {
  if (!S.fijos.some((f) => f.activo)) {
    if (!S.movimientos.some((m) => !m.demo)) return '';
    return `<div class="banner"><div class="b-ico">📌</div><div><b>¿Pagas cosas fijas cada mes?</b>Alquiler, internet, celular, streaming… Agrégalas una vez y cada mes te recuerdo cuáles faltan.<div class="b-actions"><button class="btn btn-white" data-action="nuevo-fijo">+ Agregar gasto fijo</button></div></div></div>`;
  }
  const mk = hoyMk();
  const fm = fijosMes(mk);
  const filas = fm.lst.map((x) => {
    const f = x.f;
    const cu = nombreCuenta(f.cuentaId);
    let estado;
    if (x.pago) estado = `<span class="badge badge-ok">Pagado ${fCorta(x.pago.fecha)}</span>`;
    else if (x.vencido) estado = `<span class="badge badge-bad">Vencido hace ${plural(-x.dias, 'día', 'días')}</span>`;
    else if (x.dias <= 3) estado = `<span class="badge badge-warn">Vence ${enDias(x.fecha)}</span>`;
    else estado = `<span class="badge badge-gray">Día ${f.dia}</span>`;
    return `<div class="row">
      <div class="row-main"><div class="row-title">${esc(f.descripcion || 'Gasto fijo')}</div><div class="row-sub">${esc(cu || 'Cuenta por confirmar')}</div><div class="tags">${estado}</div></div>
      <div class="row-end">${money(x.pago ? x.pago.monto : f.monto, x.pago ? x.pago.moneda : f.moneda)}${x.pago ? '' : `<button class="btn btn-mini" data-action="registrar-fijo" data-id="${f.id}">Registrar</button>`}</div></div>`;
  }).join('');
  const prog = fm.total ? Math.min(1, fm.pagado / fm.total) : 0;
  return sec(`📌 Gastos fijos de ${MESES[Number(mk.slice(5, 7)) - 1]}`, `
    <div class="goal-nums"><span class="big">${money(fm.pendiente)}</span><span class="of">por pagar<br>de ${money(fm.total)} al mes</span></div>
    <div class="progress"><i style="width:${(prog * 100).toFixed(1)}%"></i></div>
    <div class="list">${filas}</div>
    <div class="card-note">Toca «Registrar» cuando lo pagues: revisas el monto y guardas. <button class="link-btn" data-action="tab" data-tab="ajustes" data-scroll="sec-fijos">Administrar</button></div>`);
}
function hayDatosReales() { return S.movimientos.some((m) => !m.demo) || (!S.ejemplo && S.cuentas.some((c) => c.saldo != null)); }
function diasSinExportar() { const u = S.ajustes.ultimaExportacion; return u ? Math.floor((Date.now() - u) / 864e5) : null; }
function bannersHTML() {
  let h = '';
  if (S.ejemplo) {
    h += `<div class="banner banner-demo"><div class="b-ico">${ICON.info}</div><div><b>Estás viendo datos de ejemplo ficticios</b>Sirven solo para probar. No cargues tus datos reales hasta borrarlos.<div class="b-actions"><button class="btn btn-white" data-action="borrar-ejemplo">Borrar ejemplo</button></div></div></div>`;
  }
  const d = diasSinExportar();
  if (hayDatosReales() && (d == null || d > 7)) {
    h += `<div class="banner banner-warn"><div class="b-ico">${ICON.alert}</div><div><b>${d == null ? 'Aún no has hecho tu primer respaldo' : `Hace ${d} días que no exportas tu respaldo`}</b>Tus datos viven solo en este iPhone. Guarda una copia en Archivos de iCloud Drive.<div class="b-actions"><button class="btn btn-white" data-action="exportar">Exportar ahora</button></div></div></div>`;
  }
  return h;
}
function heroHTML(p) {
  const ok = p.conSaldo > 0;
  const tc = S.ajustes.tc;
  let notas = '';
  if (p.usdSinConv) notas += `<div class="hero-note">⚠︎ Lo que está en dólares no se suma al total hasta que ingreses tu tipo de cambio. <button class="link-btn" data-action="sheet-param">Ingresar</button></div>`;
  else if (tc && (p.liqUSD || p.debUSD)) notas += `<div class="hero-note">Dólares convertidos a S/ ${fmt.format(tc)} por US$ 1 (tu tipo de cambio).</div>`;
  if (ok && p.sinSaldo) notas += `<div class="hero-note">${plural(p.sinSaldo, 'cuenta sin saldo cargado no se cuenta', 'cuentas sin saldo cargado no se cuentan')}.</div>`;
  return `<section class="hero">
    <div class="hero-top"><span class="eyebrow">Saldo de ahorro</span><button class="link-btn" data-action="tab" data-tab="ajustes" data-scroll="sec-cuentas">Mis saldos</button></div>
    <div class="hero-amount ${ok && p.neto < 0 ? 'neg' : ''}">${ok ? money(p.neto) : 'S/ —'}</div>
    <div class="hero-sub">${ok ? 'Cuentas líquidas menos deudas de tarjetas' : 'Carga tus saldos para calcularlo'}</div>
    <div class="hero-split">
      <div><span>Líquido</span><strong>${money(p.liqPEN)}</strong>${p.liqUSD ? `<em>+ ${money(p.liqUSD, 'USD')}</em>` : ''}</div>
      <div><span>Deudas</span><strong>${money(p.debPEN)}</strong>${p.debUSD ? `<em>+ ${money(p.debUSD, 'USD')}</em>` : ''}</div>
    </div>${notas}
  </section>`;
}
function onboardingHTML(p) {
  if (p.conSaldo || S.ejemplo || S.movimientos.length) return '';
  const paso = (n, t, s) => `<div class="row"><div class="ico">${n}</div><div class="row-main"><div class="row-title">${t}</div><div class="row-sub">${s}</div></div></div>`;
  return sec(`${ICON.spark} Primeros pasos`, `<div class="list">
    ${paso(1, 'Carga tus saldos', 'BCP y efectivo: cuánto tienes hoy')}
    ${paso(2, 'Completa tus tarjetas', 'Deuda, límite, día de corte y de pago')}
    ${paso(3, 'Tipo de cambio y ahorro mensual', 'Para sumar dólares y proyectar')}
    ${paso(4, 'Registra tu primer gasto', 'Toca + Gasto y díctalo')}
  </div>
  <div class="btn-row" style="margin-top:12px"><button class="btn btn-primary" data-action="tab" data-tab="ajustes" data-scroll="sec-cuentas">Empezar</button><button class="btn" data-action="cargar-ejemplo">Ver ejemplo</button></div>`);
}
function pagosHTML(p) {
  const items = tarjetas().map((c) => estadoTarjeta(c)).filter((e) => e.proximoPago && ((e.aPagar || 0) > 0 || (e.deuda || 0) > 0))
    .sort((a, b) => a.proximoPago - b.proximoPago);
  if (!items.length) return '';
  const tc = S.ajustes.tc;
  let tPEN = 0, tUSD = 0, sinMonto = 0;
  const rows = items.map((e) => {
    const d = diasEntre(hoyDate(), e.proximoPago);
    if (e.aPagar == null) sinMonto++; else if (e.moneda === 'USD') tUSD += e.aPagar; else tPEN += e.aPagar;
    const monto = e.aPagar == null ? '<span class="muted">Sin monto</span>' : e.aPagar === 0 ? '<span class="badge badge-ok">Pagado</span>' : money(e.aPagar, e.moneda);
    return `<button class="pago" data-action="edit-cuenta" data-id="${e.c.id}">
      <div class="fecha-pill ${d <= 5 ? 'urgente' : ''}"><b>${e.proximoPago.getDate()}</b><span>${MESES_C[e.proximoPago.getMonth()]}</span></div>
      <div class="row-main"><div class="row-title">${esc(e.c.nombre)}</div><div class="row-sub">${cap(enDias(e.proximoPago))}${e.minimo ? ` · mínimo ${money(e.minimo, e.moneda)}` : ''}${e.estimado ? ' · estimado' : ''}</div></div>
      <div class="row-end">${monto}</div></button>`;
  }).join('');
  const totalPEN = tPEN + (tc ? tUSD * tc : 0);
  const falta = p.conSaldo ? totalPEN - p.liq : null;
  return sec('Próximos pagos de tarjetas', `${rows}
    <div class="total-box">
      <div class="t-line t-big"><span>Total a pagar en el periodo</span><b>${money(tc ? totalPEN : tPEN)}</b></div>
      ${tUSD && !tc ? `<div class="t-line"><span>Más en dólares</span><b>${money(tUSD, 'USD')}</b></div>` : ''}
      ${tUSD && tc ? `<div class="t-line"><span>Incluye en dólares</span><b>${money(tUSD, 'USD')}</b></div>` : ''}
      ${falta != null ? `<div class="t-line"><span>${falta > 0 ? 'Te faltan en tus cuentas' : 'Tu dinero líquido alcanza'}</span><b>${falta > 0 ? money(falta) : `sobran ${money(-falta)}`}</b></div>` : ''}
    </div>
    <div class="card-note">Aproximado con lo que registras y tus estados de cuenta. ${sinMonto ? `${plural(sinMonto, 'tarjeta', 'tarjetas')} sin monto: toca para ingresar el estado de cuenta.` : 'Toca una tarjeta para ingresar el monto exacto del estado de cuenta.'}</div>`,
    '<span class="badge">Estimación</span>');
}
function tarjetaHTML(e) {
  const c = e.c;
  const nivel = e.uso >= 0.7 ? 'critico' : e.uso >= 0.3 ? 'alto' : '';
  const foot = [];
  if (e.proximoPago) foot.push(`<span>Próximo pago: <b>${fCorta(e.proximoPago)}</b> (${enDias(e.proximoPago)})</span>`);
  if (e.aPagar != null) foot.push(`<span>A pagar ${e.estimado ? 'aprox.' : ''}: <b>${money(e.aPagar, c.moneda)}</b>${e.minimo ? ` · mínimo <b>${money(e.minimo, c.moneda)}</b>` : ''}</span>`);
  else if (e.minimo) foot.push(`<span>Pago mínimo: <b>${money(e.minimo, c.moneda)}</b></span>`);
  if (e.cy && e.cicloActual && e.cicloActual.n) foot.push(`<span>Consumos desde el corte del ${fCorta(e.cy.corte)}: <b>${money(e.cicloActual.total, c.moneda)}</b></span>`);
  if (!e.cy) foot.push('<span class="muted">Agrega día de corte y de pago para ver tus fechas</span>');
  return `<button class="tcard" data-action="edit-cuenta" data-id="${c.id}">
    <div class="tcard-head"><span class="tcard-name">${esc(c.nombre)}${c.ultimos4 ? `<small>•••• ${esc(c.ultimos4)}</small>` : ''}</span><span class="badge badge-gray">${c.moneda}${c.compraPEN ? ' · compras en S/' : ''}</span></div>
    ${e.compartida ? `<div class="usage-lbl">Comparte límite con ${e.miembros.filter((m) => m.id !== c.id).map((x) => esc(x.nombre)).join(', ')} · deuda propia</div>` : ''}
    <div class="tcard-grid">
      <div><span>Deuda total</span><strong>${money(e.deuda, c.moneda)}</strong></div>
      <div><span>Cupo disponible</span><strong>${e.cupo == null ? '—' : money(e.cupo, c.moneda)}</strong></div>
    </div>
    ${e.uso != null ? `<div class="usage"><i class="${nivel}" style="width:${Math.min(100, e.uso * 100).toFixed(1)}%"></i></div><div class="usage-lbl">${e.compartida ? `Entre ambas usan ${pct(e.uso)} del límite compartido de ${money0(e.limite, c.moneda)} (deuda conjunta ${money(e.deudaLinea, c.moneda)})` : `Usas ${pct(e.uso)} de ${money0(e.limite, c.moneda)}`}</div>` : ''}
    <div class="tcard-foot">${foot.join('')}</div>
  </button>`;
}
// Línea compartida (ej. Diners): un solo bloque con el cupo común y la deuda de cada tarjeta
function lineaHTML(p) {
  const miembros = miembrosLinea(p).filter((m) => m.activa);
  const e0 = estadoTarjeta(p);
  const cur = p.moneda;
  const nivel = e0.uso >= 0.7 ? 'critico' : e0.uso >= 0.3 ? 'alto' : '';
  const filas = miembros.map((m) => {
    const e = estadoTarjeta(m);
    const det = [];
    if (e.proximoPago) det.push(`Pago ${fCorta(e.proximoPago)} (${enDias(e.proximoPago)})`);
    if (e.aPagar != null) det.push(`a pagar ${e.estimado ? 'aprox. ' : ''}<b>${money(e.aPagar, cur)}</b>`);
    if (e.minimo) det.push(`mín. ${money(e.minimo, cur)}`);
    if (!e.cy) det.push('falta día de corte y pago');
    return `<button class="linea-item" data-action="edit-cuenta" data-id="${m.id}">
      <div class="li-top"><span class="li-name">${esc(m.nombre)}${m.ultimos4 ? ` <small>•••• ${esc(m.ultimos4)}</small>` : ''}</span><span class="li-deuda">${e.deuda == null ? '<span class="muted">sin deuda cargada</span>' : money(e.deuda, cur)}</span></div>
      <div class="li-sub">${det.join(' · ')}</div></button>`;
  }).join('');
  return `<div class="tcard tcard-linea">
    <div class="tcard-head"><span class="eyebrow">Línea compartida</span><span class="badge badge-gray">${cur}${p.compraPEN ? ' · compras en S/' : ''}</span></div>
    <div class="tcard-name" style="margin-top:4px">${miembros.map((m) => esc(m.nombre)).join(' + ')}</div>
    <div class="tcard-grid">
      <div><span>Cupo disponible (ambas)</span><strong>${e0.cupo == null ? '—' : money(e0.cupo, cur)}</strong></div>
      <div><span>Deuda de ambas</span><strong>${money(e0.deudaLinea, cur)}</strong></div>
    </div>
    ${e0.uso != null ? `<div class="usage"><i class="${nivel}" style="width:${Math.min(100, e0.uso * 100).toFixed(1)}%"></i></div><div class="usage-lbl">Usan ${pct(e0.uso)} del límite de ${money0(e0.limite, cur)}</div>` : `<div class="usage-lbl">Toca ${esc(p.nombre)} para poner el cupo disponible o el límite</div>`}
    <div class="linea-list">${filas}</div>
  </div>`;
}
function tarjetasHTML() {
  const all = tarjetas();
  const tieneDatos = (c) => miembrosLinea(c).some((m) => m.saldo != null || m.limite != null);
  const con = all.filter(tieneDatos);
  const sin = all.filter((c) => !tieneDatos(c));
  const vistos = new Set();
  const bloques = con.map((c) => {
    const p = lineaPrincipal(c) || c;
    if (miembrosLinea(p).length > 1) { if (vistos.has(p.id)) return ''; vistos.add(p.id); return lineaHTML(p); }
    return tarjetaHTML(estadoTarjeta(c));
  }).join('');
  const body = `<div class="tcards">${bloques}</div>
    ${sin.length ? `<div class="card-note">Sin datos: ${sin.map((c) => `<button class="link-btn" data-action="edit-cuenta" data-id="${c.id}">${esc(c.nombre)}</button>`).join(' · ')}</div>` : ''}`;
  return sec('Tarjetas', body, `<span class="badge badge-gray">${all.length}</span>`);
}
function catRowsHTML(r, limit = 99) {
  const cats = [...r.porCat.values()].sort((a, b) => b.total - a.total).slice(0, limit);
  const max = cats[0]?.total || 1;
  return cats.map((c) => `<div class="cat-row">
    <div class="cat-top"><span class="dot dot-${c.nivel}" title="${NIVELES[c.nivel].nombre}"></span><span class="name">${esc(c.nombre)}</span><span class="val">${money(c.total)}</span><span class="pc">${pct(c.total / r.total)}</span></div>
    <div class="bar"><i class="${c.nivel}" style="width:${Math.max(2, (c.total / max) * 100).toFixed(1)}%"></i></div></div>`).join('');
}
const leyendaNiveles = () => `<div class="legend">${['necesario', 'moderado', 'prescindible', 'sin'].map((k) => `<span><i class="dot dot-${k}"></i>${NIVELES[k].nombre}</span>`).join('')}</div>`;
function categoriasMesHTML(r) {
  const mk = hoyMk();
  const titulo = `Gasto de ${MESES[Number(mk.slice(5, 7)) - 1]}`;
  if (!r.n && !r.usdSinConv) return sec(titulo, `<div class="empty"><div class="e-ico">${ICON.tag}</div>Aún no registras gastos este mes.</div>`);
  return sec(titulo, `<div class="goal-nums" style="margin-bottom:6px"><span class="big">${money(r.total)}</span><span class="of">${plural(r.n, 'gasto', 'gastos')}${r.usdSinConv ? `<br>+ ${money(r.usdSinConv, 'USD')} sin convertir` : ''}</span></div>
    ${catRowsHTML(r, 6)}${leyendaNiveles()}
    <div class="card-note">${r.empresa.n ? `Pagado por la empresa (aparte, no cuenta): ${money(r.empresa.total)}. ` : ''}<button class="link-btn" data-action="tab" data-tab="analisis">Ver análisis completo</button></div>`);
}
function planCardHTML(pl, compacto = false) {
  const ip = infoPlan(pl);
  const facts = [];
  if (ip.falta > 0) facts.push(`<span>Te faltan <b>${money(ip.falta)}</b></span>`);
  else if (ip.meta) facts.push('<span><b>¡Meta alcanzada!</b> 🎉</span>');
  if (pl.modo === 'neto') facts.push('<span>Usa tu saldo de ahorro neto (líquido − deudas)</span>');
  if (ip.llegada) facts.push(`<span>A tu ritmo (${money(S.ajustes.ahorroMensual)}/mes) llegarías en <b>${MESES[ip.llegada.getMonth()]} ${ip.llegada.getFullYear()}</b> · estimado</span>`);
  if (ip.necesario != null) facts.push(`<span>Para el ${fMedia(pl.fechaObjetivo)} necesitas <b>${money(ip.necesario)}</b> al mes</span>`);
  return `<section class="card">
    <div class="plan-head"><div class="plan-ico">${esc(pl.icono)}</div><div class="row-main"><h3>${esc(pl.nombre)}</h3>${pl.motivo ? `<p>${esc(pl.motivo)}</p>` : ''}</div>
    <button class="link-btn" data-action="edit-plan" data-id="${pl.id}">Editar</button></div>
    <div class="progress"><i style="width:${(ip.prog * 100).toFixed(1)}%"></i></div>
    <div class="goal-nums"><span class="big">${money(ip.ah)}</span><span class="of">de ${money(ip.meta)}<br>${pct(ip.prog)}</span></div>
    <div class="facts">${facts.join('')}</div>
    ${!compacto && pl.modo === 'manual' ? `<div class="btn-row" style="margin-top:12px"><button class="btn" data-action="aporte-plan" data-id="${pl.id}" data-signo="1">+ Aportar</button><button class="btn" data-action="aporte-plan" data-id="${pl.id}" data-signo="-1">− Retirar</button></div>` : ''}
  </section>`;
}
function metaDeptoHTML() {
  const pl = getPlan('departamento') || S.planes[0];
  return pl ? planCardHTML(pl, true) : '';
}
function proyeccionHTML(p) {
  const a = S.ajustes;
  const fecha = a.proyFecha;
  const am = a.ahorroMensual;
  let res = '<div class="card-note">Elige una fecha y escribe cuánto ahorras al mes.</div>';
  if (fecha && am != null) {
    const meses = mesesHasta(fecha);
    const base = p.conSaldo ? p.neto : 0;
    const total = base + am * meses;
    const depto = getPlan('departamento');
    let extra = '';
    if (depto) { const ip = infoPlan(depto); if (ip.llegada) extra = `<p>A este ritmo llegarías a la cuota inicial del depa en ${MESES[ip.llegada.getMonth()]} ${ip.llegada.getFullYear()}.</p>`; }
    res = `<div class="proy-result"><span class="eyebrow">Al ${fMedia(fecha)} tendrías aprox.</span><div class="big">${money(total)}</div>
      <p>${p.conSaldo ? `Saldo neto hoy ${money(base)}` : 'Sin saldos cargados: parte de S/ 0'} + ${money(am)} × ${meses.toLocaleString('es-PE', { maximumFractionDigits: 1 })} meses.</p>${extra}
      <p><b>Es una estimación:</b> no considera intereses, imprevistos ni cambios en tus gastos.</p></div>`;
  }
  return sec('Proyección', `<div class="grid2">
      <label class="field"><span>Fecha futura</span><input type="date" data-bind="proyFecha" min="${hoyISO()}" value="${esc(fecha || '')}"></label>
      <label class="field"><span>Ahorro mensual (S/)</span><input inputmode="decimal" data-bind="ahorroMensual" placeholder="0.00" value="${am ?? ''}"></label>
    </div>${res}`, '<span class="badge badge-warn">Estimación</span>');
}
function consejosHTML(n) {
  const all = consejos();
  const list = n ? all.slice(0, n) : all;
  const body = list.map((t) => `<div class="tip ${t.tono}"><div class="t-ico">${esc(t.icono)}</div><div>${esc(t.texto)}${t.accion ? `<button class="link-btn" data-action="${t.accion.action}" ${t.accion.tab ? `data-tab="${t.accion.tab}"` : ''}>${esc(t.accion.label)} →</button>` : ''}</div></div>`).join('');
  const more = n && all.length > n ? `<button class="link-btn" data-action="tab" data-tab="planes" data-scroll="sec-consejos">Ver los ${all.length} consejos</button>` : '';
  return sec(`${ICON.spark} Consejos para ti`, body + more, '', n ? '' : 'sec-consejos');
}

/* ---------------- MOVIMIENTOS ---------------- */
function filtrarMovs() {
  const q = norm(ui.q);
  return S.movimientos.filter((m) => {
    if (!q && mesKey(m.fecha) !== ui.mesMov) return false;
    if (ui.filtro === 'empresa') { if (!m.empresa) return false; }
    else {
      if (m.empresa) return false;
      if (ui.filtro === 'gasto' && m.tipo !== 'gasto') return false;
      if (ui.filtro === 'ingreso' && m.tipo !== 'ingreso') return false;
      if (ui.filtro === 'pago' && m.tipo !== 'pago') return false;
      if (ui.filtro === 'porconfirmar' && !(m.tipo === 'gasto' && (!m.cuentaId || !m.categoriaId))) return false;
    }
    if (q) {
      const hay = norm(`${m.descripcion} ${nombreCuenta(m.cuentaId) || ''} ${getCat(m.categoriaId)?.nombre || ''} ${m.nota} ${m.monto}`);
      if (!hay.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => (a.fecha === b.fecha ? b.creado - a.creado : a.fecha < b.fecha ? 1 : -1));
}
function movItemHTML(m) {
  const cu = getCuenta(m.cuentaId);
  const cat = getCat(m.categoriaId);
  const tags = [];
  let sub = '';
  if (m.tipo === 'gasto') {
    sub = `${cu ? esc(cu.nombre) : 'Cuenta por confirmar'} · ${cat ? esc(cat.nombre) : 'Categoría por confirmar'}`;
    if (!cu || !cat) tags.push('<span class="badge badge-warn">Por confirmar</span>');
    const v = toPEN(m);
    if (v != null && v > 0 && v <= umbralHormiga() && !m.empresa) tags.push('<span class="badge badge-gray">🐜 Hormiga</span>');
  } else if (m.tipo === 'ingreso') sub = `Ingreso a ${cu ? esc(cu.nombre) : 'cuenta por confirmar'}`;
  else sub = `${cu ? esc(cu.nombre) : 'Origen por confirmar'} → ${esc(nombreCuenta(m.destinoId) || 'tarjeta')}`;
  if (m.empresa) tags.push('<span class="badge">Empresa</span>');
  if (m.montoCargo != null) tags.push(`<span class="badge badge-gray">Cargo ${money(m.montoCargo, 'USD')}</span>`);
  if (m.yaEnSaldo) tags.push('<span class="badge badge-gray">Ya en saldo</span>');
  if (m.demo) tags.push('<span class="badge badge-gray">Ejemplo</span>');
  const ico = m.tipo === 'ingreso' ? ICON.arrowIn : m.tipo === 'pago' ? ICON.swap : cu?.tipo === 'credito' ? ICON.card : cu?.tipo === 'billetera' ? ICON.phone : cu?.tipo === 'efectivo' ? ICON.cash : ICON.tag;
  const sign = m.tipo === 'ingreso' ? '+' : m.tipo === 'gasto' ? '−' : '';
  const cls = m.tipo === 'ingreso' ? 'amt-ingreso' : m.tipo === 'pago' ? 'amt-pago' : '';
  return `<button class="row" data-action="edit-mov" data-id="${m.id}">
    <div class="ico">${ico}</div>
    <div class="row-main"><div class="row-title">${esc(m.descripcion || (m.tipo === 'pago' ? 'Pago de tarjeta' : '(sin descripción)'))}</div><div class="row-sub">${sub}</div>${tags.length ? `<div class="tags">${tags.join('')}</div>` : ''}</div>
    <div class="row-end ${cls}">${sign}${money(m.monto, m.moneda)}</div></button>`;
}
function listaMovsHTML() {
  const movs = filtrarMovs();
  if (!movs.length) return `<div class="empty"><div class="e-ico">${ICON.list}</div>${ui.q ? 'No encontré movimientos con esa búsqueda.' : 'No hay movimientos aquí.'}<br><br><button class="btn btn-primary" data-action="nuevo-mov" data-tipo="gasto">+ Registrar gasto</button></div>`;
  const grupos = new Map();
  movs.forEach((m) => { if (!grupos.has(m.fecha)) grupos.set(m.fecha, []); grupos.get(m.fecha).push(m); });
  return [...grupos.entries()].map(([f, ms]) => {
    const tot = ms.filter((m) => m.tipo === 'gasto').reduce((s, m) => s + (toPEN(m) || 0), 0);
    return `<div class="day-head"><span>${cap(fLarga(f))}${f.slice(0, 4) !== String(new Date().getFullYear()) ? ` ${f.slice(0, 4)}` : ''}</span>${tot ? `<b>${money(tot)}</b>` : ''}</div><div class="day-group">${ms.map(movItemHTML).join('')}</div>`;
  }).join('');
}
function vMovimientos() {
  const enMes = S.movimientos.filter((m) => mesKey(m.fecha) === ui.mesMov);
  const cnt = {
    todos: enMes.filter((m) => !m.empresa).length,
    gasto: enMes.filter((m) => !m.empresa && m.tipo === 'gasto').length,
    ingreso: enMes.filter((m) => !m.empresa && m.tipo === 'ingreso').length,
    pago: enMes.filter((m) => !m.empresa && m.tipo === 'pago').length,
    porconfirmar: enMes.filter((m) => !m.empresa && m.tipo === 'gasto' && (!m.cuentaId || !m.categoriaId)).length,
    empresa: enMes.filter((m) => m.empresa).length,
  };
  const labels = { todos: 'Todos', gasto: 'Gastos', ingreso: 'Ingresos', pago: 'Pagos', porconfirmar: 'Por confirmar', empresa: 'Pagado por empresa' };
  const r = resumenMes(ui.mesMov);
  const resumen = ui.filtro === 'empresa'
    ? `<div class="banner"><div class="b-ico">${ICON.building}</div><div><b>Pagado por la empresa: ${money(r.empresa.total)}</b>Lista aparte. Estos gastos no entran en tu ahorro ni en tus totales.</div></div>`
    : `<div class="tiles"><div class="tile"><span>Gastado</span><strong>${money(r.total)}</strong></div><div class="tile"><span>Ingresos</span><strong>${money(r.ingresos)}</strong></div></div>`;
  return `<h1 class="view-title">Movimientos</h1>
    ${monthNavHTML(ui.mesMov, 'mes-mov')}
    <label class="field search">${ICON.search}<input type="search" id="buscar" placeholder="Buscar en todos los meses" value="${esc(ui.q)}" autocomplete="off"></label>
    <div class="chips">${Object.keys(labels).map((k) => `<button class="chip ${ui.filtro === k ? 'on' : ''}" data-action="filtro" data-v="${k}">${labels[k]} <span class="n">${cnt[k]}</span></button>`).join('')}</div>
    ${resumen}
    <div id="mov-lista">${listaMovsHTML()}</div>`;
}
function monthNavHTML(mk, action) {
  const next = mesMover(mk, 1);
  return `<div class="month-nav"><button data-action="${action}" data-d="-1" aria-label="Mes anterior">${ICON.left}</button><b>${mesNombre(mk)}</b><button data-action="${action}" data-d="1" aria-label="Mes siguiente" ${next > hoyMk() ? 'disabled' : ''}>${ICON.right}</button></div>`;
}

/* ---------------- ANÁLISIS ---------------- */
function donutHTML(r) {
  const orden = ['necesario', 'moderado', 'prescindible', 'sin'];
  const segs = orden.map((k) => ({ k, v: r.porNivel[k] })).filter((s) => s.v > 0);
  const R = 52, C = 2 * Math.PI * R, gap = segs.length > 1 ? 2.5 : 0;
  let off = 0;
  const arcs = segs.map((s) => {
    const len = (s.v / r.total) * C;
    const dash = Math.max(0.5, len - gap);
    const stroke = s.k === 'sin' ? 'url(#hatch)' : NIVELES[s.k].color;
    const el = `<circle r="${R}" cx="70" cy="70" fill="none" stroke="${stroke}" stroke-width="18" stroke-dasharray="${dash.toFixed(2)} ${(C - dash).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"><title>${NIVELES[s.k].nombre}: ${money(s.v)}</title></circle>`;
    off += len;
    return el;
  }).join('');
  const legend = orden.map((k) => `<div class="dl-row"><i class="dot dot-${k}"></i><span class="name">${NIVELES[k].nombre}</span><span class="val">${money0(r.porNivel[k])}<small>${pct(r.total ? r.porNivel[k] / r.total : 0)}</small></span></div>`).join('');
  return `<div class="donut-wrap"><svg viewBox="0 0 140 140" role="img" aria-label="Gasto por nivel de necesidad">
    <defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#5a1d1d"/><rect width="3" height="6" fill="#d03b3b"/></pattern></defs>
    <circle r="${R}" cx="70" cy="70" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="18"/>
    <g transform="rotate(-90 70 70)">${arcs}</g>
    <text x="70" y="66" text-anchor="middle" fill="#a9b4cc" font-size="10" font-family="-apple-system,system-ui">Total</text>
    <text x="70" y="83" text-anchor="middle" fill="#f3f6ff" font-size="15" font-weight="700" font-family="-apple-system,system-ui">${money0(r.total)}</text>
  </svg><div class="donut-legend">${legend}</div></div>`;
}
function trendHTML(mkFin) {
  const meses = [];
  for (let i = 5; i >= 0; i--) meses.push(mesMover(mkFin, -i));
  const vals = meses.map((mk) => resumenMes(mk).total);
  const max = Math.max(...vals, 1);
  const prom = vals.filter((v) => v > 0);
  const avg = prom.length ? prom.reduce((a, b) => a + b, 0) / prom.length : 0;
  const sel = ui.trendSel != null && ui.trendSel < 6 ? ui.trendSel : 5;
  const W = 320, H = 150, top = 12, base = 122, bw = 30, step = W / 6;
  const y = (v) => base - (v / max) * (base - top);
  const barPath = (x, yTop, w) => {
    const h = base - yTop;
    if (h <= 0.5) return '';
    const r = Math.min(4, h / 2, w / 2);
    return `M${x},${base} V${yTop + r} Q${x},${yTop} ${x + r},${yTop} H${x + w - r} Q${x + w},${yTop} ${x + w},${yTop + r} V${base} Z`;
  };
  const bars = meses.map((mk, i) => {
    const x = i * step + (step - bw) / 2;
    const on = i === sel;
    return `<path d="${barPath(x, y(vals[i]), bw)}" fill="#3987e5" opacity="${on ? 1 : 0.45}"/>
      <text x="${x + bw / 2}" y="${base + 16}" text-anchor="middle" ${on ? 'fill="#f3f6ff" font-weight="700"' : ''}>${mesCorto(mk)}</text>
      <rect class="hit" x="${i * step}" y="0" width="${step}" height="${H}" data-action="trend-sel" data-i="${i}"><title>${mesNombre(mk)}: ${money(vals[i])}</title></rect>`;
  }).join('');
  const avgLine = avg ? `<line class="avg" x1="0" x2="${W}" y1="${y(avg)}" y2="${y(avg)}"/>` : '';
  return `<div class="chart-readout"><span>${mesNombre(meses[sel])}</span><b>${money(vals[sel])}</b></div>
    ${avg ? `<div class="card-note" style="margin:0 0 6px">Línea punteada = promedio de los meses con gastos: ${money0(avg)}</div>` : ''}
    <svg class="trend" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gasto de los últimos 6 meses">
      <line class="base" x1="0" x2="${W}" y1="${base}" y2="${base}"/>${avgLine}${bars}</svg>
    <div class="card-note">Toca una barra para ver el monto de ese mes.</div>`;
}
function vAnalisis() {
  const mk = ui.mesAn;
  const r = resumenMes(mk);
  const t = hoyDate();
  const diasMes = mk === hoyMk() ? t.getDate() : finDeMes(Number(mk.slice(0, 4)), Number(mk.slice(5, 7)) - 1);
  const balance = r.ingresos - r.total;
  const tiles = `<div class="tiles">
    <div class="tile"><span>Gastado</span><strong>${money(r.total)}</strong><small>${plural(r.n, 'gasto', 'gastos')}</small></div>
    <div class="tile"><span>Ingresos</span><strong>${money(r.ingresos)}</strong><small>registrados</small></div>
    <div class="tile"><span>Balance del mes</span><strong>${r.ingresos ? money(balance) : '—'}</strong><small>${r.ingresos ? (balance >= 0 ? 'ingresos − gastos' : 'gastaste de más') : 'registra tus ingresos'}</small></div>
    <div class="tile"><span>Promedio diario</span><strong>${money(r.total / Math.max(1, diasMes))}</strong><small>en ${diasMes} días</small></div>
    <div class="tile"><span>Gasto mayor</span><strong>${r.mayor ? money(r.mayor.v) : '—'}</strong><small>${r.mayor ? esc(r.mayor.m.descripcion || '(sin descripción)') : 'sin gastos'}</small></div>
    <div class="tile"><span>Por confirmar</span><strong>${r.porConfirmar}</strong><small>sin cuenta o categoría</small></div>
  </div>`;
  if (!r.n) {
    return `<h1 class="view-title">Análisis</h1>${monthNavHTML(mk, 'mes-an')}${tiles}
      ${sec('Tendencia de 6 meses', trendHTML(mk))}
      <div class="card"><div class="empty"><div class="e-ico">${ICON.chart}</div>No hay gastos en ${mesNombre(mk)}.</div></div>`;
  }
  const hItems = [...r.hormiga.items.values()].sort((a, b) => b.total - a.total).slice(0, 5);
  const esMesActual = mk === hoyMk();
  const anual = esMesActual ? (r.hormiga.total / t.getDate()) * 365 : r.hormiga.total * 12;
  const hormiga = r.hormiga.n
    ? `<div class="goal-nums"><span class="ant-big">${money(r.hormiga.total)}</span><span class="of">${plural(r.hormiga.n, 'gasto', 'gastos')}<br>${pct(r.hormiga.total / r.total)} del total</span></div>
       <div class="facts" style="margin-bottom:8px"><span>Promedio por gasto: <b>${money(r.hormiga.total / r.hormiga.n)}</b></span><span>A este ritmo al año: <b>${money0(anual)}</b> · estimado</span></div>
       <div class="list">${hItems.map((h) => `<div class="row"><div class="row-main"><div class="row-title">${esc(h.nombre)}</div><div class="row-sub">${plural(h.n, 'vez', 'veces')}</div></div><div class="row-end">${money(h.total)}</div></div>`).join('')}</div>`
    : '<div class="card-note">Sin gastos hormiga este mes. 👌</div>';
  const cuentas = [...r.porCuenta.values()].sort((a, b) => b.total - a.total);
  const maxC = cuentas[0]?.total || 1;
  const porCuenta = cuentas.map((c) => `<div class="cat-row"><div class="cat-top"><span class="name">${esc(c.nombre)}</span><span class="val">${money(c.total)}</span><span class="pc">${pct(c.total / r.total)}</span></div><div class="bar" style="margin-left:0"><i class="azul" style="width:${Math.max(2, (c.total / maxC) * 100).toFixed(1)}%"></i></div></div>`).join('');
  return `<h1 class="view-title">Análisis</h1>${monthNavHTML(mk, 'mes-an')}${tiles}
    ${sec('¿Qué tan necesario fue tu gasto?', donutHTML(r) + (r.usdSinConv ? `<div class="card-note">+ ${money(r.usdSinConv, 'USD')} sin convertir (falta tipo de cambio).</div>` : ''))}
    ${sec('Gasto por categoría', catRowsHTML(r) + leyendaNiveles())}
    ${sec('Tendencia de 6 meses', trendHTML(mk))}
    ${sec(`${ICON.ant} Gastos hormiga`, hormiga, `<span class="badge badge-gray">hasta ${money0(umbralHormiga())}</span>`)}
    ${sec('Por cuenta o tarjeta', porCuenta)}
    ${sec(`${ICON.building} Pagado por la empresa`, `<div class="goal-nums"><span class="big">${money(r.empresa.total)}</span><span class="of">${plural(r.empresa.n, 'gasto', 'gastos')}</span></div><div class="card-note">Lista aparte: no entra en tu ahorro ni en los totales de arriba. <button class="link-btn" data-action="ver-empresa">Ver lista</button></div>`)}`;
}

/* ---------------- PLANES ---------------- */
function vPlanes() {
  const am = S.ajustes.ahorroMensual;
  return `<h1 class="view-title">Planes de ahorro</h1>
    <p class="view-sub">Tus metas con su motivo. Todo editable.</p>
    ${sec('Tu ahorro mensual', `<label class="field"><span>¿Cuánto ahorras al mes? (lo escribes tú)</span><input inputmode="decimal" data-bind="ahorroMensual" placeholder="0.00" value="${am ?? ''}"></label><div class="card-note">Se usa para estimar cuándo llegas a cada meta y para la proyección.</div>`)}
    ${S.planes.map((p) => planCardHTML(p)).join('')}
    <button class="btn btn-block" data-action="nuevo-plan">+ Nuevo plan de ahorro</button>
    ${consejosHTML(0)}`;
}

/* ---------------- AJUSTES ---------------- */
function vAjustes() {
  const d = diasSinExportar();
  const a = S.ajustes;
  const cuentaRow = (c) => {
    const s = saldoActual(c);
    const ico = c.tipo === 'credito' ? ICON.card : c.tipo === 'billetera' ? ICON.phone : c.tipo === 'efectivo' ? ICON.cash : ICON.bank;
    let sub = TIPOS_CUENTA[c.tipo] + ` · ${c.moneda}`;
    if (lineaPrincipal(c)) sub += ` · límite compartido con ${esc(lineaPrincipal(c).nombre)}`;
    else if (compartenCon(c).length) sub += ` · límite compartido con ${compartenCon(c).map((x) => esc(x.nombre)).join(', ')}`;
    if (c.tipo === 'billetera') sub = c.asociadaA ? `Sale de ${esc(nombreCuenta(c.asociadaA))}` : `Asociada a ${esc(c.asociadaTexto || '—')} · sin vincular`;
    const end = c.tipo === 'billetera' ? '' : s == null ? '<span class="muted">Sin saldo</span>' : `${money(s, c.moneda)}<small>${c.tipo === 'credito' ? 'deuda' : 'saldo'}</small>`;
    return `<button class="set-row" data-action="edit-cuenta" data-id="${c.id}"><div class="ico">${ico}</div><div class="row-main"><div class="row-title">${esc(c.nombre)}${c.ultimos4 ? ` <span class="muted">•••• ${esc(c.ultimos4)}</span>` : ''}${c.activa ? '' : ' <span class="badge badge-gray">oculta</span>'}</div><div class="row-sub">${sub}</div></div><div class="row-end">${end}</div><span class="chev">${ICON.chevron}</span></button>`;
  };
  const instalada = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  return `<h1 class="view-title">Ajustes</h1>
    ${instalada ? '' : `<div class="banner"><div class="b-ico">${ICON.phone}</div><div><b>Instálala en tu iPhone</b>En Safari toca Compartir → «Agregar a inicio». Así abre a pantalla completa, sin internet, y tus datos quedan protegidos.</div></div>`}
    ${sec(`${ICON.shield} Respaldo`, `<div class="facts" style="margin-top:0"><span>Datos en esta app: <b>${resumenDatos(S).texto}</b></span><span>Último respaldo: <b>${d == null ? 'nunca' : d === 0 ? 'hoy' : `hace ${plural(d, 'día', 'días')}`}</b></span></div>
      <div class="btn-row" style="margin-top:12px"><button class="btn btn-primary" data-action="exportar">${ICON.down} Exportar</button><button class="btn" data-action="importar">${ICON.upload} Importar</button></div>
      <div class="card-note">Exportar crea un archivo JSON (para restaurar) y uno CSV (para Excel/Numbers): en el menú elige «Guardar en Archivos» → iCloud Drive. Importar sirve para restaurar un respaldo o para agregar movimientos desde un archivo (te muestra la lista antes de agregar).</div>`, '', 'sec-respaldo')}
    ${sec('Cuentas y tarjetas', `<div class="list">${S.cuentas.map(cuentaRow).join('')}</div><button class="btn btn-block" style="margin-top:10px" data-action="nueva-cuenta">+ Agregar cuenta</button>
      <div class="card-note">Solo guardamos el nombre y, si quieres, los últimos 4 dígitos. Nunca el número completo.</div>`, '', 'sec-cuentas')}
    ${sec('📌 Gastos fijos', `${S.fijos.length ? `<div class="list">${S.fijos.map((f) => `<button class="set-row" data-action="edit-fijo" data-id="${f.id}"><div class="row-main"><div class="row-title">${esc(f.descripcion || 'Gasto fijo')}${f.activo ? '' : ' <span class="badge badge-gray">pausado</span>'}</div><div class="row-sub">Día ${f.dia} · ${esc(nombreCuenta(f.cuentaId) || 'Cuenta por confirmar')} · ${esc(getCat(f.categoriaId)?.nombre || 'Por confirmar')}</div></div><div class="row-end">${money(f.monto, f.moneda)}</div><span class="chev">${ICON.chevron}</span></button>`).join('')}</div>
      <div class="facts"><span>Total al mes: <b>${money(fijosMes().total)}</b></span></div>` : '<div class="card-note" style="margin-top:0">Lo que pagas todos los meses: alquiler, internet, celular, streaming, gimnasio…</div>'}
      <button class="btn btn-block" style="margin-top:10px" data-action="nuevo-fijo">+ Agregar gasto fijo</button>
      <div class="card-note">También puedes activar «Repetir cada mes» al registrar un gasto.</div>`, '', 'sec-fijos')}
    ${sec(`${ICON.mic} Registro rápido y Siri`, `<label class="switch"><input type="checkbox" data-bind-check="abrirEnGasto" ${S.ajustes.abrirEnGasto ? 'checked' : ''}><span class="switch-ui"></span><span class="switch-txt"><b>Al abrir, ir directo a «+ Gasto»</b><small>Tocas el ícono y ya puedes dictar.</small></span></label>
      <button class="btn btn-block" style="margin-top:10px" data-action="pasos-siri">Ver pasos para usar Siri</button>`, '', 'sec-siri')}
    ${sec('Parámetros', `<div class="facts" style="margin-top:0">
        <span>Tipo de cambio: <b>${a.tc ? `S/ ${fmt.format(a.tc)} por US$ 1` : 'sin ingresar'}</b></span>
        <span>Ahorro mensual: <b>${a.ahorroMensual != null ? money(a.ahorroMensual) : 'sin ingresar'}</b></span>
        <span>Presupuesto mensual: <b>${a.presupuesto ? money(a.presupuesto) : 'sin ingresar'}</b></span>
        <span>Gasto hormiga: <b>hasta ${money(umbralHormiga())}</b></span></div>
      <button class="btn btn-block" style="margin-top:12px" data-action="sheet-param">Editar parámetros</button>`)}
    ${sec('Categorías', `<div class="list">${S.categorias.map((c) => `<button class="set-row" data-action="edit-cat" data-id="${c.id}"><span class="dot dot-${c.nivel}"></span><div class="row-main"><div class="row-title">${esc(c.nombre)}</div><div class="row-sub">${NIVELES[c.nivel].nombre}</div></div><span class="chev">${ICON.chevron}</span></button>`).join('')}</div>
      <button class="btn btn-block" style="margin-top:10px" data-action="nueva-cat">+ Agregar categoría</button>${leyendaNiveles()}`)}
    ${sec('Datos de ejemplo', `<div class="card-note" style="margin-top:0">Datos ficticios para probar la app. Al borrarlos, tus cuentas vuelven a como estaban.</div>
      <div class="btn-row" style="margin-top:12px"><button class="btn" data-action="cargar-ejemplo" ${S.ejemplo ? 'disabled' : ''}>Cargar ejemplo</button><button class="btn btn-danger" data-action="borrar-ejemplo" ${S.ejemplo ? '' : 'disabled'}>Borrar ejemplo</button></div>`)}
    ${sec('Privacidad', `<ul class="privacy"><li>Tus datos se guardan solo en este iPhone.</li><li>No hay cuentas, login ni servidor. La app no puede enviar datos a ningún sitio.</li><li>Si borras Safari/la app sin exportar, pierdes los datos: exporta cada semana.</li></ul>
      <button class="btn btn-danger btn-block" style="margin-top:8px" data-action="borrar-todo">Borrar todos mis datos</button>`)}
    <img class="foot-logo" src="splash.jpg" alt="Zafiro · El valor de tener el control" loading="lazy">
    <div class="foot">Versión ${APP_VERSION} · Finanzas privadas</div>`;
}

const VIEWS = { inicio: vInicio, movimientos: vMovimientos, analisis: vAnalisis, planes: vPlanes, ajustes: vAjustes };

/* ---------------- Hoja inferior ---------------- */
let sheetDirty = false;
function openSheet(html, onMount) {
  $('#sheet-body').innerHTML = html;
  $('#sheet').hidden = false;
  document.body.classList.add('locked');
  sheetDirty = false;
  $('.sheet-panel').scrollTop = 0;
  if (onMount) onMount($('#sheet-body'));
}
function closeSheet(force = false) {
  if (!force && sheetDirty && !confirm('¿Descartar lo que escribiste? No se guardará.')) return;
  $('#sheet').hidden = true;
  $('#sheet-body').innerHTML = '';
  document.body.classList.remove('locked');
  sheetDirty = false;
}
const head = (t) => `<div class="sheet-head"><h2>${t}</h2><button type="button" class="icon-btn" data-action="close-sheet" aria-label="Cerrar">${ICON.x}</button></div>`;

/* ----- Movimiento ----- */
function opcionesCuenta(sel, tipo) {
  const act = S.cuentas.filter((c) => c.activa || c.id === sel);
  const op = (c) => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${esc(c.nombre)}${c.tipo === 'billetera' ? ` (${esc(c.asociadaA ? nombreCuenta(c.asociadaA) : c.asociadaTexto || 'sin vincular')})` : ''}${c.moneda === 'USD' ? ' · USD' : ''}</option>`;
  const liq = act.filter((c) => c.tipo !== 'credito');
  const cred = act.filter((c) => c.tipo === 'credito');
  let h = `<option value="" ${!sel ? 'selected' : ''}>Por confirmar</option>`;
  if (tipo === 'pago') return h + liq.map(op).join('');
  if (cred.length) h += `<optgroup label="Tarjetas de crédito">${cred.map(op).join('')}</optgroup>`;
  h += `<optgroup label="Cuentas, billeteras y efectivo">${liq.map(op).join('')}</optgroup>`;
  return h;
}
function opcionesTarjeta(sel) {
  return `<option value="">Elige la tarjeta</option>` + S.cuentas.filter((c) => c.tipo === 'credito' && (c.activa || c.id === sel)).map((c) => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${esc(c.nombre)} · ${c.moneda}</option>`).join('');
}
function opcionesCategoria(sel) {
  let h = `<option value="" ${!sel ? 'selected' : ''}>Por confirmar</option>`;
  for (const nv of ['necesario', 'moderado', 'prescindible']) {
    const cs = S.categorias.filter((c) => c.nivel === nv);
    if (cs.length) h += `<optgroup label="${NIVELES[nv].nombre}">${cs.map((c) => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${esc(c.nombre)}</option>`).join('')}</optgroup>`;
  }
  return h;
}
function sheetMov(m, tipoInicial = 'gasto', preset = null) {
  const edit = !!m;
  m = m || { tipo: tipoInicial, monto: null, moneda: 'PEN', montoCargo: null, descripcion: '', cuentaId: '', destinoId: '', categoriaId: '', fecha: hoyISO(), empresa: false, nota: '', fijoId: '', ...(preset || {}) };
  const fijo = getFijo(m.fijoId);
  const html = `<form data-form="mov" class="form" autocomplete="off" novalidate ${edit ? '' : 'data-nuevo="1"'}>
    <input type="hidden" name="id" value="${esc(m.id || '')}">
    <input type="hidden" name="tipo" value="${m.tipo}">
    <input type="hidden" name="fijoId" value="${esc(m.fijoId || '')}">
    <input type="hidden" name="moneda" value="${m.moneda}">
    ${head(edit ? 'Editar movimiento' : 'Nuevo movimiento')}
    <div class="seg">${[['gasto', 'Gasto'], ['ingreso', 'Ingreso'], ['pago', 'Pago tarjeta']].map(([k, l]) => `<button type="button" data-action="mov-tipo" data-v="${k}" class="${m.tipo === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    ${fijo ? `<div class="banner"><div class="b-ico">📌</div><div><b>Gasto fijo: ${esc(fijo.descripcion)}</b>Revisa el monto (si este mes fue distinto, cámbialo) y guarda.</div></div>` : ''}
    ${edit || fijo ? '' : `<div class="dictado"><label for="f-dictado"><span class="mic">${ICON.mic}</span> Dicta o escribe en una línea</label>
      <input id="f-dictado" name="dictado" type="text" placeholder="Ej: almuerzo 12 soles Yape" enterkeyhint="done" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
      <small>Toca el micrófono 🎙 del teclado y habla. Yo lleno los campos; tú revisas antes de guardar.</small>
      <button type="button" class="link-btn" data-action="pegar-dictado">📋 Pegar lo que dictaste con Siri</button>
      <div class="sugerencia" id="sugerencia" hidden></div></div>`}
    <div class="monto-box"><span class="monto-cur" id="monto-cur">${sym(m.moneda)}</span>
      <input name="monto" class="monto-input" inputmode="decimal" placeholder="0.00" value="${m.monto ?? ''}" aria-label="Monto">
      <div class="seg seg-mini">${['PEN', 'USD'].map((c) => `<button type="button" data-action="mov-moneda" data-v="${c}" class="${m.moneda === c ? 'on' : ''}">${c}</button>`).join('')}</div></div>
    <label class="field" data-show="cargo"><span>Monto cargado en dólares (opcional)</span><input name="montoCargo" inputmode="decimal" placeholder="US$ 0.00" value="${m.montoCargo ?? ''}">
      <small>Compras en soles pero la tarjeta te cobra en dólares: anota aquí lo que te cargan en US$. Se guardan los dos montos.</small></label>
    <label class="field"><span>Descripción</span><input name="descripcion" value="${esc(m.descripcion)}" placeholder="¿En qué fue?" autocapitalize="sentences"></label>
    <label class="field"><span id="lbl-cuenta">Pagado con</span><select name="cuentaId">${opcionesCuenta(m.cuentaId, m.tipo)}</select><small id="hint-cuenta"></small></label>
    <label class="field" data-show="destino"><span>Tarjeta que pagas</span><select name="destinoId">${opcionesTarjeta(m.destinoId)}</select></label>
    <label class="field" data-show="categoria"><span>Categoría</span><select name="categoriaId">${opcionesCategoria(m.categoriaId)}</select></label>
    <label class="field"><span>Fecha</span><input type="date" name="fecha" value="${m.fecha}"></label>
    <label class="switch" data-show="ensaldo"><input type="checkbox" name="yaEnSaldo" ${m.yaEnSaldo ? 'checked' : ''}><span class="switch-ui"></span><span class="switch-txt"><b>Ya está incluido en el saldo que cargaste</b><small>Es anterior al <span id="ensaldo-fecha"></span>, cuando pusiste el saldo de esta cuenta. Se guarda para tus análisis sin descontarlo otra vez.</small></span></label>
    <label class="switch" data-show="empresa"><input type="checkbox" name="empresa" ${m.empresa ? 'checked' : ''}><span class="switch-ui"></span><span class="switch-txt"><b>Pagado por la empresa</b><small>Va a una lista aparte y no entra en tu ahorro.</small></span></label>
    <label class="field"><span>Nota (opcional)</span><input name="nota" value="${esc(m.nota)}"></label>
    ${edit || fijo ? '' : `<label class="switch" data-show="categoria"><input type="checkbox" name="repetir"><span class="switch-ui"></span><span class="switch-txt"><b>Repetir cada mes (gasto fijo)</b><small>Lo guardo como gasto fijo y cada mes te recuerdo registrarlo.</small></span></label>`}
    <div class="sheet-actions"><button type="submit" class="btn btn-primary btn-xl" id="btn-guardar">Guardar</button>
      ${edit ? `<button type="button" class="btn btn-danger" data-action="mov-borrar" data-id="${m.id}">Borrar movimiento</button>` : ''}</div>
  </form>`;
  openSheet(html, (root) => {
    const f = $('form', root);
    syncMovForm(f);
    f.addEventListener('input', onMovInput);
    f.addEventListener('change', onMovInput);
    const dic = f.elements.dictado;
    if (dic) dic.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); dic.blur(); } });
  });
}
function onMovInput(e) {
  const f = e.currentTarget;
  const t = e.target;
  sheetDirty = true;
  if (t.name === 'dictado') aplicarDictado(f);
  else if (t.name) t.dataset.touched = '1';
  syncMovForm(f);
}
function syncMovForm(f) {
  const tipo = f.elements.tipo.value;
  const moneda = f.elements.moneda.value;
  $$('[data-action="mov-tipo"]', f).forEach((b) => b.classList.toggle('on', b.dataset.v === tipo));
  $$('[data-action="mov-moneda"]', f).forEach((b) => b.classList.toggle('on', b.dataset.v === moneda));
  $('#monto-cur', f).textContent = sym(moneda);
  const selCu = f.elements.cuentaId.value;
  const objetivo = tipo === 'pago' ? resolveCuenta(f.elements.destinoId.value) : resolveCuenta(selCu);
  const cargo = tipo !== 'ingreso' && objetivo && objetivo.tipo === 'credito' && objetivo.moneda === 'USD' && moneda === 'PEN';
  // ¿Es un movimiento anterior al día en que cargaste el saldo de esa cuenta? Entonces ya está dentro del saldo.
  const fechaSaldo = (c) => (c && c.saldoTs ? iso(new Date(c.saldoTs)) : null);
  const fechas = [resolveCuenta(selCu), tipo === 'pago' ? resolveCuenta(f.elements.destinoId.value) : null].map(fechaSaldo).filter(Boolean);
  const fMov = f.elements.fecha.value;
  const ensaldo = !!fMov && fechas.some((fs) => fMov < fs);
  const chk = f.elements.yaEnSaldo;
  if (ensaldo && f.dataset.nuevo && !chk.dataset.touched) chk.checked = true;
  if (ensaldo) $('#ensaldo-fecha', f).textContent = fCorta(fechas.sort()[0]);
  const show = { cargo, destino: tipo === 'pago', categoria: tipo === 'gasto', empresa: tipo === 'gasto', ensaldo };
  $$('[data-show]', f).forEach((el) => { el.hidden = !show[el.dataset.show]; });
  $('#lbl-cuenta', f).textContent = tipo === 'gasto' ? 'Pagado con' : tipo === 'ingreso' ? 'Entra a' : 'Pagas desde';
  const cu = getCuenta(selCu);
  $('#hint-cuenta', f).textContent = cu && cu.tipo === 'billetera' && !cu.asociadaA ? `${cu.nombre} aún no está vinculada a una cuenta: el gasto se registra, pero no descuenta saldo. Vincúlala en Ajustes.` : '';
  const monto = num(f.elements.monto.value);
  const lbl = { gasto: 'gasto', ingreso: 'ingreso', pago: 'pago' }[tipo];
  $('#btn-guardar', f).textContent = monto ? `Guardar ${lbl} · ${money(monto, moneda)}` : `Guardar ${lbl}`;
}
function aplicarDictado(f) {
  const r = parseDictado(f.elements.dictado.value);
  const libre = (el) => el && !el.dataset.touched;
  const E = f.elements;
  if (libre(E.monto)) E.monto.value = r.monto ?? '';
  if (libre(E.moneda)) E.moneda.value = r.moneda || 'PEN';
  if (libre(E.cuentaId)) E.cuentaId.value = r.cuentaId && [...E.cuentaId.options].some((o) => o.value === r.cuentaId) ? r.cuentaId : '';
  if (libre(E.descripcion)) E.descripcion.value = r.descripcion;
  if (libre(E.categoriaId)) E.categoriaId.value = r.categoriaId || '';
  if (libre(E.fecha)) E.fecha.value = r.fecha || hoyISO();
  if (libre(E.empresa)) E.empresa.checked = r.empresa;
  const box = $('#sugerencia', f);
  if (!f.elements.dictado.value.trim()) { box.hidden = true; return; }
  const cu = getCuenta(r.cuentaId), cat = getCat(r.categoriaId);
  const chips = [
    ['Monto', r.monto != null ? money(r.monto, r.moneda || 'PEN') : 'no lo encontré', r.monto != null],
    ['Cuenta', cu ? cu.nombre : r.ambigua ? `¿Cuál ${r.ambigua}?` : 'Por confirmar', !!cu],
    ['Descripción', r.descripcion || '—', !!r.descripcion],
    ['Categoría', cat ? `${cat.nombre} (${r.catFuente})` : 'Por confirmar', !!cat],
  ];
  if (r.fecha && r.fecha !== hoyISO()) chips.push(['Fecha', fCorta(r.fecha), true]);
  if (r.empresa) chips.push(['Empresa', 'Sí, va aparte', true]);
  box.innerHTML = `<div class="sug-title">${ICON.spark} Entendí esto. Revisa y corrige si hace falta</div><div class="sug-chips">${chips.map(([k, v, ok]) => `<span class="sug ${ok ? '' : 'sug-pend'}"><b>${k}:</b>${esc(v)}</span>`).join('')}</div>`;
  box.hidden = false;
}
function guardarMov(f) {
  const E = f.elements;
  const monto = num(E.monto.value);
  if (!monto || monto <= 0) { toast('Escribe un monto mayor a 0'); E.monto.focus(); return; }
  const tipo = E.tipo.value;
  const m = {
    id: E.id.value || uid(), tipo, monto: round2(monto), moneda: E.moneda.value === 'USD' ? 'USD' : 'PEN', montoCargo: null,
    descripcion: E.descripcion.value.trim(), cuentaId: E.cuentaId.value || null,
    destinoId: tipo === 'pago' ? E.destinoId.value || null : null,
    categoriaId: tipo === 'gasto' ? E.categoriaId.value || null : null,
    fecha: E.fecha.value || hoyISO(), empresa: tipo === 'gasto' && E.empresa.checked, nota: E.nota.value.trim(),
  };
  const mc = num(E.montoCargo.value);
  if (mc && !E.montoCargo.closest('[data-show]').hidden) m.montoCargo = round2(mc);
  m.yaEnSaldo = !E.yaEnSaldo.closest('[data-show]').hidden && E.yaEnSaldo.checked;
  m.fijoId = E.fijoId.value || null;
  if (tipo === 'gasto' && E.repetir && E.repetir.checked) {
    const nf = fijoBase({ descripcion: m.descripcion || getCat(m.categoriaId)?.nombre || 'Gasto fijo', monto: m.monto, moneda: m.moneda, cuentaId: m.cuentaId, categoriaId: m.categoriaId, dia: Number(m.fecha.slice(8, 10)) });
    S.fijos.push(nf);
    m.fijoId = nf.id;
  }
  if (tipo === 'pago' && !m.destinoId) { toast('Elige la tarjeta que pagas'); return; }
  const prev = S.movimientos.find((x) => x.id === m.id);
  if (prev) Object.assign(prev, m);
  else S.movimientos.push({ ...m, creado: Date.now(), demo: false });
  save();
  closeSheet(true);
  render();
  toast(prev ? 'Cambios guardados' : m.empresa ? 'Guardado en la lista de empresa' : 'Guardado ✓');
}

/* ----- Cuenta / tarjeta ----- */
function sheetCuenta(c) {
  const nueva = !c;
  c = c || cuentaBase({ id: '', nombre: '', tipo: 'debito', moneda: 'PEN', custom: true });
  const actual = saldoActual(c);
  const e = c.tipo === 'credito' ? estadoTarjeta(c) : null;
  const hijas = nueva ? [] : compartenCon(c);
  const principales = S.cuentas.filter((x) => x.tipo === 'credito' && x.id !== c.id && !x.lineaDe);
  const ecVig = e && c.ec && e.proximoPago && c.ec.pagoFecha === iso(e.proximoPago);
  const vinculables = S.cuentas.filter((x) => x.tipo !== 'billetera' && x.id !== c.id);
  const html = `<form data-form="cuenta" class="form" autocomplete="off" novalidate>
    <input type="hidden" name="id" value="${esc(c.id)}">
    ${head(nueva ? 'Nueva cuenta' : esc(c.nombre))}
    <label class="field"><span>Nombre</span><input name="nombre" value="${esc(c.nombre)}" required></label>
    <div class="grid2">
      <label class="field"><span>Tipo</span><select name="tipo">${Object.entries(TIPOS_CUENTA).map(([k, l]) => `<option value="${k}" ${c.tipo === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="field"><span>Moneda</span><select name="moneda"><option value="PEN" ${c.moneda === 'PEN' ? 'selected' : ''}>Soles (PEN)</option><option value="USD" ${c.moneda === 'USD' ? 'selected' : ''}>Dólares (USD)</option></select></label>
    </div>
    <div data-tipo="credito">${hijas.length
      ? `<div class="banner"><div class="b-ico">${ICON.card}</div><div><b>Límite compartido</b>${hijas.map((x) => esc(x.nombre)).join(', ')} usa el límite de esta tarjeta. Cada una tiene su propia deuda y estado de cuenta; el cupo disponible se calcula con la deuda de ambas.</div></div>`
      : `<label class="field"><span>Límite de crédito</span><select name="lineaDe"><option value="">Propio de esta tarjeta</option>${principales.map((x) => `<option value="${x.id}" ${c.lineaDe === x.id ? 'selected' : ''}>Comparte límite con ${esc(x.nombre)}</option>`).join('')}</select>
        <small>Si dos tarjetas comparten la línea de crédito (como tus Diners), elige con cuál. Cada una sigue con su propia deuda; solo el límite es común.</small></label>`}</div>
    <div data-tipo="credito,debito,efectivo"><label class="field"><span data-lbl-saldo>${c.tipo === 'credito' ? 'Deuda total actual' : 'Saldo actual'}</span><input name="saldo" inputmode="decimal" placeholder="Sin cargar" value="${actual ?? ''}">
      <small>Lo que escribas queda como punto de partida. Lo que registres después se suma o resta solo.</small></label></div>
    <div data-tipo="credito" class="form">
      <div class="grid2">
        <label class="field" data-limite-propio><span>Límite${hijas.length ? ' (compartido)' : ''}</span><input name="limite" inputmode="decimal" value="${c.limite ?? ''}"></label>
        <label class="field"><span>Pago mínimo habitual</span><input name="minimo" inputmode="decimal" value="${c.minimo ?? ''}"></label>
        <label class="field"><span>Día de corte</span><input name="diaCorte" inputmode="numeric" placeholder="1–31" value="${c.diaCorte ?? ''}"></label>
        <label class="field"><span>Día de pago</span><input name="diaPago" inputmode="numeric" placeholder="1–31" value="${c.diaPago ?? ''}"></label>
      </div>
      <label class="field" data-limite-propio><span>…o escribe el cupo disponible de hoy${hijas.length ? ' (de ambas tarjetas)' : ''}</span><input name="cupoHoy" inputmode="decimal" placeholder="Lo que te dice el banco"><small>Si no sabes el límite, escribe el cupo que te muestra el banco y yo calculo el límite.${hijas.length ? ` Carga antes la deuda de ${hijas.map((x) => esc(x.nombre)).join(', ')}.` : ''}</small></label>
      <label class="switch"><input type="checkbox" name="compraPEN" ${c.compraPEN ? 'checked' : ''}><span class="switch-ui"></span><span class="switch-txt"><b>Compro en soles, me cargan en dólares</b><small>Como en Diners: podrás guardar los dos montos.</small></span></label>
      <div class="form-section">Estado de cuenta ${e && e.proximoPago ? `· pago del ${fCorta(e.proximoPago)}` : ''}</div>
      <div class="grid2">
        <label class="field"><span>Monto a pagar</span><input name="ecMonto" inputmode="decimal" placeholder="Opcional" value="${ecVig ? c.ec.monto : ''}"></label>
        <label class="field"><span>Pago mínimo</span><input name="ecMinimo" inputmode="decimal" placeholder="Opcional" value="${ecVig && c.ec.minimo != null ? c.ec.minimo : ''}"></label>
      </div>
      <small class="hint">Si lo dejas vacío, la app estima el monto con los consumos que registras.</small>
    </div>
    <div data-tipo="billetera" class="form">
      <label class="field"><span>¿De qué cuenta sale el dinero?</span><select name="asociadaA"><option value="">Sin vincular</option>${vinculables.map((x) => `<option value="${x.id}" ${c.asociadaA === x.id ? 'selected' : ''}>${esc(x.nombre)}</option>`).join('')}</select>
        <small>Si cambias de banco (por ejemplo, de BBVA a Banbif), agrega esa cuenta y elígela aquí.</small></label>
      <label class="field"><span>Banco asociado (texto)</span><input name="asociadaTexto" value="${esc(c.asociadaTexto)}" placeholder="BBVA, BCP, Banbif…"></label>
    </div>
    <label class="field"><span>Últimos 4 dígitos (opcional)</span><input name="ultimos4" inputmode="numeric" maxlength="4" pattern="\\d{4}" value="${esc(c.ultimos4)}" placeholder="1234"><small>Nunca escribas el número completo de la tarjeta.</small></label>
    <label class="field"><span>Nota</span><input name="nota" value="${esc(c.nota)}"></label>
    <label class="switch"><input type="checkbox" name="activa" ${c.activa ? 'checked' : ''}><span class="switch-ui"></span><span class="switch-txt"><b>Mostrar en la app</b><small>Apágalo si ya no usas esta cuenta.</small></span></label>
    <div class="sheet-actions"><button class="btn btn-primary btn-xl" type="submit">Guardar</button>
    ${!nueva && c.custom ? `<button type="button" class="btn btn-danger" data-action="borrar-cuenta" data-id="${c.id}">Borrar cuenta</button>` : ''}</div>
  </form>`;
  openSheet(html, (root) => {
    const f = $('form', root);
    const sync = () => {
      const t = f.elements.tipo.value;
      const hija = t === 'credito' && f.elements.lineaDe && f.elements.lineaDe.value;
      $$('[data-tipo]', f).forEach((el) => { el.hidden = !el.dataset.tipo.split(',').includes(t); });
      $$('[data-limite-propio]', f).forEach((el) => { el.hidden = !!hija; });
      $('[data-lbl-saldo]', f).textContent = t === 'credito' ? 'Deuda total actual' : 'Saldo actual';
    };
    sync();
    f.addEventListener('change', sync);
    f.addEventListener('input', () => { sheetDirty = true; });
  });
}
let avisoCuenta = '';
function guardarCuenta(f) {
  const E = f.elements;
  const nombre = E.nombre.value.trim();
  if (!nombre) { toast('Escribe un nombre'); return; }
  let c = getCuenta(E.id.value);
  const nueva = !c;
  if (nueva) { c = cuentaBase({ id: `${norm(nombre).replace(/[^a-z0-9]+/g, '-').slice(0, 20)}-${uid().slice(-4)}`, nombre, custom: true }); }
  const antes = saldoActual(c);
  c.nombre = nombre;
  c.tipo = E.tipo.value;
  c.moneda = E.moneda.value === 'USD' ? 'USD' : 'PEN';
  const dia = (v) => { const n = parseInt(v, 10); return n >= 1 && n <= 31 ? n : null; };
  c.lineaDe = c.tipo === 'credito' && E.lineaDe && E.lineaDe.value && E.lineaDe.value !== c.id ? E.lineaDe.value : null;
  const hija = !!c.lineaDe;
  if (c.tipo === 'credito') {
    if (!hija) c.limite = num(E.limite.value);
    c.minimo = num(E.minimo.value);
    c.diaCorte = dia(E.diaCorte.value);
    c.diaPago = dia(E.diaPago.value);
    c.compraPEN = E.compraPEN.checked;
  }
  if (c.tipo === 'billetera') { c.asociadaA = E.asociadaA.value || null; c.asociadaTexto = E.asociadaTexto.value.trim(); c.saldo = null; c.saldoTs = null; }
  else {
    const s = num(E.saldo.value);
    if (s == null) { c.saldo = null; c.saldoTs = null; }
    else if (antes == null || round2(s) !== round2(antes)) { c.saldo = round2(s); c.saldoTs = Date.now(); }
  }
  const u4 = E.ultimos4.value.replace(/\D/g, '');
  if (u4 && u4.length !== 4) { toast('Solo los últimos 4 dígitos'); return; }
  c.ultimos4 = u4;
  c.nota = E.nota.value.trim();
  c.activa = E.activa.checked;
  if (c.tipo === 'credito' && !hija) {
    const cupoHoy = num(E.cupoHoy.value);
    if (cupoHoy != null) {
      const sinDeuda = [c, ...compartenCon(c)].filter((m) => saldoActual(m) == null);
      const deudaLinea = [c, ...compartenCon(c)].reduce((t, m) => t + (saldoActual(m) || 0), 0);
      c.limite = round2(cupoHoy + deudaLinea);
      if (sinDeuda.length) avisoCuenta = `Guardado. Falta la deuda de ${sinDeuda.map((m) => m.nombre).join(', ')}: escribe el cupo otra vez después`;
    }
  }
  if (c.tipo === 'credito') {
    const ecM = num(E.ecMonto.value);
    if (ecM != null) {
      c.ec = null;
      const e = estadoTarjeta(c);
      c.ec = e.proximoPago ? { monto: round2(ecM), minimo: num(E.ecMinimo.value), pagoFecha: iso(e.proximoPago) } : null;
      if (!e.proximoPago) toast('Agrega día de corte y de pago para usar el estado de cuenta');
    } else c.ec = null;
  }
  if (nueva) S.cuentas.push(c);
  save(); closeSheet(true); render(); toast(avisoCuenta || 'Cuenta guardada'); avisoCuenta = '';
}

/* ----- Categoría ----- */
function sheetCat(c) {
  const nueva = !c;
  c = c || { id: '', nombre: '', nivel: 'moderado' };
  openSheet(`<form data-form="cat" class="form" novalidate><input type="hidden" name="id" value="${esc(c.id)}">
    ${head(nueva ? 'Nueva categoría' : 'Editar categoría')}
    <label class="field"><span>Nombre</span><input name="nombre" value="${esc(c.nombre)}"></label>
    <div class="field"><span>¿Qué tan necesaria es?</span><div class="choices">${['necesario', 'moderado', 'prescindible'].map((k) => `<label class="choice choice-txt ${c.nivel === k ? 'on' : ''}"><input type="radio" name="nivel" value="${k}" ${c.nivel === k ? 'checked' : ''} hidden><i class="dot dot-${k}"></i>&nbsp;${NIVELES[k].nombre}</label>`).join('')}</div>
      <small>Verde = necesario · Amarillo = moderado · Rojo = prescindible</small></div>
    <div class="sheet-actions"><button class="btn btn-primary btn-xl" type="submit">Guardar</button>${nueva ? '' : `<button type="button" class="btn btn-danger" data-action="borrar-cat" data-id="${c.id}">Borrar categoría</button>`}</div></form>`,
  (root) => { const f = $('form', root); f.addEventListener('change', () => $$('.choice', f).forEach((l) => l.classList.toggle('on', $('input', l).checked))); });
}
function guardarCat(f) {
  const E = f.elements;
  const nombre = E.nombre.value.trim();
  if (!nombre) { toast('Escribe un nombre'); return; }
  const nivel = (f.querySelector('input[name=nivel]:checked') || {}).value || 'moderado';
  const c = getCat(E.id.value);
  if (c) Object.assign(c, { nombre, nivel }); else S.categorias.push({ id: uid(), nombre, nivel });
  save(); closeSheet(true); render(); toast('Categoría guardada');
}

/* ----- Planes ----- */
function sheetPlan(p) {
  const nuevo = !p;
  p = p || planBase({ id: '', nombre: '', icono: '🎯', modo: 'manual' });
  openSheet(`<form data-form="plan" class="form" novalidate><input type="hidden" name="id" value="${esc(p.id)}"><input type="hidden" name="icono" value="${esc(p.icono)}">
    ${head(nuevo ? 'Nuevo plan de ahorro' : 'Editar plan')}
    <div class="field"><span>Ícono</span><div class="choices">${[...new Set([p.icono, ...ICONOS_PLAN])].map((i) => `<button type="button" class="choice ${i === p.icono ? 'on' : ''}" data-action="plan-icono" data-v="${esc(i)}">${esc(i)}</button>`).join('')}</div></div>
    <label class="field"><span>Nombre</span><input name="nombre" value="${esc(p.nombre)}" placeholder="Ej: Viaje, Auto, Fondo de emergencia"></label>
    <label class="field"><span>Motivo (¿para qué?)</span><textarea name="motivo" placeholder="Escribe tu motivo">${esc(p.motivo)}</textarea></label>
    <label class="field"><span>Meta (S/)</span><input name="meta" inputmode="decimal" value="${p.meta ?? ''}"></label>
    <div class="field"><span>¿Cómo se mide lo ahorrado?</span>
      <select name="modo"><option value="manual" ${p.modo === 'manual' ? 'selected' : ''}>Con mis aportes manuales</option><option value="neto" ${p.modo === 'neto' ? 'selected' : ''}>Con mi saldo de ahorro neto</option></select></div>
    <label class="field" data-modo="manual"><span>Ya ahorrado (S/)</span><input name="ahorrado" inputmode="decimal" value="${p.ahorrado ?? 0}"></label>
    <label class="field"><span>Fecha objetivo (opcional)</span><input type="date" name="fechaObjetivo" min="${hoyISO()}" value="${esc(p.fechaObjetivo || '')}"></label>
    <div class="sheet-actions"><button class="btn btn-primary btn-xl" type="submit">Guardar plan</button>${nuevo ? '' : `<button type="button" class="btn btn-danger" data-action="borrar-plan" data-id="${p.id}">Borrar plan</button>`}</div></form>`,
  (root) => {
    const f = $('form', root);
    const sync = () => { $('[data-modo]', f).hidden = f.elements.modo.value !== 'manual'; };
    sync(); f.addEventListener('change', sync); f.addEventListener('input', () => { sheetDirty = true; });
  });
}
function guardarPlan(f) {
  const E = f.elements;
  const nombre = E.nombre.value.trim();
  const meta = num(E.meta.value);
  if (!nombre) { toast('Escribe un nombre'); return; }
  if (!meta || meta <= 0) { toast('Escribe la meta'); return; }
  const datos = { nombre, motivo: E.motivo.value.trim(), icono: E.icono.value, meta: round2(meta), modo: E.modo.value, ahorrado: round2(num(E.ahorrado.value) || 0), fechaObjetivo: E.fechaObjetivo.value || null };
  const p = getPlan(E.id.value);
  if (p) Object.assign(p, datos); else S.planes.push(planBase(datos));
  save(); closeSheet(true); render(); toast('Plan guardado');
}
function sheetAporte(p, signo) {
  openSheet(`<form data-form="aporte" class="form" novalidate><input type="hidden" name="id" value="${p.id}"><input type="hidden" name="signo" value="${signo}">
    ${head(`${signo > 0 ? 'Aportar a' : 'Retirar de'} ${esc(p.nombre)}`)}
    <div class="monto-box"><span class="monto-cur">S/</span><input name="monto" class="monto-input" inputmode="decimal" placeholder="0.00"></div>
    <div class="sheet-actions"><button class="btn btn-primary btn-xl" type="submit">${signo > 0 ? 'Aportar' : 'Retirar'}</button></div></form>`);
}
function guardarAporte(f) {
  const p = getPlan(f.elements.id.value);
  const v = num(f.elements.monto.value);
  if (!p || !v || v <= 0) { toast('Escribe un monto'); return; }
  p.ahorrado = Math.max(0, round2((Number(p.ahorrado) || 0) + v * Number(f.elements.signo.value)));
  save(); closeSheet(true); render(); toast('Plan actualizado');
}

/* ----- Gasto fijo ----- */
function sheetFijo(f) {
  const nuevo = !f;
  f = f || fijoBase({ id: '' });
  openSheet(`<form data-form="fijo" class="form" novalidate><input type="hidden" name="id" value="${esc(f.id)}">
    ${head(nuevo ? 'Nuevo gasto fijo' : 'Editar gasto fijo')}
    <label class="field"><span>¿Qué pagas?</span><input name="descripcion" value="${esc(f.descripcion)}" placeholder="Ej: alquiler, internet, Netflix"></label>
    <div class="grid2">
      <label class="field"><span>Monto al mes</span><input name="monto" inputmode="decimal" placeholder="0.00" value="${f.monto ?? ''}"></label>
      <label class="field"><span>Moneda</span><select name="moneda"><option value="PEN" ${f.moneda === 'PEN' ? 'selected' : ''}>Soles</option><option value="USD" ${f.moneda === 'USD' ? 'selected' : ''}>Dólares</option></select></label>
    </div>
    <label class="field"><span>Día del mes en que lo pagas</span><input name="dia" inputmode="numeric" placeholder="1–31" value="${f.dia ?? ''}"><small>Si el mes tiene menos días, uso el último.</small></label>
    <label class="field"><span>Se paga con</span><select name="cuentaId">${opcionesCuenta(f.cuentaId, 'gasto')}</select></label>
    <label class="field"><span>Categoría</span><select name="categoriaId">${opcionesCategoria(f.categoriaId)}</select></label>
    <label class="switch"><input type="checkbox" name="activo" ${f.activo ? 'checked' : ''}><span class="switch-ui"></span><span class="switch-txt"><b>Activo</b><small>Apágalo para pausarlo sin borrarlo.</small></span></label>
    <div class="sheet-actions"><button class="btn btn-primary btn-xl" type="submit">Guardar</button>${nuevo ? '' : `<button type="button" class="btn btn-danger" data-action="borrar-fijo" data-id="${f.id}">Borrar gasto fijo</button>`}</div></form>`,
  (root) => { $('form', root).addEventListener('input', () => { sheetDirty = true; }); });
}
function guardarFijo(fm) {
  const E = fm.elements;
  const descripcion = E.descripcion.value.trim();
  const monto = num(E.monto.value);
  const dia = parseInt(E.dia.value, 10);
  if (!descripcion) { toast('Escribe qué pagas'); return; }
  if (!monto || monto <= 0) { toast('Escribe el monto'); return; }
  if (!(dia >= 1 && dia <= 31)) { toast('El día debe estar entre 1 y 31'); return; }
  const datos = { descripcion, monto: round2(monto), moneda: E.moneda.value, dia, cuentaId: E.cuentaId.value || null, categoriaId: E.categoriaId.value || null, activo: E.activo.checked };
  const f = getFijo(E.id.value);
  if (f) Object.assign(f, datos); else S.fijos.push(fijoBase(datos));
  save(); closeSheet(true); render(); toast('Gasto fijo guardado');
}

/* ----- Siri ----- */
function urlApp() { return location.origin + location.pathname.replace(/index\.html$/, ''); }
function sheetSiri() {
  const base = urlApp().replace(/^https?:\/\//, '');
  const paso = (n, t) => `<div class="row"><div class="ico">${n}</div><div class="row-main" style="white-space:normal"><div class="row-sub" style="white-space:normal;color:var(--text)">${t}</div></div></div>`;
  openSheet(`<div class="form">${head('Registrar gastos con Siri')}
    <div class="banner"><div class="b-ico">${ICON.mic}</div><div><b>Así funciona</b>Dices «Oye Siri, Gasto», dictas «almuerzo 12 soles Yape» y Zafiro se abre con todo lleno. Tú revisas y guardas.</div></div>
    <div class="form-section">Crear el atajo (una sola vez)</div>
    <div class="list">
      ${paso(1, 'Abre la app <b>Atajos</b> y toca <b>+</b>.')}
      ${paso(2, 'Agrega la acción <b>Dictar texto</b> (idioma: Español).')}
      ${paso(3, 'Agrega <b>Codificar URL</b> (usa el texto dictado).')}
      ${paso(4, `Agrega <b>URL</b> y escribe:<br><code class="code">webapp://${esc(base)}?gasto=</code> y al final inserta la variable <b>Texto codificado</b>.`)}
      ${paso(5, 'Agrega <b>Abrir URLs</b>.')}
      ${paso(6, 'Ponle de nombre <b>Gasto</b>. Listo: di «Oye Siri, Gasto».')}
    </div>
    <button type="button" class="btn btn-block" data-action="copiar-texto" data-texto="webapp://${esc(base)}?gasto=">📋 Copiar la dirección del paso 4</button>
    <div class="form-section">Si se abre Safari en vez de Zafiro</div>
    <div class="card-note" style="margin-top:0">Apple no garantiza que un atajo abra apps web. Si te pasa, usa este plan B (también es rápido):</div>
    <div class="list">
      ${paso('B1', 'En el atajo, cambia los pasos 3, 4 y 5 por <b>Copiar al portapapeles</b>.')}
      ${paso('B2', 'Activa arriba en Ajustes <b>«Al abrir, ir directo a + Gasto»</b>.')}
      ${paso('B3', 'Di «Oye Siri, Gasto», dicta, abre Zafiro y toca <b>📋 Pegar lo que dictaste</b>.')}
    </div>
    <div class="card-note">Si un atajo abre Safari, Zafiro no guarda nada ahí: te avisa y te deja copiar el texto, porque tus datos viven en la app instalada.</div>
  </div>`);
}

/* ----- Parámetros ----- */
function sheetParam() {
  const a = S.ajustes;
  openSheet(`<form data-form="param" class="form" novalidate>${head('Parámetros')}
    <label class="field"><span>Tipo de cambio (S/ por US$ 1)</span><input name="tc" inputmode="decimal" placeholder="Ej: el de tu banco hoy" value="${a.tc ?? ''}"><small>Lo escribes tú. Se usa para sumar lo que está en dólares (estimado).</small></label>
    <label class="field"><span>Ahorro mensual (S/)</span><input name="ahorroMensual" inputmode="decimal" value="${a.ahorroMensual ?? ''}"></label>
    <label class="field"><span>Presupuesto de gasto mensual (S/, opcional)</span><input name="presupuesto" inputmode="decimal" value="${a.presupuesto ?? ''}"></label>
    <label class="field"><span>Gasto hormiga: hasta (S/)</span><input name="umbralHormiga" inputmode="decimal" value="${a.umbralHormiga ?? 20}"><small>Los gastos de este monto o menos se cuentan como “hormiga”.</small></label>
    <div class="sheet-actions"><button class="btn btn-primary btn-xl" type="submit">Guardar</button></div></form>`);
}
function guardarParam(f) {
  const E = f.elements;
  const tc = num(E.tc.value);
  if (tc != null && (tc < 1 || tc > 20)) { toast('Revisa el tipo de cambio'); return; }
  S.ajustes.tc = tc;
  S.ajustes.ahorroMensual = num(E.ahorroMensual.value);
  S.ajustes.presupuesto = num(E.presupuesto.value);
  S.ajustes.umbralHormiga = num(E.umbralHormiga.value) || 20;
  save(); closeSheet(true); render(); toast('Parámetros guardados');
}

/* ---------------- Respaldo ---------------- */
function csvMovs() {
  const q = (v) => { const s = v == null ? '' : String(v); return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const cols = ['fecha', 'tipo', 'descripcion', 'monto', 'moneda', 'monto_cargo_usd', 'cuenta', 'tarjeta_pagada', 'categoria', 'nivel', 'pagado_por_empresa', 'nota'];
  const rows = [...S.movimientos].sort((a, b) => (a.fecha < b.fecha ? -1 : 1)).map((m) => {
    const cat = getCat(m.categoriaId);
    return [m.fecha, m.tipo, m.descripcion, m.monto.toFixed(2), m.moneda, m.montoCargo != null ? m.montoCargo.toFixed(2) : '', nombreCuenta(m.cuentaId) || 'Por confirmar', nombreCuenta(m.destinoId) || '', m.tipo === 'gasto' ? (cat ? cat.nombre : 'Por confirmar') : '', cat ? NIVELES[cat.nivel].nombre : '', m.empresa ? 'si' : 'no', m.nota].map(q).join(',');
  });
  return [cols.join(','), ...rows].join('\n');
}
function descargar(files) {
  files.forEach((file, i) => setTimeout(() => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, i * 600));
}
function marcarExport() { S.ajustes.ultimaExportacion = Date.now(); save(); render(); toast('Respaldo listo ✓'); }
async function exportar() {
  if (resumenDatos(S).vacio) {
    alert('Aquí no hay datos para respaldar: no hay saldos, movimientos ni gastos fijos.\n\nSi tus datos están en otro ícono de Zafiro (o en Safari), abre ese y exporta desde ahí.');
    return;
  }
  const fecha = hoyISO();
  const data = { app: 'zafiro', version: 1, exportado: new Date().toISOString(), ...S };
  const files = [
    new File([JSON.stringify(data, null, 2)], `zafiro-respaldo-${fecha}.json`, { type: 'application/json' }),
    new File([`﻿${csvMovs()}`], `zafiro-movimientos-${fecha}.csv`, { type: 'text/csv' }),
  ];
  if (navigator.canShare && navigator.canShare({ files })) {
    try { await navigator.share({ files, title: 'Respaldo Zafiro' }); marcarExport(); }
    catch (e) { if (e && e.name === 'AbortError') toast('Respaldo cancelado'); else { descargar(files); marcarExport(); } }
  } else { descargar(files); marcarExport(); }
}
function importarArchivo(file) {
  const rd = new FileReader();
  rd.onload = () => {
    let data;
    try { data = JSON.parse(rd.result); } catch { toast('Ese archivo no es un respaldo válido'); return; }
    if (data && data.app === 'zafiro-movimientos' && Array.isArray(data.movimientos)) { sheetAgregar(data); return; }
    if (!data || data.app !== 'zafiro' || !Array.isArray(data.cuentas)) { toast('Ese archivo no es un respaldo de Zafiro'); return; }
    const r = resumenDatos(data);
    const cuando = data.exportado ? `${fMedia(new Date(data.exportado))}, ${new Date(data.exportado).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}` : 'sin fecha';
    if (r.vacio) {
      alert(`Este respaldo está VACÍO (exportado el ${cuando}).\n\nNo tiene saldos, movimientos ni gastos fijos, así que no lo importé.\n\nSuele pasar cuando se exporta desde Safari o desde un ícono nuevo, y no desde el ícono donde cargaste tus datos. Abre la app donde ves tus datos, exporta de nuevo y vuelve a importar.`);
      return;
    }
    if (!confirm(`Respaldo del ${cuando}:\n• ${r.texto}\n\nEsto REEMPLAZA los datos actuales de esta app. ¿Continuar?`)) return;
    S = normalizar(data);
    save(); ui.tab = 'inicio'; render(); window.scrollTo(0, 0);
    toast(`Restaurado ✓ ${resumenDatos(S).texto}`);
  };
  rd.readAsText(file);
}

// Cuántos datos tiene un estado (la app o un respaldo): sirve para ver dónde viven tus datos
function resumenDatos(d) {
  const cuentas = (d.cuentas || []).filter((c) => c && c.saldo != null).length;
  const movs = (d.movimientos || []).filter((m) => m && !m.demo).length;
  const fijos = (d.fijos || []).filter((f) => f && !f.demo).length;
  const planes = (d.planes || []).filter((p) => p && !p.demo && p.id !== 'departamento').length;
  return {
    cuentas, movs, fijos, planes,
    vacio: !cuentas && !movs && !fijos && !planes,
    texto: `${plural(cuentas, 'cuenta con saldo', 'cuentas con saldo')} · ${plural(movs, 'movimiento', 'movimientos')} · ${plural(fijos, 'gasto fijo', 'gastos fijos')}${planes ? ` · ${plural(planes, 'plan', 'planes')}` : ''}`,
  };
}

/* ----- Agregar movimientos desde un archivo (ej. armado desde capturas del banco) ----- */
let porAgregar = [];
function sheetAgregar(data) {
  const cats = (desc) => { const dn = norm(desc); if (!dn) return null; const prev = [...S.movimientos].reverse().find((m) => m.categoriaId && norm(m.descripcion) === dn && getCat(m.categoriaId)); return prev ? prev.categoriaId : null; };
  porAgregar = data.movimientos.map((x) => {
    const m = {
      tipo: ['gasto', 'ingreso', 'pago'].includes(x.tipo) ? x.tipo : 'gasto',
      monto: round2(num(x.monto) || 0), moneda: x.moneda === 'USD' ? 'USD' : 'PEN',
      montoCargo: num(x.montoCargo) != null ? round2(num(x.montoCargo)) : null,
      descripcion: String(x.descripcion || '').trim().slice(0, 120),
      cuentaId: getCuenta(x.cuenta) ? x.cuenta : null, destinoId: getCuenta(x.destino) ? x.destino : null,
      categoriaId: getCat(x.categoria) ? x.categoria : null,
      fecha: /^\d{4}-\d{2}-\d{2}$/.test(String(x.fecha)) ? String(x.fecha) : null,
      empresa: !!x.empresa, nota: String(x.nota || '').slice(0, 200),
    };
    if (!m.categoriaId && m.tipo === 'gasto') m.categoriaId = cats(m.descripcion);
    m.dup = S.movimientos.some((o) => o.fecha === m.fecha && o.monto === m.monto && o.cuentaId === m.cuentaId && norm(o.descripcion) === norm(m.descripcion));
    return m;
  }).filter((m) => m.monto > 0 && m.fecha).sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  if (!porAgregar.length) { toast('El archivo no tiene movimientos válidos'); return; }
  const filas = porAgregar.map((m, i) => `<label class="row">
      <input type="checkbox" name="sel" value="${i}" ${m.dup ? '' : 'checked'} style="width:22px;height:22px;accent-color:#2f6bff;flex:none">
      <div class="row-main"><div class="row-title">${esc(m.descripcion || '(sin descripción)')}</div>
        <div class="row-sub">${fCorta(m.fecha)} · ${esc(nombreCuenta(m.cuentaId) || 'Cuenta por confirmar')} · ${esc(getCat(m.categoriaId)?.nombre || 'Por confirmar')}</div>
        ${m.dup ? '<div class="tags"><span class="badge badge-warn">Ya lo tienes registrado</span></div>' : ''}</div>
      <div class="row-end">${m.tipo === 'ingreso' ? '+' : ''}${money(m.monto, m.moneda)}${m.montoCargo != null ? `<small>cargo ${money(m.montoCargo, 'USD')}</small>` : ''}</div></label>`).join('');
  openSheet(`<form data-form="agregar" class="form" novalidate>${head('Agregar movimientos')}
    <div class="banner"><div class="b-ico">${ICON.list}</div><div><b>${plural(porAgregar.length, 'movimiento', 'movimientos')} en el archivo</b>${data.nota ? esc(data.nota) : 'Revisa la lista. Desmarca lo que no quieras agregar.'}</div></div>
    <label class="switch"><input type="checkbox" name="yaEnSaldo" checked><span class="switch-ui"></span><span class="switch-txt"><b>Ya están incluidos en mis saldos actuales</b><small>Déjalo activado si ya cargaste la deuda y los saldos de hoy: así se guardan para tus análisis sin descontarlos dos veces.</small></span></label>
    <div class="day-group">${filas}</div>
    <div class="sheet-actions"><button class="btn btn-primary btn-xl" type="submit">Agregar seleccionados</button></div></form>`);
}
function guardarAgregar(f) {
  const sel = $$('input[name=sel]:checked', f).map((el) => porAgregar[Number(el.value)]).filter(Boolean);
  if (!sel.length) { toast('No marcaste ningún movimiento'); return; }
  const ya = f.elements.yaEnSaldo.checked;
  const ts = Date.now();
  sel.forEach((m, i) => { const { dup, ...x } = m; S.movimientos.push({ ...x, id: uid(), creado: ts + i, demo: false, yaEnSaldo: ya }); });
  porAgregar = [];
  save(); closeSheet(true); ui.tab = 'movimientos'; render(); window.scrollTo(0, 0);
  toast(`${plural(sel.length, 'movimiento agregado', 'movimientos agregados')} ✓`);
}

/* ---------------- Datos de ejemplo ---------------- */
async function cargarEjemplo() {
  if (S.ejemplo) { toast('El ejemplo ya está cargado'); return; }
  if (!confirm('Se cargarán datos FICTICIOS para probar la app.\n\nTus cuentas y parámetros actuales se guardan y vuelven al borrar el ejemplo. ¿Continuar?')) return;
  let ej;
  try { ej = await (await fetch('ejemplo.json', { cache: 'no-cache' })).json(); } catch { toast('No se pudo abrir el archivo de ejemplo'); return; }
  const ts = Date.now();
  S.ejemplo = { cuentas: JSON.parse(JSON.stringify(S.cuentas)), ajustes: { tc: S.ajustes.tc, ahorroMensual: S.ajustes.ahorroMensual, presupuesto: S.ajustes.presupuesto, proyFecha: S.ajustes.proyFecha }, cargado: ts };
  for (const [id, vals] of Object.entries(ej.cuentas || {})) {
    const c = getCuenta(id);
    if (!c) continue;
    Object.assign(c, vals);
    if ('saldo' in vals) c.saldoTs = ts;
  }
  Object.assign(S.ajustes, ej.ajustes || {});
  const t = hoyDate();
  if (ej.ajustes && ej.ajustes.proyMeses) { S.ajustes.proyFecha = iso(new Date(t.getFullYear(), t.getMonth() + ej.ajustes.proyMeses, t.getDate())); delete S.ajustes.proyMeses; }
  for (const x of ej.movimientos || []) {
    S.movimientos.push({
      id: uid(), tipo: x.tipo || 'gasto', monto: x.monto, moneda: x.moneda || 'PEN', montoCargo: x.montoCargo ?? null,
      descripcion: x.descripcion || '', cuentaId: x.cuenta || null, destinoId: x.destino || null, categoriaId: x.categoria || null,
      fecha: iso(addDays(t, x.dias || 0)), empresa: !!x.empresa, nota: '', creado: ts - 1000, demo: true,
    });
  }
  for (const f of ej.fijos || []) S.fijos.push(fijoBase({ ...f, cuentaId: f.cuenta || null, categoriaId: f.categoria || null, demo: true }));
  for (const p of ej.planes || []) {
    S.planes.push(planBase({ ...p, id: uid(), demo: true, fechaObjetivo: p.mesesObjetivo ? iso(new Date(t.getFullYear(), t.getMonth() + p.mesesObjetivo, 1)) : null }));
  }
  save(); ui.tab = 'inicio'; render(); window.scrollTo(0, 0); toast('Datos de ejemplo cargados');
}
function borrarEjemplo() {
  if (!S.ejemplo) return;
  if (!confirm('¿Borrar los datos de ejemplo? Lo que registraste tú se mantiene.')) return;
  const snap = S.ejemplo;
  S.movimientos = S.movimientos.filter((m) => !m.demo);
  S.planes = S.planes.filter((p) => !p.demo);
  S.fijos = S.fijos.filter((f) => !f.demo);
  for (const c of S.cuentas) { const o = snap.cuentas.find((x) => x.id === c.id); if (o) Object.assign(c, o); }
  Object.assign(S.ajustes, snap.ajustes);
  S.ejemplo = null;
  save(); render(); toast('Ejemplo borrado');
}

/* ---------------- Eventos ---------------- */
let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
}
function irTab(tab, scrollId) {
  ui.tab = tab;
  render();
  if (scrollId) requestAnimationFrame(() => { const el = document.getElementById(scrollId); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  else window.scrollTo(0, 0);
}

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const a = el.dataset.action;
  const id = el.dataset.id;
  switch (a) {
    case 'tab': if (!$('#sheet').hidden) closeSheet(true); irTab(el.dataset.tab, el.dataset.scroll); break;
    case 'nuevo-mov': sheetMov(null, el.dataset.tipo || 'gasto'); break;
    case 'edit-mov': { const m = S.movimientos.find((x) => x.id === id); if (m) sheetMov(m); break; }
    case 'close-sheet': closeSheet(); break;
    case 'mov-tipo': {
      const f = el.closest('form');
      f.elements.tipo.value = el.dataset.v;
      const sel = f.elements.cuentaId.value;
      f.elements.cuentaId.innerHTML = opcionesCuenta(sel, el.dataset.v);
      if (![...f.elements.cuentaId.options].some((o) => o.value === sel)) f.elements.cuentaId.value = '';
      syncMovForm(f); break;
    }
    case 'mov-moneda': { const f = el.closest('form'); f.elements.moneda.value = el.dataset.v; f.elements.moneda.dataset.touched = '1'; syncMovForm(f); break; }
    case 'mov-borrar':
      if (confirm('¿Borrar este movimiento? No se puede deshacer.')) { S.movimientos = S.movimientos.filter((m) => m.id !== id); save(); closeSheet(true); render(); toast('Movimiento borrado'); }
      break;
    case 'edit-cuenta': sheetCuenta(getCuenta(id)); break;
    case 'nueva-cuenta': sheetCuenta(null); break;
    case 'borrar-cuenta': {
      const usados = S.movimientos.some((m) => m.cuentaId === id || m.destinoId === id);
      if (usados) { toast('Tiene movimientos: mejor apaga «Mostrar en la app»'); break; }
      if (confirm('¿Borrar esta cuenta?')) { S.cuentas = S.cuentas.filter((c) => c.id !== id); save(); closeSheet(true); render(); }
      break;
    }
    case 'edit-cat': sheetCat(getCat(id)); break;
    case 'nueva-cat': sheetCat(null); break;
    case 'borrar-cat': {
      const n = S.movimientos.filter((m) => m.categoriaId === id).length;
      if (confirm(n ? `${plural(n, 'gasto usa', 'gastos usan')} esta categoría y quedarán «Por confirmar». ¿Borrarla?` : '¿Borrar esta categoría?')) {
        S.movimientos.forEach((m) => { if (m.categoriaId === id) m.categoriaId = null; });
        S.categorias = S.categorias.filter((c) => c.id !== id); save(); closeSheet(true); render();
      }
      break;
    }
    case 'nuevo-plan': sheetPlan(null); break;
    case 'nuevo-fijo': sheetFijo(null); break;
    case 'edit-fijo': sheetFijo(getFijo(id)); break;
    case 'borrar-fijo': if (confirm('¿Borrar este gasto fijo? Los gastos ya registrados se mantienen.')) { S.fijos = S.fijos.filter((f) => f.id !== id); save(); closeSheet(true); render(); toast('Gasto fijo borrado'); } break;
    case 'registrar-fijo': {
      const f = getFijo(id);
      if (!f) break;
      const t = hoyDate();
      const fd = fechaDia(t.getFullYear(), t.getMonth(), f.dia);
      sheetMov(null, 'gasto', { monto: f.monto, moneda: f.moneda, descripcion: f.descripcion, cuentaId: f.cuentaId || '', categoriaId: f.categoriaId || '', fecha: iso(fd <= t ? fd : t), fijoId: f.id });
      break;
    }
    case 'pasos-siri': sheetSiri(); break;
    case 'copiar-texto': navigator.clipboard?.writeText(el.dataset.texto || '').then(() => toast('Copiado ✓')).catch(() => toast('No se pudo copiar')); break;
    case 'pegar-dictado': {
      const f = el.closest('form');
      if (!navigator.clipboard || !navigator.clipboard.readText) { toast('Mantén presionado el campo y elige «Pegar»'); break; }
      navigator.clipboard.readText().then((txt) => {
        if (!txt || !txt.trim()) { toast('No hay texto copiado'); return; }
        f.elements.dictado.value = txt.trim(); sheetDirty = true; aplicarDictado(f); syncMovForm(f);
      }).catch(() => toast('Mantén presionado el campo y elige «Pegar»'));
      break;
    }
    case 'edit-plan': sheetPlan(getPlan(id)); break;
    case 'plan-icono': { const f = el.closest('form'); f.elements.icono.value = el.dataset.v; $$('.choice', f).forEach((b) => b.classList.toggle('on', b === el)); break; }
    case 'borrar-plan': if (confirm('¿Borrar este plan?')) { S.planes = S.planes.filter((p) => p.id !== id); save(); closeSheet(true); render(); } break;
    case 'aporte-plan': sheetAporte(getPlan(id), Number(el.dataset.signo)); break;
    case 'sheet-param': sheetParam(); break;
    case 'filtro': ui.filtro = el.dataset.v; render(); break;
    case 'ver-porconfirmar': ui.filtro = 'porconfirmar'; ui.q = ''; irTab('movimientos'); break;
    case 'ver-empresa': ui.filtro = 'empresa'; ui.mesMov = ui.mesAn; irTab('movimientos'); break;
    case 'mes-mov': ui.mesMov = mesMover(ui.mesMov, Number(el.dataset.d)); render(); break;
    case 'mes-an': ui.mesAn = mesMover(ui.mesAn, Number(el.dataset.d)); ui.trendSel = null; render(); break;
    case 'trend-sel': ui.trendSel = Number(el.dataset.i); render(); break;
    case 'exportar': exportar(); break;
    case 'importar': $('#file-import').click(); break;
    case 'cargar-ejemplo': cargarEjemplo(); break;
    case 'borrar-ejemplo': borrarEjemplo(); break;
    case 'borrar-todo':
      if (confirm('¿Borrar TODOS tus datos de este iPhone? Exporta antes si quieres conservarlos.') && confirm('Última confirmación: esto no se puede deshacer.')) {
        localStorage.removeItem(KEY); S = estadoInicial(); save(); irTab('inicio'); toast('Datos borrados');
      }
      break;
    default: break;
  }
});

document.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  const h = { mov: guardarMov, cuenta: guardarCuenta, cat: guardarCat, plan: guardarPlan, aporte: guardarAporte, param: guardarParam, agregar: guardarAgregar, fijo: guardarFijo }[f.dataset.form];
  if (h) h(f);
});

document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset && el.dataset.bind) {
    const k = el.dataset.bind;
    S.ajustes[k] = k === 'proyFecha' ? el.value || null : num(el.value);
    save(); render();
  }
  if (el.dataset && el.dataset.bindCheck) { S.ajustes[el.dataset.bindCheck] = el.checked; save(); toast(el.checked ? 'Activado' : 'Desactivado'); }
  if (el.id === 'file-import' && el.files && el.files[0]) { importarArchivo(el.files[0]); el.value = ''; }
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'buscar') { ui.q = e.target.value; $('#mov-lista').innerHTML = listaMovsHTML(); }
});

/* ---------------- Inicio ---------------- */
initChrome();
render();
// Entrada rápida: ?gasto=texto (atajo de Siri) o «ir directo a + Gasto»
(function entradaRapida() {
  const q = new URLSearchParams(location.search);
  const texto = q.get('gasto');
  const pidio = texto != null || q.has('nuevo');
  if (pidio) history.replaceState(null, '', location.pathname);
  const instalada = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const tieneDatos = S.movimientos.length > 0 || S.cuentas.some((c) => c.saldo != null);
  setTimeout(() => {
    if (pidio && !instalada && !tieneDatos) {
      // Se abrió en Safari, no en la app: aquí no hay datos. No guardamos nada en el lugar equivocado.
      openSheet(`<div class="form">${head('Se abrió en Safari')}
        <div class="banner banner-warn"><div class="b-ico">${ICON.alert}</div><div><b>Tus datos están en la app Zafiro, no aquí</b>Copia lo que dictaste, abre Zafiro desde su ícono y toca «📋 Pegar lo que dictaste».</div></div>
        ${texto ? `<div class="dictado"><b>${esc(texto)}</b></div><button class="btn btn-primary btn-xl" data-action="copiar-texto" data-texto="${esc(texto)}">📋 Copiar texto</button>` : ''}</div>`);
      return;
    }
    if (pidio || S.ajustes.abrirEnGasto) {
      sheetMov(null, 'gasto');
      if (texto) { const f = $('form[data-form=mov]'); if (f && f.elements.dictado) { f.elements.dictado.value = texto; sheetDirty = true; aplicarDictado(f); syncMovForm(f); } }
    }
  }, 900);
})();
// Logo de bienvenida: se ve ~1.6 s al abrir (o hasta que lo toques)
(function splash() {
  const el = $('#splash');
  if (!el) return;
  const quitar = () => { el.classList.add('fuera'); setTimeout(() => el.remove(), 600); };
  el.addEventListener('click', quitar, { once: true });
  setTimeout(quitar, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 600 : 1600);
})();
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
// Actualización automática: si hay versión nueva, se instala y la app se recarga sola (nunca con un formulario abierto)
let swReg = null;
let recargaPendiente = false;
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  const habiaVersion = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!habiaVersion) return;
    if ($('#sheet').hidden) location.reload(); else recargaPendiente = true;
  });
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').then((r) => { swReg = r; }).catch(() => {}));
}
// Al volver a la app: busca actualización y refresca la fecha si pasó la medianoche
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  if (swReg) swReg.update().catch(() => {});
  if ($('#sheet').hidden) { if (recargaPendiente) location.reload(); else render(); }
});
