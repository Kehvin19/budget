'use strict';

/* =====================================================
   1. Catégories
   ===================================================== */
const CATS = {
  depense: [
    { id: 'courses',     nom: 'Courses',     emoji: '🛒', color: '#3F8A4F' },
    { id: 'restos',      nom: 'Restos',      emoji: '🍔', color: '#E0822E' },
    { id: 'transport',   nom: 'Transport',   emoji: '🚆', color: '#2E5E9E' },
    { id: 'logement',    nom: 'Logement',    emoji: '🏠', color: '#7A5BA8' },
    { id: 'abonnements', nom: 'Abonnements', emoji: '📱', color: '#C0392F' },
    { id: 'loisirs',     nom: 'Loisirs',     emoji: '🎮', color: '#D1A032' },
    { id: 'shopping',    nom: 'Shopping',    emoji: '🛍️', color: '#CF5F92' },
    { id: 'sante',       nom: 'Santé',       emoji: '💊', color: '#2F9C93' },
    { id: 'etudes',      nom: 'Études',      emoji: '📚', color: '#5E7394' },
    { id: 'autre',       nom: 'Autre',       emoji: '📦', color: '#858B96' },
  ],
  revenu: [
    { id: 'salaire',      nom: 'Salaire',      emoji: '💼', color: '#2F7D43' },
    { id: 'aides',        nom: 'Aides',        emoji: '🤝', color: '#2F9C93' },
    { id: 'autre-revenu', nom: 'Autre revenu', emoji: '💰', color: '#D1A032' },
  ],
  epargne: [
    { id: 'livret', nom: 'Livret A', emoji: '🐷', color: '#2F7D43' },
  ],
};
function catInfo(type, id) {
  const list = CATS[type] || CATS.depense;
  return list.find(c => c.id === id) || list[list.length - 1];
}

// Les 4 types de mouvements sur le Livret A
const KINDS = {
  versement: { court: 'Je mets de côté', titre: 'Virement vers le livret', emoji: '🐷',
               aide: 'Ton compte courant baisse, ton livret augmente.' },
  retrait:   { court: 'Je retire',       titre: 'Retrait vers le compte',  emoji: '💸',
               aide: 'Ton livret baisse, ton compte courant augmente.' },
  externe:   { court: 'On me verse',     titre: 'Versement reçu',          emoji: '🎁',
               aide: 'Seul ton livret augmente : par exemple un virement de tes parents.' },
  interets:  { court: 'Intérêts',        titre: 'Intérêts',                emoji: '✨',
               aide: "Les intérêts versés par ta banque, en général en fin d'année." },
};

// Devine la catégorie à partir du libellé
const MOTS_CLES = [
  ['logement', /loyer|colocation|edf|engie|electricit|assurance habitation|internet box/i],
  ['restos', /mcdo|mcdonald|burger|kfc|quick|subway|starbucks|uber ?eats|deliveroo|domino|pizza|crous|boulangerie|sushi|kebab/i],
  ['courses', /carrefour|lidl|auchan|leclerc|intermarch|monoprix|franprix|casino|aldi|super ?u\b|picard|biocoop|netto|g20|spar/i],
  ['abonnements', /forfait|abonnement|netflix|spotify|deezer|disney|canal|apple\.com|icloud|prime video|amazon prime|free mobile|orange|sfr|bouygues|sosh|red by|youtube/i],
  ['transport', /sncf|ratp|navigo|uber|bolt|blablacar|total|esso|shell|station|parking|tcl|tisseo|keolis|transdev|ouigo|trainline/i],
  ['loisirs', /cin[eé]ma|ugc|path[eé]|fnac|steam|playstation|xbox|nintendo|basic.?fit|fitness|bowling|concert/i],
  ['shopping', /amazon|zara|h&m|decathlon|primark|uniqlo|shein|vinted|action\b|ikea/i],
  ['sante', /pharmacie|doctolib|m[eé]decin|dentiste|optic/i],
];
const MOTS_REVENUS = [
  ['salaire', /salaire|alternance|paie|job|stage/i],
  ['aides', /caf|apl|bourse|aide|prime d'activit/i],
];
function guessCat(label, type = 'depense') {
  for (const [cat, re] of (type === 'revenu' ? MOTS_REVENUS : MOTS_CLES)) if (re.test(label || '')) return cat;
  return type === 'revenu' ? 'autre-revenu' : 'autre';
}

/* =====================================================
   2. Données (stockées uniquement sur l'appareil)
   Le nom de rangement ne change pas : tes données sont gardées.
   ===================================================== */
const KEY = 'mon-budget-v1';
const defaultState = () => ({
  version: 2,
  startBalance: null,   // solde du compte courant au départ
  variableBudget: 0,    // budget mensuel du quotidien
  transactions: [],     // {id, type, amount, label, cat, date, planId?}
  plans: [],            // {id, type:'depense'|'revenu'|'epargne', amount, label, cat, freq, day, month, lastAdded, added}
  savings: { startBalance: null, ops: [] }, // ops: {id, kind, amount, label, date, planId?}
  lastExport: null,
});

function normalize(d) {
  const s = Object.assign(defaultState(), d);
  s.savings = Object.assign({ startBalance: null, ops: [] }, d && d.savings);
  if (!Array.isArray(s.savings.ops)) s.savings.ops = [];
  s.version = 2;
  return s;
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? normalize(JSON.parse(raw)) : defaultState();
  } catch (e) {
    return defaultState();
  }
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    toast("Enregistrement impossible : exporte une sauvegarde");
  }
}

let state = load();
let view = 'mois';
let opsMonth = null; // mois affiché dans « Opérations »

/* =====================================================
   3. Petits outils
   ===================================================== */
const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const money = n => euros.format(Math.round(n * 100) / 100 + 0);
const signedMoney = n => (n > 0 ? '+ ' : n < 0 ? '− ' : '') + money(Math.abs(n));
const sum = arr => arr.reduce((s, n) => s + n, 0);
const pad = n => String(n).padStart(2, '0');
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
// Effet sur le compte courant
const signed = t => (t.type === 'revenu' ? t.amount : -t.amount);
const courantEffect = o => (o.kind === 'versement' ? -o.amount : o.kind === 'retrait' ? o.amount : 0);
const livretEffect = o => (o.kind === 'retrait' ? -o.amount : o.amount);

function dateStr(d = new Date()) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function todayStr() { return dateStr(); }
function monthKey(d = new Date()) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; }
function addMonths(key, n) {
  const [y, m] = key.split('-').map(Number);
  return monthKey(new Date(y, m - 1 + n, 1));
}
function monthLabel(key, opts = { month: 'long', year: 'numeric' }) {
  const [y, m] = key.split('-').map(Number);
  return cap(new Date(y, m - 1, 1).toLocaleDateString('fr-FR', opts).replace('.', ''));
}
function dayLabel(d) {
  if (d === todayStr()) return "Aujourd'hui";
  const hier = new Date(); hier.setDate(hier.getDate() - 1);
  if (d === dateStr(hier)) return 'Hier';
  const [Y, M, D] = d.split('-').map(Number);
  return cap(new Date(Y, M - 1, D).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));
}
function shortDate(d) {
  const [Y, M, D] = d.split('-').map(Number);
  return new Date(Y, M - 1, D).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
// Comprend "12,50", "12.50", "1 234,56 €", "-20"…
function parseNumber(v) {
  let s = String(v ?? '').replace(/[\s\u00a0\u202f€]/g, '');
  const neg = /^[-−]/.test(s);
  s = s.replace(/[-−]/g, '');
  if (s.includes(',') && s.includes('.')) {
    s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else {
    s = s.replace(',', '.');
  }
  s = s.replace(/[^0-9.]/g, '');
  if (!s) return NaN;
  const n = Math.round(parseFloat(s) * 100) / 100;
  return isFinite(n) ? (neg ? -n : n) : NaN;
}
const fmtInput = n => (n === null || n === undefined || n === '') ? '' : Number(n).toFixed(2).replace('.', ',');

/* =====================================================
   4. Calculs
   ===================================================== */
function balance() {
  return (state.startBalance || 0)
    + sum(state.transactions.map(signed))
    + sum(state.savings.ops.map(courantEffect));
}
function livretBalance() {
  return (state.savings.startBalance || 0) + sum(state.savings.ops.map(livretEffect));
}
function txOfMonth(key) {
  return state.transactions.filter(t => t.date.startsWith(key));
}
function savOfMonth(key) {
  return state.savings.ops.filter(o => o.date.startsWith(key));
}
// Prévisions du mois en cours pas encore passées
function pendingThisMonth() {
  const mk = monthKey();
  return state.plans.filter(p =>
    p.freq === 'mois' ? p.lastAdded !== mk : (p.month === mk && !p.added));
}
function plansForMonth(key) {
  return state.plans.filter(p => p.freq === 'mois' || (p.freq === 'unique' && p.month === key));
}
// Dépenses du quotidien (hors dépenses prévues)
function variableSpent(key) {
  return sum(txOfMonth(key).filter(t => t.type === 'depense' && !t.planId).map(t => t.amount));
}
function catSpent(key, cat) {
  return sum(txOfMonth(key).filter(t => t.type === 'depense' && !t.planId && t.cat === cat).map(t => t.amount));
}
function pastMonthsWithData(n = 3) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    const k = addMonths(monthKey(), -i);
    if (txOfMonth(k).length) out.push(k);
  }
  return out;
}
function avgVariable() {
  const ks = pastMonthsWithData();
  return ks.length ? sum(ks.map(variableSpent)) / ks.length : null;
}
function fixedCharges() {
  return sum(state.plans.filter(p => p.freq === 'mois' && p.type === 'depense').map(p => p.amount));
}
function projection(months = 12) {
  const mk = monthKey();
  const budget = state.variableBudget || 0;
  const pending = pendingThisMonth();
  const resteBudget = Math.max(0, budget - variableSpent(mk));
  let bal = balance() + sum(pending.map(signed)) - resteBudget;
  let liv = livretBalance() + sum(pending.filter(p => p.type === 'epargne').map(p => p.amount));
  const rows = [{ key: mk, end: bal, livret: liv }];
  for (let i = 1; i < months; i++) {
    const k = addMonths(mk, i);
    const ps = plansForMonth(k);
    bal += sum(ps.map(signed)) - budget;
    liv += sum(ps.filter(p => p.type === 'epargne').map(p => p.amount));
    rows.push({ key: k, end: bal, livret: liv });
  }
  return rows;
}

/* =====================================================
   5. Conseils (calculés sur ton téléphone, rien n'est envoyé)
   ===================================================== */
function conseils() {
  const tips = [];
  const mk = monthKey(), now = new Date();
  const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const day = now.getDate(), daysLeft = dim - day + 1;
  const budget = state.variableBudget || 0;
  const spent = variableSpent(mk);
  const plans = state.plans;
  const hasData = state.transactions.length || plans.length;

  if (!hasData) {
    tips.push({ p: 100, emoji: '👋', text: "Commence par ajouter ton salaire et tes charges fixes (loyer, forfait…) dans Prévisions. Les conseils s'adapteront à ta situation." });
    return tips;
  }

  // Solde qui passe dans le rouge
  const rows = projection(12);
  const idx = rows.findIndex(r => r.end < 0);
  if (idx >= 0) {
    const effort = Math.ceil(-rows[idx].end / (idx + 1));
    tips.push({ p: 100, emoji: '🚨', text: `Ton compte passerait sous zéro en ${monthLabel(rows[idx].key).toLowerCase()}. En dépensant environ ${money(effort)} de moins par mois d'ici là, tu l'évites.` });
  }

  // Rythme des dépenses du quotidien
  if (budget > 0 && day >= 5) {
    const attendu = budget * day / dim;
    if (spent > attendu * 1.1) {
      const parJour = Math.max(0, (budget - spent) / daysLeft);
      tips.push({ p: 90, emoji: '🐢', text: `Tu as dépensé ${money(spent)} au quotidien ce mois-ci, alors qu'à cette date ton budget prévoyait environ ${money(attendu)}. Pour rester dans les clous, vise ${money(parJour)} par jour jusqu'à la fin du mois.` });
    } else if (day >= 10 && spent < attendu * 0.8) {
      tips.push({ p: 40, emoji: '👏', text: `Tu es en dessous de ton budget du quotidien : il te reste ${money(budget - spent)} pour ce mois. Tu pourrais en mettre une partie sur ton Livret A.` });
    }
  }
  if (!budget && plans.length) {
    tips.push({ p: 70, emoji: '🎯', text: "Fixe un budget du quotidien dans Prévisions (courses, sorties…). C'est ce qui rend tes prévisions fiables." });
  }

  // Catégorie qui dérape par rapport à d'habitude
  const past = pastMonthsWithData();
  if (past.length && day >= 10) {
    for (const c of CATS.depense) {
      const now$ = catSpent(mk, c.id);
      const moy = sum(past.map(k => catSpent(k, c.id))) / past.length;
      if (moy > 0 && now$ > moy * 1.3 && now$ - moy > 20) {
        tips.push({ p: 55, emoji: c.emoji, text: `Tes dépenses ${c.nom.toLowerCase()} ce mois-ci (${money(now$)}) dépassent déjà ta moyenne habituelle (${money(moy)}).` });
        break;
      }
    }
  }

  // Se payer en premier
  const aSalaire = plans.some(p => p.type === 'revenu');
  const aEpargne = plans.some(p => p.type === 'epargne' && p.freq === 'mois');
  if (aSalaire && !aEpargne) {
    tips.push({ p: 60, emoji: '🐷', text: "Programme un virement vers ton Livret A juste après ton salaire, même 20 €. L'argent mis de côté en premier ne se dépense pas. Ajoute-le dans Prévisions, type Épargne." });
  }

  // Matelas de sécurité
  const fixe = fixedCharges();
  if (fixe > 0) {
    const cible = fixe * 3, liv = livretBalance();
    if (liv < cible) {
      tips.push({ p: 50, emoji: '🛟', text: `Vise un matelas de sécurité de 3 mois de charges fixes, soit ${money(cible)} sur ton Livret A. Il te manque ${money(cible - liv)}.` });
    }
  }

  // Abonnements
  const abos = sum(plans.filter(p => p.freq === 'mois' && p.type === 'depense' && p.cat === 'abonnements').map(p => p.amount));
  if (abos >= 20) {
    tips.push({ p: 45, emoji: '📱', text: `Tes abonnements te coûtent ${money(abos)} par mois, soit ${money(abos * 12)} par an. Vérifie que tu les utilises tous.` });
  }

  // Petites dépenses
  const petites = txOfMonth(mk).filter(t => t.type === 'depense' && !t.planId && t.amount < 10);
  if (petites.length >= 8) {
    tips.push({ p: 35, emoji: '🪙', text: `Tu as fait ${petites.length} petits achats de moins de 10 € ce mois-ci, pour un total de ${money(sum(petites.map(t => t.amount)))}. Mis bout à bout, ça compte.` });
  }

  // Aides possibles pour un alternant
  const aAides = plans.some(p => p.cat === 'aides') || state.transactions.some(t => t.cat === 'aides');
  if (aSalaire && !aAides) {
    tips.push({ p: 20, emoji: '🤝', text: "En alternance, tu as peut-être droit à la prime d'activité ou aux APL. Fais une simulation gratuite sur caf.fr, ça prend 10 minutes." });
  }

  return tips.sort((a, b) => b.p - a.p);
}

/* =====================================================
   6. Morceaux d'interface
   ===================================================== */
const bubble = (color, emoji) => `<span class="bubble" style="background:${color}24">${emoji}</span>`;

function txRow(t) {
  const c = catInfo(t.type, t.cat);
  return `<li><button class="row" data-act="edit-tx" data-id="${t.id}">
    ${bubble(c.color, c.emoji)}
    <span class="row-main">
      <span class="row-title">${esc(t.label || c.nom)}</span>
      <span class="row-sub">${esc(c.nom)}${t.planId ? ' (prévu)' : ''}</span>
    </span>
    <span class="row-amount ${t.type === 'revenu' ? 'revenu' : ''}">${signedMoney(signed(t))}</span>
  </button></li>`;
}

// Un virement livret vu depuis le compte courant
function savCourantRow(o) {
  return `<li><button class="row" data-act="edit-sav" data-id="${o.id}">
    ${bubble('#2F7D43', '🐷')}
    <span class="row-main">
      <span class="row-title">${o.kind === 'versement' ? 'Vers ton Livret A' : 'Depuis ton Livret A'}</span>
      <span class="row-sub">Virement${o.label ? ', ' + esc(o.label) : ''}</span>
    </span>
    <span class="row-amount ${o.kind === 'retrait' ? 'revenu' : ''}">${signedMoney(courantEffect(o))}</span>
  </button></li>`;
}

// Un mouvement vu depuis le livret
function savRow(o) {
  const k = KINDS[o.kind] || KINDS.versement;
  const e = livretEffect(o);
  return `<li><button class="row" data-act="edit-sav" data-id="${o.id}">
    ${bubble('#2F7D43', k.emoji)}
    <span class="row-main">
      <span class="row-title">${esc(o.label || k.titre)}</span>
      <span class="row-sub">${o.label ? k.titre + ', ' : ''}${shortDate(o.date)}</span>
    </span>
    <span class="row-amount ${e > 0 ? 'revenu' : ''}">${signedMoney(e)}</span>
  </button></li>`;
}

function pendingRow(p) {
  const c = catInfo(p.type, p.cat);
  const quand = p.freq === 'mois' ? `Le ${p.day}` : 'Ce mois-ci';
  const bouton = p.type === 'revenu' ? 'Reçu' : p.type === 'epargne' ? 'Fait' : 'Payé';
  return `<li class="row">
    ${bubble(c.color, c.emoji)}
    <span class="row-main">
      <span class="row-title">${esc(p.label || c.nom)}</span>
      <span class="row-sub">${quand}, ${signedMoney(signed(p))}</span>
    </span>
    <span class="row-actions">
      <button class="btn small ghost" data-act="plan-skip" data-id="${p.id}">Ignorer</button>
      <button class="btn small" data-act="plan-done" data-id="${p.id}">${bouton}</button>
    </span>
  </li>`;
}

function planRow(p) {
  const c = catInfo(p.type, p.cat);
  let quand = p.freq === 'mois' ? `Le ${p.day} de chaque mois` : monthLabel(p.month);
  if (p.type === 'epargne') quand = 'Vers Livret A, ' + quand.charAt(0).toLowerCase() + quand.slice(1);
  return `<li><button class="row" data-act="edit-plan" data-id="${p.id}">
    ${bubble(c.color, c.emoji)}
    <span class="row-main">
      <span class="row-title">${esc(p.label || c.nom)}</span>
      <span class="row-sub">${quand}</span>
    </span>
    <span class="row-amount ${p.type === 'revenu' ? 'revenu' : ''}">${signedMoney(signed(p))}</span>
  </button></li>`;
}

function donut(txs) {
  const dep = txs.filter(t => t.type === 'depense');
  const total = sum(dep.map(t => t.amount));
  if (!total) return `<p class="empty">Aucune dépense ce mois-ci pour l'instant.</p>`;
  const parts = CATS.depense
    .map(c => ({ c, v: sum(dep.filter(t => catInfo('depense', t.cat).id === c.id).map(t => t.amount)) }))
    .filter(p => p.v > 0)
    .sort((a, b) => b.v - a.v);
  let offset = 0;
  const arcs = parts.map(p => {
    const pct = p.v / total * 100;
    const s = `<circle r="15.9155" cx="21" cy="21" fill="none" stroke="${p.c.color}" stroke-width="5.5"
      stroke-dasharray="${pct.toFixed(3)} ${(100 - pct).toFixed(3)}" stroke-dashoffset="${(-offset).toFixed(3)}"/>`;
    offset += pct;
    return s;
  }).join('');
  return `<div class="donut-wrap">
    <svg viewBox="0 0 42 42" class="donut" role="img" aria-label="Dépenses par catégorie">
      <g transform="rotate(-90 21 21)">${arcs}</g>
      <text x="21" y="22.6" text-anchor="middle" class="donut-total">${money(total)}</text>
    </svg>
    <ul class="legend">${parts.map(p => `<li><i style="background:${p.c.color}"></i><span>${p.c.emoji} ${p.c.nom}</span><strong>${money(p.v)}</strong></li>`).join('')}</ul>
  </div>`;
}

function chart(rows, field = 'end', cls = '') {
  const W = 340, H = 170, padT = 8, padB = 22;
  const vals = rows.map(r => r[field]);
  const max = Math.max(0, ...vals), min = Math.min(0, ...vals);
  const span = (max - min) || 1;
  const y = v => padT + (max - v) / span * (H - padT - padB);
  const bw = W / rows.length, zero = y(0);
  const bars = rows.map((r, i) => {
    const v = r[field];
    const x = i * bw + bw * 0.18, w = bw * 0.64;
    const top = Math.min(y(v), zero), h = Math.max(2, Math.abs(y(v) - zero));
    const c = 'bar' + (v < 0 ? ' neg' : '') + (i === 0 ? ' now' : '');
    return `<rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="3" class="${c}"><title>${monthLabel(r.key)} : ${money(v)}</title></rect>
      <text x="${(i * bw + bw / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle" class="axis">${monthLabel(r.key, { month: 'short' }).slice(0, 4)}</text>`;
  }).join('');
  return `<div class="chart ${cls}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution prévue">
    ${bars}<line x1="0" x2="${W}" y1="${zero.toFixed(1)}" y2="${zero.toFixed(1)}" class="zero"/></svg></div>`;
}

function typeSeg(type, avecEpargne = false) {
  const opt = (v, txt) => `<label><input class="sr" type="radio" name="type" value="${v}" ${type === v ? 'checked' : ''}><span>${txt}</span></label>`;
  return `<div class="seg" role="radiogroup" aria-label="Type">${opt('depense', 'Dépense')}${opt('revenu', 'Revenu')}${avecEpargne ? opt('epargne', 'Épargne') : ''}</div>`;
}

function chips(type, selected) {
  const list = CATS[type];
  const sel = list.some(c => c.id === selected) ? selected : list[0].id;
  return list.map(c => `<label style="--c:${c.color}"><input class="sr" type="radio" name="cat" value="${c.id}" ${c.id === sel ? 'checked' : ''}><span>${c.emoji} ${c.nom}</span></label>`).join('');
}

function tipsList(tips) {
  const item = t => `<li><span class="tip-emoji" aria-hidden="true">${t.emoji}</span><p>${t.text}</p></li>`;
  const top = tips.slice(0, 3), reste = tips.slice(3);
  return `<ul class="tips">${top.map(item).join('')}</ul>
    ${reste.length ? `<details class="more"><summary>Voir ${reste.length} autre${reste.length > 1 ? 's' : ''} conseil${reste.length > 1 ? 's' : ''}</summary><ul class="tips">${reste.map(item).join('')}</ul></details>` : ''}`;
}

const gearIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>`;

/* =====================================================
   7. Les écrans
   ===================================================== */
function renderMois() {
  const mk = monthKey(), now = new Date();
  const dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const day = now.getDate(), daysLeft = dim - day + 1;
  const moisNom = now.toLocaleDateString('fr-FR', { month: 'long' });
  const pending = pendingThisMonth().sort((a, b) => (a.day || 0) - (b.day || 0));
  const pendNet = sum(pending.map(signed));
  const bal = balance();
  const dispo = bal + pendNet;
  const txs = txOfMonth(mk);
  const rev = sum(txs.filter(t => t.type === 'revenu').map(t => t.amount));
  const dep = sum(txs.filter(t => t.type === 'depense').map(t => t.amount));
  const livMois = sum(savOfMonth(mk).map(livretEffect));

  let ticks = '';
  for (let i = 1; i <= dim; i++) ticks += `<i class="${i < day ? 'past' : i === day ? 'today' : ''}"></i>`;

  const setup = state.startBalance === null ? `<section class="setup">
      <h2>Pour commencer</h2>
      <p>Indique combien il y a sur ton compte courant aujourd'hui. L'app calcule tout à partir de là.</p>
      <form id="setup-form" class="inline-form">
        <label class="field"><span>Solde actuel</span><input name="solde" inputmode="decimal" placeholder="Ex. 850,00" required></label>
        <button class="btn primary">Enregistrer</button>
      </form>
    </section>` : '';

  const besoinSauvegarde = state.transactions.length >= 5 &&
    (!state.lastExport || Date.now() - state.lastExport > 30 * 864e5);
  const rappel = besoinSauvegarde ? `<section class="notice">
      <p>Tes données sont uniquement sur ce téléphone. Pense à exporter une sauvegarde.</p>
      <button class="btn small" data-act="export">Exporter</button>
    </section>` : '';

  const recent = [...state.transactions].sort(byDateDesc).slice(0, 5);

  return `<header class="page-head"><h1>Ce mois-ci</h1>
    <button class="icon-btn big" data-view="reglages" aria-label="Réglages">${gearIcon}</button></header>
  ${setup}
  <section class="hero">
    <p class="hero-label">Disponible jusqu'au ${dim} ${moisNom}</p>
    <p class="hero-amount">${money(dispo)}</p>
    <p class="hero-sub">${dispo > 0
      ? `Soit ${money(dispo / daysLeft)} par jour pendant ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.`
      : `Tes dépenses prévues dépassent ton solde de ${money(-dispo)}.`}</p>
    <div class="jauge" role="img" aria-label="Jour ${day} sur ${dim}">${ticks}</div>
    <div class="hero-meta">
      <div><span>Compte courant</span><strong>${money(bal)}</strong></div>
      <div><span>Encore prévu ce mois</span><strong>${signedMoney(pendNet)}</strong></div>
    </div>
  </section>
  <button class="mini-card" data-view="epargne">
    ${bubble('#2F7D43', '🐷')}
    <span class="row-main">
      <span class="row-title">Livret A</span>
      <span class="row-sub">${state.savings.startBalance === null ? 'Touche ici pour ajouter ton livret' : `Ce mois-ci : ${signedMoney(livMois)}`}</span>
    </span>
    <span class="row-amount">${money(livretBalance())}</span>
  </button>
  ${rappel}
  ${pending.length ? `<section class="block">
    <div class="block-head"><h2>À venir ce mois-ci</h2></div>
    <ul class="list">${pending.map(pendingRow).join('')}</ul>
    <p class="hint">Touche « Payé », « Reçu » ou « Fait » quand l'opération passe sur ton compte.</p>
  </section>` : ''}
  <section class="block">
    <div class="block-head"><h2>Conseils</h2></div>
    ${tipsList(conseils())}
  </section>
  <section class="block">
    <div class="block-head"><h2>${cap(moisNom)} en bref</h2></div>
    <div class="duo">
      <div><span>Entrées</span><strong class="revenu">${signedMoney(rev)}</strong></div>
      <div><span>Sorties</span><strong>${signedMoney(-dep)}</strong></div>
    </div>
    ${donut(txs)}
  </section>
  <section class="block">
    <div class="block-head"><h2>Dernières opérations</h2>${recent.length ? '<button class="link" data-view="ops">Tout voir</button>' : ''}</div>
    ${recent.length
      ? `<ul class="list">${recent.map(txRow).join('')}</ul>`
      : `<p class="empty">Touche le bouton + en bas pour ajouter ta première dépense.</p>`}
  </section>`;
}

function renderOps() {
  const txs = txOfMonth(opsMonth);
  const virements = savOfMonth(opsMonth).filter(o => o.kind === 'versement' || o.kind === 'retrait');
  const items = [...txs.map(t => ({ ...t, _k: 'tx' })), ...virements.map(o => ({ ...o, _k: 'sav' }))].sort(byDateDesc);
  const rev = sum(txs.filter(t => t.type === 'revenu').map(t => t.amount));
  const dep = sum(txs.filter(t => t.type === 'depense').map(t => t.amount));
  const groups = {};
  items.forEach(t => (groups[t.date] ||= []).push(t));
  const list = Object.keys(groups).map(d =>
    `<h3 class="day">${dayLabel(d)}</h3><ul class="list">${groups[d].map(x => x._k === 'tx' ? txRow(x) : savCourantRow(x)).join('')}</ul>`).join('');

  return `<header class="page-head"><h1>Opérations</h1></header>
  <div class="month-nav">
    <button data-act="ops-prev" aria-label="Mois précédent">‹</button>
    <strong>${monthLabel(opsMonth)}</strong>
    <button data-act="ops-next" aria-label="Mois suivant" ${opsMonth >= monthKey() ? 'disabled' : ''}>›</button>
  </div>
  <div class="duo">
    <div><span>Entrées</span><strong class="revenu">${signedMoney(rev)}</strong></div>
    <div><span>Sorties</span><strong>${signedMoney(-dep)}</strong></div>
  </div>
  ${items.length ? list : `<p class="empty">Aucune opération en ${monthLabel(opsMonth, { month: 'long' }).toLowerCase()}.</p>`}`;
}

function renderEpargne() {
  const s = state.savings, mk = monthKey();
  const liv = livretBalance();
  const moisNet = sum(savOfMonth(mk).map(livretEffect));
  const parToi = sum(s.ops.filter(o => o.kind === 'versement' || o.kind === 'retrait').map(livretEffect));
  const parAutres = sum(s.ops.filter(o => o.kind === 'externe').map(o => o.amount));
  const plansEp = state.plans.filter(p => p.type === 'epargne' && p.freq === 'mois');
  const mensuel = sum(plansEp.map(p => p.amount));
  const rows = projection(12);
  const last = rows[rows.length - 1];
  const fixe = fixedCharges();

  const setup = s.startBalance === null ? `<section class="setup">
      <h2>Ton Livret A</h2>
      <p>Combien il y a sur ton Livret A aujourd'hui ? Regarde dans l'app de ta banque.</p>
      <form id="sav-setup" class="inline-form">
        <label class="field"><span>Montant actuel</span><input name="solde" inputmode="decimal" placeholder="Ex. 1 200,00" required></label>
        <button class="btn primary">Enregistrer</button>
      </form>
    </section>` : '';

  const groups = {};
  [...s.ops].sort(byDateDesc).forEach(o => (groups[o.date.slice(0, 7)] ||= []).push(o));
  const historique = Object.keys(groups).map(k =>
    `<h3 class="day">${monthLabel(k)}</h3><ul class="list">${groups[k].map(savRow).join('')}</ul>`).join('');

  let matelas = '';
  if (fixe > 0) {
    const cible = fixe * 3, pct = Math.max(0, Math.min(100, liv / cible * 100));
    matelas = `<section class="block">
      <div class="block-head"><h2>Matelas de sécurité</h2></div>
      <div class="goal">
        <div class="goal-bar" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct.toFixed(1)}%"></i></div>
        <p>${money(liv)} sur ${money(cible)}, soit 3 mois de charges fixes. ${pct >= 100 ? 'Objectif atteint, bravo !' : `Encore ${money(cible - liv)}.`}</p>
      </div>
    </section>`;
  }

  return `<header class="page-head"><h1>Épargne</h1></header>
  ${setup}
  <section class="hero save">
    <p class="hero-label">Livret A</p>
    <p class="hero-amount">${money(liv)}</p>
    <p class="hero-sub">Ce mois-ci : ${signedMoney(moisNet)}</p>
    <div class="hero-meta">
      <div><span>Mis de côté par toi</span><strong>${signedMoney(parToi)}</strong></div>
      <div><span>Reçu de tes proches</span><strong>${signedMoney(parAutres)}</strong></div>
    </div>
  </section>
  <div class="btn-row" style="margin-bottom:28px">
    <button class="btn primary grow" data-act="add-sav" data-kind="versement">Mettre de côté</button>
    <button class="btn grow" data-act="add-sav" data-kind="externe">J'ai reçu un virement</button>
  </div>

  <section class="block">
    <div class="block-head"><h2>Dans un an</h2></div>
    ${plansEp.length
      ? `${chart(rows, 'livret', 'save')}<p class="hint">Avec ${money(mensuel)} mis de côté chaque mois, ton livret serait à environ ${money(last.livret)} fin ${monthLabel(last.key).toLowerCase()}.</p>`
      : `<div class="empty"><p style="margin:0 0 12px">Programme un virement mensuel vers ton livret pour voir comment il va grandir.</p>
         <button class="btn small" data-act="add-plan" data-freq="mois" data-type="epargne">Programmer un virement</button></div>`}
  </section>
  ${matelas}
  <section class="block">
    <div class="block-head"><h2>Historique</h2></div>
    ${historique || `<p class="empty">Aucun mouvement pour l'instant. Touche le bouton + pour en ajouter un.</p>`}
  </section>`;
}

function renderPrev() {
  const rows = projection(12);
  const firstNeg = rows.find(r => r.end < 0);
  const mensuels = state.plans.filter(p => p.freq === 'mois').sort((a, b) => a.day - b.day);
  const uniques = state.plans.filter(p => p.freq === 'unique' && p.month >= monthKey())
    .sort((a, b) => a.month.localeCompare(b.month));
  const entrees = sum(mensuels.filter(p => p.type === 'revenu').map(p => p.amount));
  const sorties = sum(mensuels.filter(p => p.type === 'depense').map(p => p.amount));
  const epargne = sum(mensuels.filter(p => p.type === 'epargne').map(p => p.amount));
  const net = entrees - sorties - epargne - (state.variableBudget || 0);
  const avg = avgVariable();
  const last = rows[rows.length - 1];

  let message;
  if (firstNeg) message = `<p class="alert">Attention : ton compte passerait sous zéro en ${monthLabel(firstNeg.key).toLowerCase()}.</p>`;
  else if (net >= 0) message = `<p class="hint">Chaque mois, il te reste environ ${money(net)} sur ton compte courant${epargne ? `, en plus des ${money(epargne)} versés sur ton Livret A` : ''}.</p>`;
  else message = `<p class="hint">Chaque mois, ton compte courant baisse d'environ ${money(-net)}.</p>`;

  return `<header class="page-head"><h1>Prévisions</h1></header>
  <section class="block">
    <p class="big-line">Fin ${monthLabel(last.key).toLowerCase()}, tu aurais environ
      <strong class="${last.end < 0 ? 'neg' : ''}">${money(last.end)}</strong>
      sur ton compte courant, et ${money(last.livret)} sur ton Livret A.</p>
    ${chart(rows)}
    ${message}
  </section>

  <section class="block">
    <div class="block-head"><h2>Chaque mois</h2><button class="link" data-act="add-plan" data-freq="mois">Ajouter</button></div>
    ${mensuels.length
      ? `<ul class="list">${mensuels.map(planRow).join('')}</ul>
         <div class="duo" style="margin-top:10px">
           <div><span>Entrées fixes</span><strong class="revenu">${signedMoney(entrees)}</strong></div>
           <div><span>Sorties fixes</span><strong>${signedMoney(-sorties)}</strong></div>
         </div>`
      : `<p class="empty">Ajoute ton salaire, ton loyer, ton forfait, ton épargne : tout ce qui revient chaque mois.</p>`}
  </section>

  <section class="block">
    <div class="block-head"><h2>Dépenses du quotidien</h2></div>
    <p class="hint">Combien tu comptes dépenser par mois en courses, sorties, etc., en plus des dépenses fixes.</p>
    <form id="budget-form" class="inline-form">
      <label class="field"><span>Budget par mois</span><input name="budget" inputmode="decimal" placeholder="0,00" value="${state.variableBudget ? fmtInput(state.variableBudget) : ''}"></label>
      <button class="btn primary">Enregistrer</button>
    </form>
    ${avg !== null ? `<p class="hint">Ces derniers mois, tu as dépensé en moyenne ${money(avg)} au quotidien.</p>` : ''}
  </section>

  <section class="block">
    <div class="block-head"><h2>Une seule fois</h2><button class="link" data-act="add-plan" data-freq="unique">Ajouter</button></div>
    ${uniques.length
      ? `<ul class="list">${uniques.map(planRow).join('')}</ul>`
      : `<p class="empty">Un voyage, des frais d'inscription, un cadeau, une prime ? Ajoute-les ici pour les voir dans tes prévisions.</p>`}
  </section>

  <details class="block">
    <summary>Détail mois par mois</summary>
    <ul class="list">${rows.map(r => `<li class="row"><span class="row-main"><span class="row-title">${monthLabel(r.key)}</span><span class="row-sub">Livret A : ${money(r.livret)}</span></span><span class="row-amount ${r.end < 0 ? 'neg' : ''}">${money(r.end)}</span></li>`).join('')}</ul>
  </details>`;
}

function renderReglages() {
  const lien = `${location.origin}${location.pathname}#ajout?montant=12,50&commerce=Carrefour`;
  return `<header class="page-head"><h1>Réglages</h1></header>
  <section class="block">
    <div class="block-head"><h2>Soldes de départ</h2></div>
    <p class="hint">Le montant de tes comptes quand tu as commencé à utiliser l'app. Tous tes mouvements s'ajoutent à partir de là.</p>
    <form id="start-form" class="inline-form" style="margin-bottom:12px">
      <label class="field"><span>Compte courant</span><input name="solde" inputmode="decimal" placeholder="0,00" value="${fmtInput(state.startBalance)}"></label>
      <button class="btn primary">Enregistrer</button>
    </form>
    <form id="sav-start" class="inline-form">
      <label class="field"><span>Livret A</span><input name="solde" inputmode="decimal" placeholder="0,00" value="${fmtInput(state.savings.startBalance)}"></label>
      <button class="btn primary">Enregistrer</button>
    </form>
  </section>

  <section class="block">
    <div class="block-head"><h2>Sauvegarde</h2></div>
    <p class="hint">Tes données sont uniquement sur cet appareil. Exporte une sauvegarde régulièrement et choisis « Enregistrer dans Fichiers », puis iCloud Drive.</p>
    <div class="btn-row">
      <button class="btn primary" data-act="export">Exporter une sauvegarde</button>
      <button class="btn" data-act="import">Importer une sauvegarde</button>
    </div>
    ${state.lastExport ? `<p class="hint">Dernière sauvegarde : ${new Date(state.lastExport).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>` : ''}
  </section>

  <section class="block">
    <div class="block-head"><h2>Ajout rapide</h2></div>
    <p class="hint">Ouvrir cette adresse pré-remplit une dépense. On s'en servira plus tard avec l'app Raccourcis.</p>
    <code class="code">${esc(lien)}</code>
  </section>

  <section class="block">
    <button class="btn danger" data-act="reset">Effacer toutes les données</button>
  </section>
  <p class="foot">Mon budget, version 2. Aucune donnée ne quitte ton appareil.</p>`;
}

const byDateDesc = (a, b) => b.date.localeCompare(a.date) || (b.created || 0) - (a.created || 0);

const $view = document.getElementById('view');
const sheet = document.getElementById('sheet');

function render() {
  const screens = { mois: renderMois, ops: renderOps, epargne: renderEpargne, prev: renderPrev, reglages: renderReglages };
  $view.innerHTML = screens[view]();
  document.querySelectorAll('.tabbar [data-view]').forEach(b =>
    b.setAttribute('aria-current', b.dataset.view === view ? 'page' : 'false'));
}

/* =====================================================
   8. Fenêtres d'ajout / modification
   ===================================================== */
function sheetHead(titre) {
  return `<div class="sheet-head"><h2>${titre}</h2>
    <button type="button" class="icon-btn" data-act="close" aria-label="Fermer">✕</button></div>`;
}

function openTxForm(tx = null, prefill = null) {
  const d = tx || prefill || {};
  const type = d.type || 'depense';
  const hasAmount = d.amount !== undefined && d.amount !== '' && !isNaN(d.amount);
  sheet.innerHTML = `<form id="tx-form" class="sheet-body" data-edit="${tx ? tx.id : ''}" autocomplete="off">
    ${sheetHead(tx ? "Modifier l'opération" : 'Nouvelle opération')}
    ${typeSeg(type)}
    <label class="amount-field"><input name="amount" inputmode="decimal" placeholder="0,00" aria-label="Montant" value="${hasAmount ? fmtInput(d.amount) : ''}" ${!tx && !hasAmount ? 'autofocus' : ''}><span>€</span></label>
    <p class="form-error" hidden></p>
    <label class="field"><span>Libellé</span><input name="label" maxlength="60" placeholder="Ex. Carrefour, cinéma, loyer" value="${esc(d.label || '')}"></label>
    <fieldset class="cats"><legend>Catégorie</legend><div class="chips" data-chips>${chips(type, d.cat)}</div></fieldset>
    <label class="field"><span>Date</span><input type="date" name="date" value="${d.date || todayStr()}" required></label>
    <div class="sheet-actions">
      ${tx ? `<button type="button" class="btn danger" data-act="delete-tx" data-id="${tx.id}">Supprimer</button>` : ''}
      <button class="btn primary grow" type="submit">Enregistrer</button>
    </div>
  </form>`;
  sheet.showModal();
}

function openSavForm(o = null, kind = 'versement') {
  const k = o ? o.kind : kind;
  const opt = v => `<label><input class="sr" type="radio" name="kind" value="${v}" ${k === v ? 'checked' : ''}><span>${KINDS[v].emoji} ${KINDS[v].court}</span></label>`;
  sheet.innerHTML = `<form id="sav-form" class="sheet-body" data-edit="${o ? o.id : ''}" autocomplete="off">
    ${sheetHead(o ? 'Modifier le mouvement' : 'Livret A')}
    <div class="seg grid2" role="radiogroup" aria-label="Type de mouvement">${opt('versement')}${opt('retrait')}${opt('externe')}${opt('interets')}</div>
    <p class="hint center" data-kind-help>${KINDS[k].aide}</p>
    <label class="amount-field"><input name="amount" inputmode="decimal" placeholder="0,00" aria-label="Montant" value="${o ? fmtInput(o.amount) : ''}" ${o ? '' : 'autofocus'}><span>€</span></label>
    <p class="form-error" hidden></p>
    <label class="field"><span>Note (facultatif)</span><input name="label" maxlength="60" placeholder="Ex. Papa, anniversaire, vacances" value="${esc(o ? o.label : '')}"></label>
    <label class="field"><span>Date</span><input type="date" name="date" value="${o ? o.date : todayStr()}" required></label>
    <div class="sheet-actions">
      ${o ? `<button type="button" class="btn danger" data-act="delete-sav" data-id="${o.id}">Supprimer</button>` : ''}
      <button class="btn primary grow" type="submit">Enregistrer</button>
    </div>
  </form>`;
  sheet.showModal();
}

function openPlanForm(p = null, freq = 'mois', type = 'depense') {
  const d = p || { type, freq, day: 1, month: addMonths(monthKey(), 1) };
  sheet.innerHTML = `<form id="plan-form" class="sheet-body" data-edit="${p ? p.id : ''}" autocomplete="off">
    ${sheetHead(p ? 'Modifier la prévision' : 'Nouvelle prévision')}
    ${typeSeg(d.type, true)}
    <label class="amount-field"><input name="amount" inputmode="decimal" placeholder="0,00" aria-label="Montant" value="${p ? fmtInput(p.amount) : ''}"><span>€</span></label>
    <p class="form-error" hidden></p>
    <label class="field"><span>Libellé</span><input name="label" maxlength="60" placeholder="Ex. Loyer, salaire, Netflix" value="${esc(d.label || (d.type === 'epargne' ? 'Épargne Livret A' : ''))}"></label>
    <div class="seg" role="radiogroup" aria-label="Fréquence">
      <label><input class="sr" type="radio" name="freq" value="mois" ${d.freq === 'mois' ? 'checked' : ''}><span>Chaque mois</span></label>
      <label><input class="sr" type="radio" name="freq" value="unique" ${d.freq === 'unique' ? 'checked' : ''}><span>Une seule fois</span></label>
    </div>
    <label class="field" data-for="mois" ${d.freq !== 'mois' ? 'hidden' : ''}><span>Jour du mois</span><input type="number" name="day" min="1" max="31" inputmode="numeric" value="${d.day || 1}"></label>
    <label class="field" data-for="unique" ${d.freq !== 'unique' ? 'hidden' : ''}><span>Mois</span><input type="month" name="month" min="${monthKey()}" value="${d.month || addMonths(monthKey(), 1)}"></label>
    <fieldset class="cats" ${d.type === 'epargne' ? 'hidden' : ''}><legend>Catégorie</legend><div class="chips" data-chips>${chips(d.type, d.cat)}</div></fieldset>
    <div class="sheet-actions">
      ${p ? `<button type="button" class="btn danger" data-act="delete-plan" data-id="${p.id}">Supprimer</button>` : ''}
      <button class="btn primary grow" type="submit">Enregistrer</button>
    </div>
  </form>`;
  sheet.showModal();
}

function formError(f, msg) {
  const el = f.querySelector('.form-error');
  el.textContent = msg;
  el.hidden = false;
  f.elements.amount.focus();
}
const checkedCat = f => (f.querySelector('input[name=cat]:checked') || {}).value || 'autre';

function saveTx(f) {
  const el = f.elements;
  const amount = Math.abs(parseNumber(el.amount.value));
  if (!amount) return formError(f, 'Indique un montant, par exemple 12,50');
  const data = { type: el.type.value, amount, label: el.label.value.trim(), cat: checkedCat(f), date: el.date.value || todayStr() };
  const id = f.dataset.edit;
  if (id) Object.assign(state.transactions.find(t => t.id === id), data);
  else state.transactions.push({ id: uid(), created: Date.now(), ...data });
  save(); sheet.close(); render();
  toast(id ? 'Opération modifiée' : 'Opération ajoutée');
}

function saveSav(f) {
  const el = f.elements;
  const amount = Math.abs(parseNumber(el.amount.value));
  if (!amount) return formError(f, 'Indique un montant, par exemple 50');
  const data = { kind: el.kind.value, amount, label: el.label.value.trim(), date: el.date.value || todayStr() };
  const id = f.dataset.edit;
  if (id) Object.assign(state.savings.ops.find(o => o.id === id), data);
  else state.savings.ops.push({ id: uid(), created: Date.now(), ...data });
  save(); sheet.close(); render();
  toast(id ? 'Mouvement modifié' : 'Mouvement ajouté');
}

function savePlan(f) {
  const el = f.elements;
  const amount = Math.abs(parseNumber(el.amount.value));
  if (!amount) return formError(f, 'Indique un montant, par exemple 450');
  const type = el.type.value;
  const data = {
    type, amount,
    label: el.label.value.trim(),
    cat: type === 'epargne' ? 'livret' : checkedCat(f),
    freq: el.freq.value,
    day: Math.min(31, Math.max(1, parseInt(el.day.value, 10) || 1)),
    month: el.month.value || addMonths(monthKey(), 1),
  };
  const id = f.dataset.edit;
  if (id) Object.assign(state.plans.find(p => p.id === id), data);
  else state.plans.push({ id: uid(), lastAdded: null, added: false, ...data });
  save(); sheet.close(); render();
  toast(id ? 'Prévision modifiée' : 'Prévision ajoutée');
}

// Une prévision vient de passer : on l'ajoute aux opérations
function markPlanDone(id) {
  const p = state.plans.find(x => x.id === id);
  if (!p) return;
  const base = { id: uid(), created: Date.now(), amount: p.amount, label: p.label, date: todayStr(), planId: p.id };
  if (p.type === 'epargne') state.savings.ops.push({ ...base, kind: 'versement' });
  else state.transactions.push({ ...base, type: p.type, cat: p.cat });
  if (p.freq === 'mois') p.lastAdded = monthKey(); else p.added = true;
  save(); render();
  toast(p.type === 'epargne' ? 'Ajouté à ton Livret A' : 'Ajouté aux opérations');
}
function skipPlan(id) {
  const p = state.plans.find(x => x.id === id);
  if (!p) return;
  if (p.freq === 'mois') p.lastAdded = monthKey(); else p.added = true;
  save(); render();
  toast('Ignoré pour ce mois');
}
// Si on supprime une opération issue d'une prévision, la prévision redevient « à venir »
function unmarkPlan(item) {
  const p = item && item.planId && state.plans.find(x => x.id === item.planId);
  if (!p) return;
  if (p.freq === 'mois' && p.lastAdded === item.date.slice(0, 7)) p.lastAdded = null;
  if (p.freq === 'unique') p.added = false;
}

/* =====================================================
   9. Sauvegarde : export / import
   ===================================================== */
async function exportData() {
  const name = `budget-sauvegarde-${todayStr()}.json`;
  const file = new File([JSON.stringify(state, null, 2)], name, { type: 'application/json' });
  const done = () => { state.lastExport = Date.now(); save(); render(); toast('Sauvegarde exportée'); };
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Sauvegarde budget' }); return done(); }
    catch (e) { if (e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  done();
}

async function importData(file) {
  if (!file) return;
  try {
    const d = JSON.parse(await file.text());
    if (!d || !Array.isArray(d.transactions) || !Array.isArray(d.plans)) throw new Error('format');
    if (!confirm(`Remplacer tes données actuelles par cette sauvegarde (${d.transactions.length} opérations) ?`)) return;
    state = normalize(d);
    save(); render();
    toast('Sauvegarde importée');
  } catch (e) {
    toast("Ce fichier n'est pas une sauvegarde valide");
  } finally {
    document.getElementById('import-file').value = '';
  }
}

/* =====================================================
   10. Ajout rapide par lien (#ajout?montant=…&commerce=…)
   ===================================================== */
function handleHash() {
  if (!location.hash.startsWith('#ajout')) return;
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  const amount = Math.abs(parseNumber(q.get('montant')));
  const label = (q.get('commerce') || '').trim();
  history.replaceState(null, '', location.pathname + location.search);
  if (sheet.open) sheet.close();
  openTxForm(null, { type: 'depense', amount: amount || '', label, cat: guessCat(label), date: todayStr() });
}

/* =====================================================
   11. Événements
   ===================================================== */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act], [data-view]');
  if (!t) return;
  if (t.dataset.view) {
    view = t.dataset.view;
    if (view === 'ops') opsMonth = monthKey();
    render();
    window.scrollTo(0, 0);
    return;
  }
  const id = t.dataset.id;
  switch (t.dataset.act) {
    case 'add-tx': view === 'epargne' ? openSavForm() : openTxForm(); break;
    case 'edit-tx': openTxForm(state.transactions.find(x => x.id === id)); break;
    case 'add-sav': openSavForm(null, t.dataset.kind); break;
    case 'edit-sav': openSavForm(state.savings.ops.find(x => x.id === id)); break;
    case 'add-plan': openPlanForm(null, t.dataset.freq, t.dataset.type); break;
    case 'edit-plan': openPlanForm(state.plans.find(x => x.id === id)); break;
    case 'plan-done': markPlanDone(id); break;
    case 'plan-skip': skipPlan(id); break;
    case 'ops-prev': opsMonth = addMonths(opsMonth, -1); render(); break;
    case 'ops-next': if (opsMonth < monthKey()) { opsMonth = addMonths(opsMonth, 1); render(); } break;
    case 'export': exportData(); break;
    case 'import': document.getElementById('import-file').click(); break;
    case 'close': sheet.close(); break;
    case 'delete-tx': {
      if (!confirm('Supprimer cette opération ?')) break;
      unmarkPlan(state.transactions.find(x => x.id === id));
      state.transactions = state.transactions.filter(x => x.id !== id);
      save(); sheet.close(); render();
      toast('Opération supprimée');
      break;
    }
    case 'delete-sav': {
      if (!confirm('Supprimer ce mouvement ?')) break;
      unmarkPlan(state.savings.ops.find(x => x.id === id));
      state.savings.ops = state.savings.ops.filter(x => x.id !== id);
      save(); sheet.close(); render();
      toast('Mouvement supprimé');
      break;
    }
    case 'delete-plan':
      if (!confirm('Supprimer cette prévision ? Les opérations déjà passées sont gardées.')) break;
      state.plans = state.plans.filter(x => x.id !== id);
      save(); sheet.close(); render();
      toast('Prévision supprimée');
      break;
    case 'reset':
      if (!confirm('Effacer toutes tes données ? Exporte une sauvegarde avant si tu veux les garder.')) break;
      state = defaultState();
      save(); render();
      toast('Données effacées');
      break;
  }
});

document.addEventListener('submit', e => {
  const f = e.target;
  e.preventDefault();
  if (['setup-form', 'start-form', 'sav-setup', 'sav-start'].includes(f.id)) {
    const v = parseNumber(f.elements.solde.value);
    if (isNaN(v)) return toast('Montant invalide');
    if (f.id.startsWith('sav')) state.savings.startBalance = v; else state.startBalance = v;
    save(); render(); toast('Solde enregistré');
  } else if (f.id === 'budget-form') {
    const v = parseNumber(f.elements.budget.value);
    state.variableBudget = isNaN(v) ? 0 : Math.abs(v);
    save(); render(); toast('Budget enregistré');
  } else if (f.id === 'tx-form') saveTx(f);
  else if (f.id === 'sav-form') saveSav(f);
  else if (f.id === 'plan-form') savePlan(f);
});

document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'import-file') return importData(el.files[0]);
  const f = el.form;
  if (!f) return;
  if (el.name === 'type') {
    f.querySelector('[data-chips]').innerHTML = chips(el.value);
    const fs = f.querySelector('.cats');
    if (fs) fs.hidden = el.value === 'epargne';
    if (el.value === 'epargne' && !f.elements.label.value) f.elements.label.value = 'Épargne Livret A';
  }
  if (el.name === 'kind') f.querySelector('[data-kind-help]').textContent = KINDS[el.value].aide;
  if (el.name === 'cat') f.dataset.catTouched = '1';
  if (el.name === 'freq') f.querySelectorAll('[data-for]').forEach(x => { x.hidden = x.dataset.for !== el.value; });
});

// Propose une catégorie pendant que tu tapes le libellé
document.addEventListener('input', e => {
  const el = e.target, f = el.form;
  if (!f || !['tx-form', 'plan-form', 'sav-form'].includes(f.id)) return;
  if (el.name === 'amount') f.querySelector('.form-error').hidden = true;
  if (f.id === 'sav-form' || el.name !== 'label' || f.dataset.catTouched) return;
  const type = f.elements.type.value;
  if (type === 'epargne') return;
  const g = guessCat(el.value, type);
  const radio = f.querySelector(`input[name=cat][value="${g}"]`);
  if (!g.startsWith('autre') && radio) radio.checked = true;
});

sheet.addEventListener('click', e => { if (e.target === sheet) sheet.close(); });

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !sheet.open) render();
});

/* =====================================================
   12. Démarrage
   ===================================================== */
let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

opsMonth = monthKey();
render();
handleHash();
window.addEventListener('hashchange', handleHash);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
