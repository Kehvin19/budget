'use strict';

/* =====================================================
   1. Catégories et réglages par défaut
   ===================================================== */
const CATS = {
  depense: [
    { id: 'courses',     nom: 'Courses',           emoji: '🛒', color: '#3F8A4F', quotidien: true, desc: 'Supermarché, alimentation' },
    { id: 'restos',      nom: 'Restos & cafés',    emoji: '🍔', color: '#E0822E', quotidien: true, desc: 'Fast-food, CROUS, cafés, livraison' },
    { id: 'transport',   nom: 'Transport',         emoji: '🚆', color: '#2E5E9E', quotidien: true, desc: 'Essence, péage, tickets, trottinette' },
    { id: 'loisirs',     nom: 'Sorties & loisirs', emoji: '🎮', color: '#D1A032', quotidien: true, desc: 'Cinéma, bars, sport, jeux' },
    { id: 'shopping',    nom: 'Shopping',          emoji: '🛍️', color: '#CF5F92', quotidien: true, desc: 'Vêtements, chaussures, high-tech' },
    { id: 'hygiene',     nom: 'Hygiène & beauté',  emoji: '🧴', color: '#6E8FC9', quotidien: true, desc: "Produits d'hygiène, coiffeur" },
    { id: 'cadeaux',     nom: 'Cadeaux',           emoji: '🎁', color: '#B5527A', quotidien: true, desc: 'Anniversaires, fêtes' },
    { id: 'maison',      nom: 'Maison',            emoji: '💡', color: '#8A6D3B', quotidien: true, desc: 'Ménage, petits achats, réparations' },
    { id: 'sante',       nom: 'Santé',             emoji: '💊', color: '#2F9C93', quotidien: true, desc: 'Pharmacie, consultations' },
    { id: 'etudes',      nom: 'Études',            emoji: '📚', color: '#5E7394', quotidien: true, desc: 'Fournitures, impressions, livres' },
    { id: 'logement',    nom: 'Logement',          emoji: '🏠', color: '#7A5BA8' },
    { id: 'abonnements', nom: 'Abonnements',       emoji: '📱', color: '#C0392F' },
    { id: 'autre',       nom: 'Imprévus & autre',  emoji: '📦', color: '#858B96', quotidien: true, desc: 'Tout le reste' },
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
// Catégories de l'utilisateur (modifiables), sinon celles par défaut
function getCats(type) {
  if (type === 'epargne') return CATS.epargne;
  return (state && state.cats && state.cats[type]) || CATS[type] || CATS.depense;
}
const fallbackId = type => (type === 'revenu' ? 'autre-revenu' : 'autre');
function catInfo(type, id) {
  const list = getCats(type);
  return list.find(c => c.id === id) || list.find(c => c.id === fallbackId(type)) || list[list.length - 1];
}
const PALETTE = ['#3F8A4F', '#E0822E', '#2E5E9E', '#D1A032', '#CF5F92', '#6E8FC9', '#B5527A', '#8A6D3B', '#2F9C93', '#5E7394', '#7A5BA8', '#C0392F', '#858B96'];

// Les 3 façons de budgéter une catégorie
const MODES = {
  cycle:     { court: 'Par cycle', resume: 'par cycle, réparti par semaine',
               aide: n => `Réparti sur les ${n} semaines du cycle. Si tu dépasses une semaine, les suivantes sont réduites. Si tu dépenses moins, elles augmentent.` },
  semaine:   { court: 'Par semaine', resume: 'par semaine',
               aide: n => `Le même montant chaque semaine (${n} semaines ce cycle). Un dépassement est repris sur les semaines suivantes.` },
  enveloppe: { court: 'Enveloppe', resume: 'par cycle, sans découpage',
               aide: () => 'Un montant pour tout le cycle, sans découpage par semaine. Idéal pour le coiffeur, les cadeaux, la santé.' },
};

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

// Les blocs de l'accueil qu'on peut afficher ou masquer
const FEATURES = [
  ['planEpargne', "Plan d'épargne", "Combien mettre de côté après ton salaire et en fin de cycle"],
  ['semaine', 'Budgets de la semaine', "Ce qu'il te reste par catégorie cette semaine"],
  ['conseils', 'Conseils', 'Des conseils calculés sur ton téléphone'],
  ['livret', 'Carte Livret A', "Le montant de ton livret sur l'accueil"],
  ['resume', 'Résumé et graphique', 'Entrées, sorties et dépenses par catégorie'],
  ['rappel', 'Rappel de sauvegarde', 'Te propose d\'exporter tes données chaque mois'],
];
// Les types de conseils qu'on peut activer un par un
const TIP_TYPES = [
  ['rouge', 'Alerte compte dans le rouge'],
  ['semaine', 'Catégorie qui dépasse son budget de la semaine'],
  ['rythme', 'Rythme des dépenses du quotidien'],
  ['bravo', 'Encouragements'],
  ['budget', 'Rappel de fixer un budget'],
  ['categorie', 'Catégorie qui dépasse ta moyenne'],
  ['epargne-auto', 'Virement automatique vers le livret'],
  ['matelas', 'Matelas de sécurité'],
  ['abonnements', 'Coût des abonnements'],
  ['petites', 'Petites dépenses'],
  ['aides', "Aides possibles (CAF, prime d'activité)"],
];

const MOTS_CLES = [
  ['logement', /loyer|colocation|edf|engie|electricit|assurance habitation|internet box/i],
  ['cadeaux', /cadeau|anniversaire|anniv|no[eë]l|f[eê]te des/i],
  ['maison', /ampoule|bricolage|leroy|castorama|brico|m[eé]nage|vaisselle|lessive/i],
  ['hygiene', /sephora|nocib|marionnaud|kiko|coiffeur|barbier|shampo|gel douche|dentifrice|rasoir/i],
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
   2. Petits outils
   ===================================================== */
const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const money = n => euros.format(Math.round(n * 100) / 100 + 0);
const signedMoney = n => (n > 0 ? '+ ' : n < 0 ? '− ' : '') + money(Math.abs(n));
const sum = arr => arr.reduce((s, n) => s + n, 0);
const pad = n => String(n).padStart(2, '0');
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const floor5 = n => Math.max(0, Math.floor(n / 5) * 5);

function dateStr(d = new Date()) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function todayStr() { return dateStr(); }
function parseDate(s) { const [Y, M, D] = s.split('-').map(Number); return new Date(Y, M - 1, D); }
function dayBefore(s) { const d = parseDate(s); d.setDate(d.getDate() - 1); return dateStr(d); }
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
  if (d === dayBefore(todayStr())) return 'Hier';
  return cap(parseDate(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }));
}
function shortDate(d) {
  return parseDate(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
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
   3. Données (stockées uniquement sur l'appareil)
   Le nom de rangement ne change pas : tes données sont gardées.
   ===================================================== */
const APP_VERSION = 6;
const KEY = 'mon-budget-v1';
const defaultSettings = () => ({
  cycleDay: 1,        // jour de début du cycle (jour du salaire)
  margin: 50,         // marge de sécurité à garder sur le compte
  features: { planEpargne: true, semaine: true, conseils: true, livret: true, resume: true, rappel: true },
  tipsOff: [],
});
const defaultState = () => ({
  version: 3,
  startBalance: null,
  variableBudget: 0,  // ancien budget global (remplacé par catBudgets)
  catBudgets: {},     // ex. { courses: { amount: 200, mode: 'cycle' } }
  cats: null,         // catégories modifiables { depense: [...], revenu: [...] }
  transactions: [],   // {id, type, amount, label, cat, date, planId?, occ?}
  plans: [],          // {id, type, amount, label, cat, freq:'mois'|'unique', day, date, source, auto, since, lastDone, added}
  savings: { startBalance: null, ops: [] },
  settings: defaultSettings(),
  lastExport: null,
});

// Met à niveau les données des anciennes versions sans rien perdre
function normalize(d) {
  const s = Object.assign(defaultState(), d);
  s.savings = Object.assign({ startBalance: null, ops: [] }, d && d.savings);
  if (!Array.isArray(s.savings.ops)) s.savings.ops = [];
  const def = defaultSettings();
  const st = (d && d.settings) || {};
  s.settings = Object.assign(def, st, {
    features: Object.assign(def.features, st.features),
    tipsOff: Array.isArray(st.tipsOff) ? st.tipsOff : [],
  });
  s.plans.forEach(p => {
    if (p.freq === 'mois' && p.lastAdded && !p.lastDone) {
      const [y, m] = p.lastAdded.split('-').map(Number);
      const last = new Date(y, m, 0).getDate();
      p.lastDone = `${p.lastAdded}-${pad(Math.min(p.day || 1, last))}`;
    }
    delete p.lastAdded;
    if (p.freq === 'unique' && !p.date) p.date = (p.month || monthKey()) + '-01';
    if (p.type === 'epargne' && !p.source) p.source = 'moi';
  });
  if (!s.catBudgets || typeof s.catBudgets !== 'object') {
    s.catBudgets = s.variableBudget > 0 ? { autre: s.variableBudget } : {};
  }
  Object.keys(s.catBudgets).forEach(k => {
    const b = s.catBudgets[k];
    if (typeof b === 'number') s.catBudgets[k] = { amount: b, mode: 'cycle' };
    if (!s.catBudgets[k] || !(s.catBudgets[k].amount > 0)) delete s.catBudgets[k];
  });
  if (!s.cats || !Array.isArray(s.cats.depense) || !Array.isArray(s.cats.revenu)) {
    s.cats = { depense: JSON.parse(JSON.stringify(CATS.depense)), revenu: JSON.parse(JSON.stringify(CATS.revenu)) };
  }
  ['depense', 'revenu'].forEach(t => {
    if (!s.cats[t].some(c => c.id === fallbackId(t))) s.cats[t].push(JSON.parse(JSON.stringify(CATS[t].find(c => c.id === fallbackId(t)))));
  });
  s.version = 6;
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

let state;           // rempli au démarrage
let view = 'mois';
let opsMonth = null;

const S = () => state.settings;
const on = f => S().features[f] !== false;
const tipOn = id => !S().tipsOff.includes(id);

/* =====================================================
   4. Cycles (du jour du salaire à la veille du suivant)
   ===================================================== */
function cycleDay() { return Math.min(28, Math.max(1, parseInt(S().cycleDay, 10) || 1)); }
function cycleAt(offset = 0, ref = new Date()) {
  const D = cycleDay();
  const y = ref.getFullYear();
  let m = ref.getMonth();
  if (ref.getDate() < D) m -= 1;
  const start = new Date(y, m + offset, D);
  const end = new Date(y, m + offset + 1, D - 1);
  return { start, end, s: dateStr(start), e: dateStr(end), key: monthKey(end) };
}
const inCycle = (d, c) => d >= c.s && d <= c.e;
const periodWord = () => (cycleDay() === 1 ? 'Ce mois-ci' : 'Ce cycle');

// Date à laquelle une prévision mensuelle tombe dans un cycle
function occDate(p, c) {
  const D = cycleDay();
  const sy = c.start.getFullYear(), sm = c.start.getMonth();
  const mm = p.day >= D ? sm : sm + 1;
  const last = new Date(sy, mm + 1, 0).getDate();
  return dateStr(new Date(sy, mm, Math.min(p.day, last)));
}
function isDone(p, occ) {
  return p.freq === 'mois' ? !!p.lastDone && occ <= p.lastDone : !!p.added;
}
// Toutes les prévisions d'un cycle, avec leur date
function plansInCycle(c) {
  const out = [];
  state.plans.forEach(p => {
    if (p.freq === 'mois') out.push({ p, occ: occDate(p, c) });
    else if (inCycle(p.date, c)) out.push({ p, occ: p.date });
  });
  return out.sort((a, b) => a.occ.localeCompare(b.occ));
}
const pendingIn = c => plansInCycle(c).filter(x => !isDone(x.p, x.occ));

/* =====================================================
   5. Calculs
   ===================================================== */
// Effet sur le compte courant
function signed(t) {
  if (t.type === 'revenu') return t.amount;
  if (t.type === 'epargne') return t.source === 'proches' ? 0 : -t.amount;
  return -t.amount;
}
const courantEffect = o => (o.kind === 'versement' ? -o.amount : o.kind === 'retrait' ? o.amount : 0);
const livretEffect = o => (o.kind === 'retrait' ? -o.amount : o.amount);

function balance() {
  return (state.startBalance || 0) + sum(state.transactions.map(signed)) + sum(state.savings.ops.map(courantEffect));
}
function livretBalance() {
  return (state.savings.startBalance || 0) + sum(state.savings.ops.map(livretEffect));
}
const txOfMonth = key => state.transactions.filter(t => t.date.startsWith(key));
const savOfMonth = key => state.savings.ops.filter(o => o.date.startsWith(key));
const txIn = c => state.transactions.filter(t => inCycle(t.date, c));
const savIn = c => state.savings.ops.filter(o => inCycle(o.date, c));
const varSpentIn = c => sum(txIn(c).filter(t => t.type === 'depense' && !t.planId).map(t => t.amount));
const catSpentIn = (c, cat) => sum(txIn(c).filter(t => t.type === 'depense' && !t.planId && t.cat === cat).map(t => t.amount));

function pastCyclesWithData(n = 3) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    const c = cycleAt(-i);
    if (txIn(c).length) out.push(c);
  }
  return out;
}
function avgVariable() {
  const cs = pastCyclesWithData();
  return cs.length ? sum(cs.map(varSpentIn)) / cs.length : null;
}
const dailyCats = () => getCats('depense').filter(c => c.quotidien);
function budgetOf(id) {
  const b = state.catBudgets[id];
  return b && b.amount > 0 ? b : null;
}
function budgetTotal(id, n) {
  const b = budgetOf(id);
  if (!b) return 0;
  return b.mode === 'semaine' ? b.amount * n : b.amount;
}
const dailyBudget = () => { const n = budgetPeriod().n; return sum(dailyCats().map(c => budgetTotal(c.id, n))); };

// Où en est une catégorie : budget de la semaine (avec report) et du cycle
function catStatus(c, bp) {
  const b = budgetOf(c.id);
  if (!b) return null;
  const T = budgetTotal(c.id, bp.n);
  const spentWeek = spentRange(c.id, bp.monS, bp.sunS);
  const spentPeriod = spentRange(c.id, bp.startS, bp.endS);
  if (b.mode === 'enveloppe') return { b, T, spentWeek, spentPeriod, reste: T - spentPeriod, over: spentPeriod > T + 0.005 };
  const before = bp.idx > 0 ? spentRange(c.id, bp.startS, dayBefore(bp.monS)) : 0;
  const left = bp.n - bp.idx;
  const base = T / bp.n;
  const allowance = Math.max(0, T - before) / left;
  return { b, T, base, allowance, adjust: allowance - base, spentWeek, spentPeriod, reste: allowance - spentWeek, over: spentPeriod > T + 0.005 };
}

/* Semaines du lundi au dimanche. Une semaine appartient au cycle qui contient son lundi :
   si le cycle se termine un mardi, la semaine entière compte dans ce cycle. */
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function mondayOf(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return addDays(x, -((x.getDay() + 6) % 7)); }
function weeksOf(c) {
  const out = [];
  let m = mondayOf(c.start);
  if (m < c.start) m = addDays(m, 7);
  while (m <= c.end) { out.push(m); m = addDays(m, 7); }
  return out;
}
function budgetPeriod() {
  const mon = mondayOf(parseDate(todayStr()));
  const c = cycleAt(0, mon);
  const weeks = weeksOf(c);
  const idx = Math.max(0, weeks.findIndex(w => dateStr(w) === dateStr(mon)));
  return {
    c, weeks, idx, n: weeks.length,
    monS: dateStr(mon), sunS: dateStr(addDays(mon, 6)),
    startS: dateStr(weeks[0]), endS: dateStr(addDays(weeks[weeks.length - 1], 6)),
  };
}
const spentRange = (cat, s, e) => sum(state.transactions
  .filter(t => t.type === 'depense' && !t.planId && t.cat === cat && t.date >= s && t.date <= e)
  .map(t => t.amount));

function fixedCharges() {
  return sum(state.plans.filter(p => p.freq === 'mois' && p.type === 'depense').map(p => p.amount));
}

function projection(n = 12) {
  const budget = dailyBudget();
  const c0 = cycleAt(0);
  const pend = pendingIn(c0);
  let bal = balance() + sum(pend.map(x => signed(x.p))) - Math.max(0, budget - varSpentIn(c0));
  let liv = livretBalance() + sum(pend.filter(x => x.p.type === 'epargne').map(x => x.p.amount));
  const rows = [{ key: c0.key, c: c0, end: bal, livret: liv }];
  for (let i = 1; i < n; i++) {
    const c = cycleAt(i);
    const xs = plansInCycle(c).filter(x => x.p.freq === 'mois' || !x.p.added);
    bal += sum(xs.map(x => signed(x.p))) - budget;
    liv += sum(xs.filter(x => x.p.type === 'epargne').map(x => x.p.amount));
    rows.push({ key: c.key, c, end: bal, livret: liv });
  }
  return rows;
}

// Combien mettre de côté ce cycle-ci
function cyclePlan() {
  const c = cycleAt(0);
  const xs = plansInCycle(c);
  const amt = f => sum(xs.filter(f).map(x => x.p.amount));
  const budget = dailyBudget();
  const margin = S().margin || 0;
  const income = amt(x => x.p.type === 'revenu');
  const fixed = amt(x => x.p.type === 'depense' && x.p.freq === 'mois');
  const excep = amt(x => x.p.type === 'depense' && x.p.freq === 'unique');
  const auto = amt(x => x.p.type === 'epargne' && x.p.source !== 'proches');
  const surplus = income - fixed - excep - auto - budget;
  const already = Math.max(0, -sum(savIn(c).filter(o => !o.planId).map(courantEffect)));
  const projEnd = projection(1)[0].end;
  const start = floor5(Math.min(surplus - already, projEnd - margin));
  const endBonus = floor5(projEnd - margin - start);
  const salairePending = pendingIn(c).some(x => x.p.type === 'revenu' && x.p.cat === 'salaire');
  return { c, income, fixed, excep, auto, budget, margin, surplus, already, projEnd, start, endBonus, salairePending };
}

/* =====================================================
   6. Prévisions : enregistrer, ignorer, automatique
   ===================================================== */
function recordPlan(p, occ, date = todayStr()) {
  const base = { id: uid(), created: Date.now(), amount: p.amount, label: p.label, date, planId: p.id, occ };
  if (p.type === 'epargne') state.savings.ops.push({ ...base, kind: p.source === 'proches' ? 'externe' : 'versement' });
  else state.transactions.push({ ...base, type: p.type, cat: p.cat });
  if (p.freq === 'mois') p.lastDone = occ; else p.added = true;
}
function markPlanDone(id, occ) {
  const p = state.plans.find(x => x.id === id);
  if (!p) return;
  recordPlan(p, occ);
  save(); render();
  toast(p.type === 'epargne' ? 'Ajouté à ton Livret A' : 'Ajouté aux opérations');
}
function skipPlan(id, occ) {
  const p = state.plans.find(x => x.id === id);
  if (!p) return;
  if (p.freq === 'mois') p.lastDone = occ; else p.added = true;
  save(); render();
  toast('Ignoré pour ce cycle');
}
function unmarkPlan(item) {
  const p = item && item.planId && state.plans.find(x => x.id === item.planId);
  if (!p || p.auto) return;
  if (p.freq === 'mois') p.lastDone = item.occ ? dayBefore(item.occ) : null;
  else p.added = false;
}
// Les prévisions « automatiques » s'ajoutent toutes seules le jour venu
function applyAuto() {
  let changed = false;
  const today = todayStr();
  state.plans.forEach(p => {
    if (!p.auto) return;
    if (p.freq === 'mois') {
      const since = p.since || today;
      for (let i = -12; i <= 0; i++) {
        const occ = occDate(p, cycleAt(i));
        if (occ >= since && occ <= today && !isDone(p, occ)) { recordPlan(p, occ, occ); changed = true; }
      }
    } else if (!p.added && p.date <= today) {
      recordPlan(p, p.date, p.date); changed = true;
    }
  });
  if (changed) save();
}

// Si tu saisis à la main une opération qui correspond à une prévision
// (ex. ton salaire), la prévision est considérée comme reçue : pas de double comptage.
function autoLink() {
  let changed = false;
  const close = (a, b) => Math.abs(a - b) <= Math.max(10, b * 0.1);
  const near = (d, occ) => Math.abs(parseDate(d) - parseDate(occ)) <= 10 * 864e5;
  for (const off of [-1, 0]) {
    const c = cycleAt(off);
    pendingIn(c).forEach(({ p, occ }) => {
      let item;
      if (p.type === 'epargne') {
        const kind = p.source === 'proches' ? 'externe' : 'versement';
        item = state.savings.ops.find(o => !o.planId && o.kind === kind && inCycle(o.date, c) && near(o.date, occ) && close(o.amount, p.amount));
      } else {
        item = state.transactions.find(t => !t.planId && t.type === p.type && t.cat === p.cat && inCycle(t.date, c) && near(t.date, occ) && close(t.amount, p.amount));
      }
      if (!item) return;
      item.planId = p.id;
      item.occ = occ;
      if (p.freq === 'mois') { if (!p.lastDone || occ > p.lastDone) p.lastDone = occ; } else p.added = true;
      changed = true;
    });
  }
  if (changed) save();
  return changed;
}

/* =====================================================
   7. Conseils (calculés sur ton téléphone, rien n'est envoyé)
   ===================================================== */
function conseils() {
  const tips = [];
  const add = (id, p, emoji, text) => { if (tipOn(id)) tips.push({ p, emoji, text }); };
  const c = cycleAt(0), now = new Date();
  const total = Math.round((c.end - c.start) / 864e5) + 1;
  const day = Math.round((parseDate(todayStr()) - c.start) / 864e5) + 1;
  const daysLeft = total - day + 1;
  const budget = dailyBudget();
  const spent = varSpentIn(c);
  const plans = state.plans;

  if (!state.transactions.length && !plans.length) {
    return [{ p: 100, emoji: '👋', text: "Commence par ajouter ton salaire et tes charges fixes (loyer, forfait…) dans Prévisions. Les conseils s'adapteront à ta situation." }];
  }

  const rows = projection(12);
  const idx = rows.findIndex(r => r.end < 0);
  if (idx >= 0) {
    const effort = Math.ceil(-rows[idx].end / (idx + 1));
    add('rouge', 100, '🚨', `Ton compte passerait sous zéro vers ${monthLabel(rows[idx].key).toLowerCase()}. En dépensant environ ${money(effort)} de moins par mois d'ici là, tu l'évites.`);
  }

  {
    const bp = budgetPeriod();
    for (const cat of dailyCats()) {
      const st = catStatus(cat, bp);
      if (!st) continue;
      if (st.over) {
        add('semaine', 95, '⛔', `${cat.nom} : tu es hors budget, avec ${money(st.spentPeriod - st.T)} de plus que prévu sur ce cycle.`);
        break;
      }
      if (st.b.mode !== 'enveloppe' && st.reste < -1) {
        add('semaine', 85, cat.emoji, `${cat.nom} : ${money(-st.reste)} de plus que prévu cette semaine. Tes prochaines semaines sont réduites d'autant.`);
        break;
      }
    }
  }
  if (budget > 0 && day >= 5) {
    const attendu = budget * day / total;
    if (spent > attendu * 1.1) {
      const parJour = Math.max(0, (budget - spent) / daysLeft);
      add('rythme', 90, '🐢', `Tu as dépensé ${money(spent)} au quotidien depuis le ${shortDate(c.s)}, alors qu'à cette date ton budget prévoyait environ ${money(attendu)}. Pour rester dans les clous, vise ${money(parJour)} par jour jusqu'au ${shortDate(c.e)}.`);
    } else if (day >= 10 && spent < attendu * 0.8) {
      add('bravo', 40, '👏', `Tu es en dessous de ton budget du quotidien : il te reste ${money(budget - spent)} jusqu'au ${shortDate(c.e)}. Ce qui reste en fin de cycle pourra aller sur ton Livret A.`);
    }
  }
  if (!budget && plans.length) {
    add('budget', 70, '🎯', "Fixe un budget par catégorie dans Prévisions (courses, sorties…). C'est ce qui rend tes prévisions et ton plan d'épargne fiables.");
  }

  const past = pastCyclesWithData();
  if (past.length && day >= 10) {
    for (const cat of getCats('depense')) {
      const now$ = catSpentIn(c, cat.id);
      const moy = sum(past.map(pc => catSpentIn(pc, cat.id))) / past.length;
      if (moy > 0 && now$ > moy * 1.3 && now$ - moy > 20) {
        add('categorie', 55, cat.emoji, `Tes dépenses ${cat.nom.toLowerCase()} de ce cycle (${money(now$)}) dépassent déjà ta moyenne habituelle (${money(moy)}).`);
        break;
      }
    }
  }

  const aSalaire = plans.some(p => p.type === 'revenu');
  const aEpargne = plans.some(p => p.type === 'epargne' && p.source !== 'proches' && p.freq === 'mois');
  if (aSalaire && !aEpargne) {
    add('epargne-auto', 60, '🐷', "Programme un virement vers ton Livret A juste après ton salaire, même 20 €. L'argent mis de côté en premier ne se dépense pas.");
  }

  const fixe = fixedCharges();
  if (fixe > 0) {
    const cible = fixe * 3, liv = livretBalance();
    if (liv < cible) add('matelas', 50, '🛟', `Vise un matelas de sécurité de 3 mois de charges fixes, soit ${money(cible)} sur ton Livret A. Il te manque ${money(cible - liv)}.`);
  }

  const abos = sum(plans.filter(p => p.freq === 'mois' && p.type === 'depense' && p.cat === 'abonnements').map(p => p.amount));
  if (abos >= 20) add('abonnements', 45, '📱', `Tes abonnements te coûtent ${money(abos)} par mois, soit ${money(abos * 12)} par an. Vérifie que tu les utilises tous.`);

  const petites = txIn(c).filter(t => t.type === 'depense' && !t.planId && t.amount < 10);
  if (petites.length >= 8) add('petites', 35, '🪙', `Tu as fait ${petites.length} petits achats de moins de 10 € ce cycle, pour un total de ${money(sum(petites.map(t => t.amount)))}. Mis bout à bout, ça compte.`);

  const aAides = plans.some(p => p.cat === 'aides') || state.transactions.some(t => t.cat === 'aides');
  if (aSalaire && !aAides) add('aides', 20, '🤝', "En alternance, tu as peut-être droit à la prime d'activité ou aux APL. Fais une simulation gratuite sur caf.fr, ça prend 10 minutes.");

  return tips.sort((a, b) => b.p - a.p);
}

/* =====================================================
   8. Morceaux d'interface
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

function planEffectText(p) {
  if (p.type === 'epargne') return p.source === 'proches' ? `+ ${money(p.amount)} sur ton livret` : `− ${money(p.amount)} vers ton livret`;
  return signedMoney(signed(p));
}

function pendingRow({ p, occ }) {
  const c = catInfo(p.type, p.cat);
  const bouton = p.type === 'revenu' || p.source === 'proches' ? 'Reçu' : p.type === 'epargne' ? 'Fait' : 'Payé';
  const actions = p.auto
    ? `<span class="tag">Auto</span>`
    : `<button class="btn small ghost" data-act="plan-skip" data-id="${p.id}" data-occ="${occ}">Ignorer</button>
       <button class="btn small" data-act="plan-done" data-id="${p.id}" data-occ="${occ}">${bouton}</button>`;
  return `<li class="row">
    ${bubble(c.color, c.emoji)}
    <span class="row-main">
      <span class="row-title">${esc(p.label || c.nom)}</span>
      <span class="row-sub">${cap(shortDate(occ))}, ${planEffectText(p)}</span>
    </span>
    <span class="row-actions">${actions}</span>
  </li>`;
}

function planRow(p) {
  const c = catInfo(p.type, p.cat);
  let quand = p.freq === 'mois' ? `Le ${p.day} de chaque mois` : `Le ${shortDate(p.date)}`;
  if (p.type === 'epargne') quand = (p.source === 'proches' ? 'Versé par tes proches, ' : 'Vers ton livret, ') + quand.charAt(0).toLowerCase() + quand.slice(1);
  if (p.auto) quand += ', auto';
  const amount = p.type === 'epargne' && p.source === 'proches' ? `+ ${money(p.amount)}` : signedMoney(signed(p));
  return `<li><button class="row" data-act="edit-plan" data-id="${p.id}">
    ${bubble(c.color, c.emoji)}
    <span class="row-main">
      <span class="row-title">${esc(p.label || c.nom)}</span>
      <span class="row-sub">${quand}</span>
    </span>
    <span class="row-amount ${p.type === 'revenu' || p.source === 'proches' ? 'revenu' : ''}">${amount}</span>
  </button></li>`;
}

function donut(txs) {
  const dep = txs.filter(t => t.type === 'depense');
  const total = sum(dep.map(t => t.amount));
  if (!total) return `<p class="empty">Aucune dépense pour l'instant.</p>`;
  const parts = getCats('depense')
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

function seg(name, value, options, label) {
  return `<div class="seg" role="radiogroup" aria-label="${label}">${options.map(([v, txt]) =>
    `<label><input class="sr" type="radio" name="${name}" value="${v}" ${value === v ? 'checked' : ''}><span>${txt}</span></label>`).join('')}</div>`;
}
function chips(type, selected) {
  const list = getCats(type);
  const sel = list.some(c => c.id === selected) ? selected : list[0].id;
  return list.map(c => `<label style="--c:${c.color}"><input class="sr" type="radio" name="cat" value="${c.id}" ${c.id === sel ? 'checked' : ''}><span>${c.emoji} ${c.nom}</span></label>`).join('');
}
function switchRow(attr, key, title, desc, checked) {
  return `<li><label class="switch-row">
    <span class="row-main"><span class="row-title">${title}</span>${desc ? `<span class="row-sub">${desc}</span>` : ''}</span>
    <input type="checkbox" class="switch" role="switch" ${attr}="${key}" ${checked ? 'checked' : ''}>
  </label></li>`;
}

function tipsList(tips) {
  if (!tips.length) return `<p class="empty">Rien à signaler pour l'instant.</p>`;
  const item = t => `<li><span class="tip-emoji" aria-hidden="true">${t.emoji}</span><p>${t.text}</p></li>`;
  const top = tips.slice(0, 3), reste = tips.slice(3);
  return `<ul class="tips">${top.map(item).join('')}</ul>
    ${reste.length ? `<details class="more"><summary>Voir ${reste.length} autre${reste.length > 1 ? 's' : ''} conseil${reste.length > 1 ? 's' : ''}</summary><ul class="tips">${reste.map(item).join('')}</ul></details>` : ''}`;
}

function planBlock() {
  const pl = cyclePlan();
  if (!pl.income) {
    return `<section class="block"><div class="block-head"><h2>Ton plan d'épargne</h2></div>
      <p class="empty">Ajoute ton salaire dans Prévisions pour savoir combien mettre de côté à chaque cycle.</p></section>`;
  }
  const line = (label, v, strong) => `<div class="${strong ? 'calc-total' : ''}"><dt>${label}</dt><dd>${signedMoney(v)}</dd></div>`;
  const limite = pl.projEnd - pl.margin;
  return `<section class="block">
    <div class="block-head"><h2>Ton plan d'épargne</h2></div>
    <div class="plan-card">
      <div class="plan-step">
        <span class="plan-num">1</span>
        <div class="plan-text">
          <p class="plan-title">${pl.salairePending ? 'Dès que ton salaire arrive, mets de côté' : 'Pour ce cycle, mets de côté'}</p>
          <p class="plan-amount">${money(pl.start)}</p>
          ${pl.already > 0 ? `<p class="plan-note">Tu as déjà mis ${money(pl.already)} de côté ce cycle.</p>` : ''}
          ${pl.surplus < 0 ? `<p class="plan-note">Tes dépenses prévues dépassent tes revenus de ${money(-pl.surplus)} ce cycle.</p>` : ''}
        </div>
        ${pl.start > 0 ? `<button class="btn small" data-act="save-now" data-amount="${pl.start}">C'est fait</button>` : ''}
      </div>
      <div class="plan-step">
        <span class="plan-num">2</span>
        <div class="plan-text">
          <p class="plan-title">Le ${shortDate(pl.c.e)}, tu pourrais encore mettre</p>
          <p class="plan-amount">${money(pl.endBonus)}</p>
          <p class="plan-note">Si tu respectes ton budget du quotidien${pl.budget ? ` de ${money(pl.budget)}` : ''}, en gardant ${money(pl.margin)} de marge sur ton compte.</p>
        </div>
      </div>
      ${(() => {
        const avec = dailyCats().filter(c => budgetOf(c.id));
        if (avec.length >= 4) return '';
        return `<p class="plan-warn">${avec.length
          ? `Ton budget du quotidien ne compte que : ${avec.map(c => c.nom.toLowerCase()).join(', ')}. Les restos, le transport, les sorties… ne sont pas déduits, donc ce plan est trop optimiste.`
          : `Tu n'as fixé aucun budget du quotidien : ce plan suppose que tu ne dépenses rien en courses, sorties, transport…`}
          <button class="link" data-view="prev">Compléter mes budgets</button></p>`;
      })()}
      <details class="calc-wrap"><summary>Voir le calcul</summary>
        <dl class="calc">
          ${line('Revenus du cycle', pl.income)}
          ${line('Charges fixes', -pl.fixed)}
          ${pl.excep ? line('Dépenses exceptionnelles', -pl.excep) : ''}
          ${pl.auto ? line('Épargne déjà programmée', -pl.auto) : ''}
          ${line('Budget du quotidien', -pl.budget)}
          ${line('Ce que ton cycle dégage', pl.surplus, true)}
          ${pl.already ? line('Déjà mis de côté', -pl.already) : ''}
        </dl>
        <p class="hint">L'app ne te propose jamais plus que ce qui laisse ${money(pl.margin)} sur ton compte le ${shortDate(pl.c.e)}${limite < pl.surplus - pl.already ? `, soit ${money(Math.max(0, limite))} maximum ce cycle` : ''}. Tu peux changer cette marge dans Réglages.</p>
      </details>
    </div>
  </section>`;
}

function weekBlock() {
  const bp = budgetPeriod();
  const head = `<div class="block-head"><h2>Cette semaine</h2></div>
    <p class="hint top">Semaine ${bp.idx + 1} sur ${bp.n}, du ${shortDate(bp.monS)} au ${shortDate(bp.sunS)}</p>`;
  const items = dailyCats().map(c => ({ c, st: catStatus(c, bp) })).filter(x => x.st);
  if (!items.length) {
    return `<section class="block">${head}
      <div class="empty"><p style="margin:0 0 12px">Fixe un budget par catégorie (courses, sorties…) : l'app le découpe en semaines pour te dire ce qu'il te reste.</p>
      <button class="btn small" data-view="prev">Fixer mes budgets</button></div></section>`;
  }
  const hors = items.filter(x => x.st.over);
  const hebdo = items.filter(x => x.st.b.mode !== 'enveloppe');
  const env = items.filter(x => x.st.b.mode === 'enveloppe');
  const resteSemaine = sum(hebdo.map(x => x.st.reste));

  const hebdoRow = ({ c, st }) => {
    const pct = st.allowance > 0 ? Math.min(100, st.spentWeek / st.allowance * 100) : (st.spentWeek > 0 ? 100 : 0);
    let sub;
    if (st.over) sub = `<span class="neg">Hors budget : ${money(st.spentPeriod - st.T)} de plus que prévu sur le cycle</span>`;
    else if (st.reste < 0) sub = `<span class="neg">Dépassé de ${money(-st.reste)} cette semaine : les semaines suivantes sont réduites</span>`;
    else sub = `Reste ${money(st.reste)}`;
    const report = Math.abs(st.adjust) >= 0.5 && !st.over
      ? `<p class="budget-sub">${st.adjust > 0 ? `+ ${money(st.adjust)} reportés des semaines passées` : `− ${money(-st.adjust)} à cause des semaines passées`} (prévu au départ : ${money(st.base)})</p>` : '';
    return `<li class="budget-row ${st.over ? 'is-over' : ''}">
      <div class="budget-top"><span class="budget-name">${c.emoji} ${esc(c.nom)}</span><span class="budget-val">${money(st.spentWeek)} / ${money(st.allowance)}</span></div>
      <div class="goal-bar ${st.reste < 0 || st.over ? 'over' : ''}"><i style="width:${pct.toFixed(1)}%"></i></div>
      <p class="budget-sub">${sub}</p>${report}
    </li>`;
  };
  const envRow = ({ c, st }) => {
    const pct = st.T > 0 ? Math.min(100, st.spentPeriod / st.T * 100) : 0;
    return `<li class="budget-row ${st.over ? 'is-over' : ''}">
      <div class="budget-top"><span class="budget-name">${c.emoji} ${esc(c.nom)}</span><span class="budget-val">${money(st.spentPeriod)} / ${money(st.T)}</span></div>
      <div class="goal-bar ${st.over ? 'over' : ''}"><i style="width:${pct.toFixed(1)}%"></i></div>
      <p class="budget-sub">${st.over ? `<span class="neg">Hors budget : ${money(st.spentPeriod - st.T)} de plus que prévu</span>` : `Reste ${money(st.reste)} sur le cycle`}</p>
    </li>`;
  };

  // Dépenses programmées cette semaine
  const prog = pendingIn(cycleAt(0)).concat(pendingIn(cycleAt(1)))
    .filter(x => x.p.freq === 'unique' && x.p.type === 'depense' && x.occ >= bp.monS && x.occ <= bp.sunS);
  const sansBudget = dailyCats().filter(c => !budgetOf(c.id))
    .map(c => ({ c, sp: spentRange(c.id, bp.monS, bp.sunS) })).filter(x => x.sp > 0);

  return `<section class="block">${head}
    ${hors.length ? `<div class="over-banner">⛔ Hors budget prévisionnel : ${hors.map(x => `${esc(x.c.nom)} (+ ${money(x.st.spentPeriod - x.st.T)})`).join(', ')}</div>` : ''}
    ${hebdo.length ? `<div class="week-total"><span>Reste cette semaine</span><strong class="${resteSemaine < 0 ? 'neg' : ''}">${money(resteSemaine)}</strong></div>
    <ul class="list budgets">${hebdo.map(hebdoRow).join('')}</ul>` : ''}
    ${env.length ? `<h3 class="day">Enveloppes du cycle</h3><ul class="list budgets">${env.map(envRow).join('')}</ul>` : ''}
    ${prog.length ? `<h3 class="day">Programmé cette semaine</h3><ul class="list">${prog.map(x => {
      const c = catInfo('depense', x.p.cat);
      return `<li><button class="row" data-act="edit-plan" data-id="${x.p.id}">${bubble(c.color, c.emoji)}<span class="row-main"><span class="row-title">${esc(x.p.label || c.nom)}</span><span class="row-sub">${cap(shortDate(x.occ))}</span></span><span class="row-amount">${signedMoney(-x.p.amount)}</span></button></li>`;
    }).join('')}</ul>` : ''}
    ${sansBudget.length ? `<p class="hint">Sans budget cette semaine : ${sansBudget.map(x => `${x.c.emoji} ${esc(x.c.nom)} ${money(x.sp)}`).join(', ')}.</p>` : ''}
  </section>`;
}

// À confirmer : les prévisions dont le jour est arrivé
function confirmBlock() {
  const today = todayStr();
  const xs = pendingIn(cycleAt(-1)).filter(x => x.p.freq === 'unique')
    .concat(pendingIn(cycleAt(0)))
    .filter(x => !x.p.auto && x.occ <= today);
  if (!xs.length) return '';
  return `<section class="block">
    <div class="block-head"><h2>À confirmer</h2></div>
    <ul class="list confirm">${xs.map(({ p, occ }) => {
      const c = catInfo(p.type, p.cat);
      const quand = occ === today ? "Prévu aujourd'hui" : occ === dayBefore(today) ? 'Prévu hier' : `Prévu le ${shortDate(occ)}`;
      return `<li class="row">
        ${bubble(c.color, c.emoji)}
        <span class="row-main"><span class="row-title">${esc(p.label || c.nom)}</span><span class="row-sub">${quand}, ${planEffectText(p)}</span></span>
        <span class="row-actions">
          ${p.freq === 'unique'
            ? `<button class="btn small ghost" data-act="edit-plan" data-id="${p.id}">Reporter</button>`
            : `<button class="btn small ghost" data-act="plan-skip" data-id="${p.id}" data-occ="${occ}">Ignorer</button>`}
          <button class="btn small primary" data-act="plan-confirm" data-id="${p.id}" data-occ="${occ}">C'est fait</button>
        </span>
      </li>`;
    }).join('')}</ul>
    <p class="hint">Touche « C'est fait » pour l'enregistrer. Tu pourras corriger le montant réel.</p>
  </section>`;
}

const gearIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>`;

/* =====================================================
   9. Les écrans
   ===================================================== */
function renderMois() {
  const c = cycleAt(0);
  const total = Math.round((c.end - c.start) / 864e5) + 1;
  const day = Math.round((parseDate(todayStr()) - c.start) / 864e5) + 1;
  const daysLeft = total - day + 1;
  const pending = pendingIn(c);
  const futurs = pending.filter(x => x.p.auto || x.occ > todayStr());
  const pendNet = sum(pending.map(x => signed(x.p)));
  const bal = balance();
  const dispo = bal + pendNet;
  const txs = txIn(c);
  const rev = sum(txs.filter(t => t.type === 'revenu').map(t => t.amount));
  const dep = sum(txs.filter(t => t.type === 'depense').map(t => t.amount));
  const livCycle = sum(savIn(c).map(livretEffect));

  let ticks = '';
  for (let i = 1; i <= total; i++) ticks += `<i class="${i < day ? 'past' : i === day ? 'today' : ''}"></i>`;

  const setup = state.startBalance === null ? `<section class="setup">
      <h2>Pour commencer</h2>
      <p>Indique combien il y a sur ton compte courant aujourd'hui. L'app calcule tout à partir de là.</p>
      <form id="setup-form" class="inline-form">
        <label class="field"><span>Solde actuel</span><input name="solde" inputmode="decimal" placeholder="Ex. 850,00" required></label>
        <button class="btn primary">Enregistrer</button>
      </form>
    </section>` : '';

  const rappel = on('rappel') && state.transactions.length >= 5 &&
    (!state.lastExport || Date.now() - state.lastExport > 30 * 864e5) ? `<section class="notice">
      <p>Tes données sont uniquement sur ce téléphone. Pense à exporter une sauvegarde.</p>
      <button class="btn small" data-act="export">Exporter</button>
    </section>` : '';

  const livret = on('livret') ? `<button class="mini-card" data-view="epargne">
    ${bubble('#2F7D43', '🐷')}
    <span class="row-main">
      <span class="row-title">Livret A</span>
      <span class="row-sub">${state.savings.startBalance === null ? 'Touche ici pour ajouter ton livret' : `${periodWord()} : ${signedMoney(livCycle)}`}</span>
    </span>
    <span class="row-amount">${money(livretBalance())}</span>
  </button>` : '';

  const recent = [...state.transactions].sort(byDateDesc).slice(0, 5);
  const resumeTitre = cycleDay() === 1 ? `${cap(c.start.toLocaleDateString('fr-FR', { month: 'long' }))} en bref` : `Depuis le ${shortDate(c.s)}`;

  return `<header class="page-head"><h1>${periodWord()}</h1>
    <button class="icon-btn big" data-view="reglages" aria-label="Réglages">${gearIcon}</button></header>
  ${setup}
  <section class="hero ${livret ? '' : 'solo'}">
    <p class="hero-label">Disponible jusqu'au ${shortDate(c.e)}</p>
    <p class="hero-amount">${money(dispo)}</p>
    <p class="hero-sub">${dispo > 0
      ? `Soit ${money(dispo / daysLeft)} par jour pendant ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.`
      : `Tes dépenses prévues dépassent ton solde de ${money(-dispo)}.`}</p>
    <div class="jauge" role="img" aria-label="Jour ${day} sur ${total} du cycle">${ticks}</div>
    <div class="hero-meta">
      <div><span>Compte courant</span><strong>${money(bal)}</strong></div>
      <div><span>Encore prévu d'ici là</span><strong>${signedMoney(pendNet)}</strong></div>
    </div>
  </section>
  ${livret}
  ${rappel}
  ${confirmBlock()}
  ${on('planEpargne') ? planBlock() : ''}
  ${on('semaine') ? weekBlock() : ''}
  <section class="block">
    <div class="block-head"><h2>À venir d'ici le ${shortDate(c.e)}</h2><button class="link" data-act="add-plan" data-freq="unique">Ajouter</button></div>
    ${futurs.length
      ? `<ul class="list">${futurs.map(pendingRow).join('')}</ul>
         <p class="hint">Un cadeau, une réparation, une sortie prévue ? Touche « Ajouter » pour l'inclure dans ton plan.</p>`
      : `<p class="empty">Rien de prévu d'ici le ${shortDate(c.e)}. Un cadeau, une réparation ? Touche « Ajouter ».</p>`}
  </section>
  ${on('conseils') ? `<section class="block">
    <div class="block-head"><h2>Conseils</h2></div>
    ${tipsList(conseils())}
  </section>` : ''}
  ${on('resume') ? `<section class="block">
    <div class="block-head"><h2>${resumeTitre}</h2></div>
    <div class="duo">
      <div><span>Entrées</span><strong class="revenu">${signedMoney(rev)}</strong></div>
      <div><span>Sorties</span><strong>${signedMoney(-dep)}</strong></div>
    </div>
    ${donut(txs)}
  </section>` : ''}
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
  const s = state.savings;
  const c = cycleAt(0);
  const liv = livretBalance();
  const cycleNet = sum(savIn(c).map(livretEffect));
  const parToi = sum(s.ops.filter(o => o.kind === 'versement' || o.kind === 'retrait').map(livretEffect));
  const parAutres = sum(s.ops.filter(o => o.kind === 'externe').map(o => o.amount));
  const plansEp = state.plans.filter(p => p.type === 'epargne' && p.freq === 'mois');
  const mensuel = sum(plansEp.map(p => p.amount));
  const proches = sum(plansEp.filter(p => p.source === 'proches').map(p => p.amount));
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
    <p class="hero-sub">${periodWord()} : ${signedMoney(cycleNet)}</p>
    <div class="hero-meta">
      <div><span>Mis de côté par toi</span><strong>${signedMoney(parToi)}</strong></div>
      <div><span>Reçu de tes proches</span><strong>${signedMoney(parAutres)}</strong></div>
    </div>
  </section>
  <div class="btn-row" style="margin-bottom:28px">
    <button class="btn primary grow" data-act="add-sav" data-kind="versement">Mettre de côté</button>
    <button class="btn grow" data-act="add-sav" data-kind="externe">On m'a versé</button>
  </div>

  <section class="block">
    <div class="block-head"><h2>Versements réguliers</h2>${plansEp.length ? '<button class="link" data-act="add-plan" data-freq="mois" data-type="epargne">Ajouter</button>' : ''}</div>
    ${plansEp.length
      ? `<ul class="list">${plansEp.map(planRow).join('')}</ul>`
      : `<div class="empty"><p style="margin:0 0 12px">Programme ce qui arrive chaque mois sur ton livret : ton propre virement, ou celui de tes parents.</p>
         <div class="btn-row">
           <button class="btn small" data-act="add-plan" data-freq="mois" data-type="epargne" data-source="moi">Mon virement</button>
           <button class="btn small" data-act="add-plan" data-freq="mois" data-type="epargne" data-source="proches">Celui de mes proches</button>
         </div></div>`}
  </section>

  ${plansEp.length ? `<section class="block">
    <div class="block-head"><h2>Dans un an</h2></div>
    ${chart(rows, 'livret', 'save')}
    <p class="hint">Avec ${money(mensuel)} versés chaque mois${proches ? ` (dont ${money(proches)} par tes proches)` : ''}, ton livret serait à environ ${money(last.livret)} en ${monthLabel(last.key).toLowerCase()}.</p>
  </section>` : ''}
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
  const uniques = state.plans.filter(p => p.freq === 'unique' && !p.added && p.date >= cycleAt(0).s)
    .sort((a, b) => a.date.localeCompare(b.date));
  const entrees = sum(mensuels.filter(p => p.type === 'revenu').map(p => p.amount));
  const sorties = sum(mensuels.filter(p => p.type === 'depense').map(p => p.amount));
  const epargne = sum(mensuels.filter(p => p.type === 'epargne' && p.source !== 'proches').map(p => p.amount));
  const net = entrees - sorties - epargne - (dailyBudget());
  const avg = avgVariable();
  const last = rows[rows.length - 1];

  let message;
  if (firstNeg) message = `<p class="alert">Attention : ton compte passerait sous zéro vers ${monthLabel(firstNeg.key).toLowerCase()}.</p>`;
  else if (net >= 0) message = `<p class="hint">Chaque cycle, il te reste environ ${money(net)} sur ton compte courant${epargne ? `, en plus des ${money(epargne)} que tu verses sur ton Livret A` : ''}.</p>`;
  else message = `<p class="hint">Chaque cycle, ton compte courant baisse d'environ ${money(-net)}.</p>`;

  return `<header class="page-head"><h1>Prévisions</h1></header>
  <section class="block">
    <p class="big-line">En ${monthLabel(last.key).toLowerCase()}, tu aurais environ
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
    <div class="block-head"><h2>Budgets du quotidien</h2><button class="link" data-view="cats">Catégories</button></div>
    <p class="hint top">Touche une catégorie pour fixer son budget : par cycle, par semaine ou en enveloppe.</p>
    <ul class="list">${dailyCats().map(c => {
      const b = budgetOf(c.id);
      const cs = pastCyclesWithData();
      const moy = cs.length ? sum(cs.map(pc => catSpentIn(pc, c.id))) / cs.length : 0;
      return `<li><button class="row" data-act="edit-budget" data-id="${c.id}">
        ${bubble(c.color, c.emoji)}
        <span class="row-main"><span class="row-title">${esc(c.nom)}</span>
          <span class="row-sub">${b ? `${money(b.amount)} ${MODES[b.mode].resume}` : 'Pas de budget'}${moy > 0 ? `. Moyenne : ${money(moy)}` : ''}</span></span>
        <span class="chev" aria-hidden="true">›</span>
      </button></li>`;
    }).join('')}</ul>
    <p class="hint">${cbTotalText(dailyBudget())}</p>
  </section>

  <section class="block">
    <div class="block-head"><h2>Programmé et exceptionnel</h2><button class="link" data-act="add-plan" data-freq="unique">Ajouter</button></div>
    ${uniques.length
      ? `<ul class="list">${uniques.map(planRow).join('')}</ul>`
      : `<p class="empty">Un rendez-vous chez le coiffeur, des cadeaux, une ampoule, une prime ? Ajoute-les ici, ou mets une date future dans le bouton +. L'app te demandera de confirmer le jour J.</p>`}
  </section>

  <details class="block">
    <summary>Détail cycle par cycle</summary>
    <ul class="list">${rows.map(r => `<li class="row"><span class="row-main"><span class="row-title">Jusqu'au ${shortDate(r.c.e)}</span><span class="row-sub">Livret A : ${money(r.livret)}</span></span><span class="row-amount ${r.end < 0 ? 'neg' : ''}">${money(r.end)}</span></li>`).join('')}</ul>
  </details>`;
}

function cbTotalText(total) {
  const n = budgetPeriod().n;
  return total > 0 ? `Total : ${money(total)} par cycle, soit environ ${money(total / n)} par semaine.` : 'Aucun budget fixé pour le moment.';
}

function renderCats() {
  const row = t => c => `<li><button class="row" data-act="edit-cat" data-type="${t}" data-id="${c.id}">
      ${bubble(c.color, c.emoji)}
      <span class="row-main"><span class="row-title">${esc(c.nom)}</span>
      <span class="row-sub">${t === 'revenu' ? 'Revenu' : c.quotidien ? 'Dépense du quotidien (avec budget possible)' : 'Dépense fixe ou ponctuelle'}</span></span>
      <span class="chev" aria-hidden="true">›</span></button></li>`;
  return `<header class="page-head"><h1>Catégories</h1>
    <button class="icon-btn big" data-view="prev" aria-label="Retour">‹</button></header>
  <section class="block">
    <div class="block-head"><h2>Dépenses</h2><button class="link" data-act="add-cat" data-type="depense">Ajouter</button></div>
    <ul class="list">${getCats('depense').map(row('depense')).join('')}</ul>
  </section>
  <section class="block">
    <div class="block-head"><h2>Revenus</h2><button class="link" data-act="add-cat" data-type="revenu">Ajouter</button></div>
    <ul class="list">${getCats('revenu').map(row('revenu')).join('')}</ul>
  </section>
  <p class="hint">Si tu supprimes une catégorie, ses opérations passent dans « ${esc(catInfo('depense', 'autre').nom)} ».</p>`;
}

function renderReglages() {
  const lien = `${location.origin}${location.pathname}#ajout?montant=12,50&commerce=Carrefour`;
  const st = S();
  return `<header class="page-head"><h1>Réglages</h1></header>
  <section class="block">
    <div class="block-head"><h2>Ton cycle</h2></div>
    <p class="hint">Le jour où tu reçois ton salaire. Tout l'accueil est calculé de ce jour-là jusqu'à la veille du salaire suivant. Mets 1 pour suivre les mois du calendrier.</p>
    <form id="cycle-form">
      <div class="field-pair">
        <label class="field"><span>Jour du salaire</span><input type="number" name="cycleDay" min="1" max="28" inputmode="numeric" value="${cycleDay()}"></label>
        <label class="field"><span>Marge de sécurité</span><input name="margin" inputmode="decimal" placeholder="50,00" value="${fmtInput(st.margin)}"></label>
      </div>
      <p class="cycle-now">Cycle actuel : du ${shortDate(cycleAt(0).s)} au ${shortDate(cycleAt(0).e)}</p>
      <p class="hint">Enregistré automatiquement. Si ton salaire arrive le 29, 30 ou 31, mets 28. La marge est l'argent que le plan d'épargne laisse toujours sur ton compte.</p>
    </form>
  </section>

  <section class="block">
    <div class="block-head"><h2>Sur l'accueil</h2></div>
    <ul class="list">${FEATURES.map(([k, t, d]) => switchRow('data-feature', k, t, d, on(k))).join('')}</ul>
  </section>

  ${on('conseils') ? `<details class="block">
    <summary>Choisir les conseils</summary>
    <ul class="list">${TIP_TYPES.map(([k, t]) => switchRow('data-tip', k, t, '', tipOn(k))).join('')}</ul>
  </details>` : ''}

  <section class="block">
    <div class="block-head"><h2>Catégories</h2></div>
    <p class="hint top">Crée, renomme ou supprime tes catégories de dépenses et de revenus.</p>
    <button class="btn" data-view="cats">Gérer les catégories</button>
  </section>

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
    <div class="block-head"><h2>Application</h2></div>
    <p class="hint">Version ${APP_VERSION}. Si l'app ne semble pas à jour, touche ce bouton ou tire l'écran vers le bas depuis le haut de la page. Tes données ne sont pas touchées.</p>
    <button class="btn" data-act="refresh">Actualiser l'app</button>
  </section>

  <section class="block">
    <button class="btn danger" data-act="reset">Effacer toutes les données</button>
  </section>
  <p class="foot">Mon budget, version ${APP_VERSION}. Aucune donnée ne quitte ton appareil.</p>`;
}

const byDateDesc = (a, b) => b.date.localeCompare(a.date) || (b.created || 0) - (a.created || 0);

const $view = document.getElementById('view');
const sheet = document.getElementById('sheet');

function render() {
  applyAuto();
  autoLink();
  const screens = { mois: renderMois, ops: renderOps, epargne: renderEpargne, prev: renderPrev, reglages: renderReglages, cats: renderCats };
  $view.innerHTML = (screens[view] || renderMois)();
  document.querySelectorAll('.tabbar [data-view]').forEach(b =>
    b.setAttribute('aria-current', b.dataset.view === view ? 'page' : 'false'));
}

/* =====================================================
   10. Fenêtres d'ajout / modification
   ===================================================== */
function sheetHead(titre) {
  return `<div class="sheet-head"><h2>${titre}</h2>
    <button type="button" class="icon-btn" data-act="close" aria-label="Fermer">✕</button></div>`;
}
const amountField = (value, focus) => `<label class="amount-field"><input name="amount" inputmode="decimal" placeholder="0,00" aria-label="Montant" value="${value}" ${focus ? 'autofocus' : ''}><span>€</span></label>
  <p class="form-error" hidden></p>`;
const actions = (delAct, id) => `<div class="sheet-actions">
  ${id ? `<button type="button" class="btn danger" data-act="${delAct}" data-id="${id}">Supprimer</button>` : ''}
  <button class="btn primary grow" type="submit">Enregistrer</button></div>`;

function openTxForm(tx = null, prefill = null) {
  const d = tx || prefill || {};
  const type = d.type || 'depense';
  const hasAmount = d.amount !== undefined && d.amount !== '' && !isNaN(d.amount);
  sheet.innerHTML = `<form id="tx-form" class="sheet-body" data-edit="${tx ? tx.id : ''}" data-plan="${d.planId || ''}" data-occ="${d.occ || ''}" autocomplete="off">
    ${sheetHead(tx ? "Modifier l'opération" : 'Nouvelle opération')}
    ${seg('type', type, [['depense', 'Dépense'], ['revenu', 'Revenu']], 'Type')}
    ${amountField(hasAmount ? fmtInput(d.amount) : '', !tx && !hasAmount)}
    <label class="field"><span>Libellé</span><input name="label" maxlength="60" placeholder="Ex. Carrefour, cinéma, loyer" value="${esc(d.label || '')}"></label>
    <fieldset class="cats"><legend>Catégorie</legend><div class="chips" data-chips>${chips(type, d.cat)}</div></fieldset>
    <label class="field"><span>Date</span><input type="date" name="date" value="${d.date || todayStr()}" required></label>
    <p class="hint future-hint" data-future ${(d.date || todayStr()) > todayStr() && !tx ? '' : 'hidden'}>📅 Date future : la dépense sera programmée et l'app te demandera de la confirmer le jour J.</p>
    ${actions('delete-tx', tx && tx.id)}
  </form>`;
  sheet.showModal();
}

function openSavForm(o = null, kind = 'versement', amount = null) {
  const k = o ? o.kind : kind;
  const opt = v => [v, `${KINDS[v].emoji} ${KINDS[v].court}`];
  sheet.innerHTML = `<form id="sav-form" class="sheet-body" data-edit="${o ? o.id : ''}" autocomplete="off">
    ${sheetHead(o ? 'Modifier le mouvement' : 'Livret A')}
    ${seg('kind', k, [opt('versement'), opt('retrait'), opt('externe'), opt('interets')], 'Type de mouvement').replace('class="seg"', 'class="seg grid2"')}
    <p class="hint center" data-kind-help>${KINDS[k].aide}</p>
    ${amountField(o ? fmtInput(o.amount) : amount ? fmtInput(amount) : '', !o && !amount)}
    <label class="field"><span>Note (facultatif)</span><input name="label" maxlength="60" placeholder="Ex. Papa, anniversaire, vacances" value="${esc(o ? o.label : '')}"></label>
    <label class="field"><span>Date</span><input type="date" name="date" value="${o ? o.date : todayStr()}" required></label>
    ${actions('delete-sav', o && o.id)}
  </form>`;
  sheet.showModal();
}

function openPlanForm(p = null, freq = 'mois', type = 'depense', source = 'moi') {
  const d = p || { type, freq, source, day: freq === 'mois' && type === 'revenu' ? cycleDay() : 1, date: todayStr(), auto: source === 'proches' };
  const defLabel = d.type === 'epargne' ? (d.source === 'proches' ? 'Virement de mes parents' : 'Épargne Livret A') : '';
  const titre = p ? 'Modifier la prévision' : freq === 'unique' ? 'Dépense ou rentrée exceptionnelle' : 'Nouvelle prévision';
  sheet.innerHTML = `<form id="plan-form" class="sheet-body" data-edit="${p ? p.id : ''}" autocomplete="off">
    ${sheetHead(titre)}
    ${seg('type', d.type, [['depense', 'Dépense'], ['revenu', 'Revenu'], ['epargne', 'Épargne']], 'Type')}
    <div data-for-type="epargne" ${d.type !== 'epargne' ? 'hidden' : ''}>
      ${seg('source', d.source || 'moi', [['moi', 'Depuis mon compte'], ['proches', 'Versé par mes proches']], 'Qui verse')}
    </div>
    ${amountField(p ? fmtInput(p.amount) : '', false)}
    <label class="field"><span>Libellé</span><input name="label" maxlength="60" placeholder="Ex. Loyer, salaire, cadeau anniversaire" value="${esc(d.label || defLabel)}"></label>
    ${seg('freq', d.freq, [['mois', 'Chaque mois'], ['unique', 'Une seule fois']], 'Fréquence')}
    <label class="field" data-for="mois" ${d.freq !== 'mois' ? 'hidden' : ''}><span>Jour du mois</span><input type="number" name="day" min="1" max="31" inputmode="numeric" value="${d.day || 1}"></label>
    <label class="field" data-for="unique" ${d.freq !== 'unique' ? 'hidden' : ''}><span>Date</span><input type="date" name="date" value="${d.date || todayStr()}"></label>
    <fieldset class="cats" ${d.type === 'epargne' ? 'hidden' : ''}><legend>Catégorie</legend><div class="chips" data-chips>${chips(d.type, d.cat)}</div></fieldset>
    <label class="switch-row boxed">
      <span class="row-main"><span class="row-title">Ajouter automatiquement</span><span class="row-sub">Enregistrée toute seule à la date prévue, sans toucher « Payé » ou « Reçu »</span></span>
      <input type="checkbox" class="switch" role="switch" name="auto" ${d.auto ? 'checked' : ''}>
    </label>
    ${actions('delete-plan', p && p.id)}
  </form>`;
  sheet.showModal();
}

function openBudgetForm(id) {
  const c = catInfo('depense', id);
  const b = budgetOf(id) || { amount: '', mode: 'cycle' };
  const n = budgetPeriod().n;
  sheet.innerHTML = `<form id="budget-cat-form" class="sheet-body" data-cat="${c.id}" autocomplete="off">
    ${sheetHead(`${c.emoji} ${esc(c.nom)}`)}
    ${seg('mode', b.mode, Object.entries(MODES).map(([k, m]) => [k, m.court]), 'Type de budget')}
    <p class="hint center" data-mode-help>${MODES[b.mode].aide(n)}</p>
    ${amountField(b.amount ? fmtInput(b.amount) : '', !b.amount)}
    <p class="hint center" data-amount-unit>${b.mode === 'semaine' ? 'par semaine' : 'par cycle'}</p>
    <div class="sheet-actions">
      ${budgetOf(id) ? `<button type="button" class="btn danger" data-act="delete-budget" data-id="${c.id}">Retirer</button>` : ''}
      <button class="btn primary grow" type="submit">Enregistrer</button>
    </div>
  </form>`;
  sheet.showModal();
}

function openCatForm(type, cat = null) {
  const d = cat || { nom: '', emoji: type === 'revenu' ? '💶' : '🏷️', color: PALETTE[0], quotidien: true };
  const fixe = cat && cat.id === fallbackId(type);
  sheet.innerHTML = `<form id="cat-form" class="sheet-body" data-type="${type}" data-edit="${cat ? cat.id : ''}" autocomplete="off">
    ${sheetHead(cat ? 'Modifier la catégorie' : 'Nouvelle catégorie')}
    <div class="cat-preview" data-preview style="--c:${d.color}"><span class="bubble" style="background:${d.color}24">${d.emoji}</span><strong>${esc(d.nom) || 'Ma catégorie'}</strong></div>
    <div class="field-pair narrow">
      <label class="field"><span>Emoji</span><input name="emoji" maxlength="4" value="${esc(d.emoji)}"></label>
      <label class="field"><span>Nom</span><input name="nom" maxlength="30" required placeholder="Ex. Coiffeur, Animaux" value="${esc(d.nom)}"></label>
    </div>
    <fieldset class="cats"><legend>Couleur</legend><div class="swatches">${PALETTE.map(col =>
      `<label><input class="sr" type="radio" name="color" value="${col}" ${col === d.color ? 'checked' : ''}><span style="background:${col}" aria-label="Couleur ${col}"></span></label>`).join('')}</div></fieldset>
    ${type === 'depense' ? `<label class="switch-row boxed">
      <span class="row-main"><span class="row-title">Dépense du quotidien</span><span class="row-sub">Apparaît dans tes budgets de la semaine</span></span>
      <input type="checkbox" class="switch" role="switch" name="quotidien" ${d.quotidien ? 'checked' : ''}>
    </label>` : ''}
    <div class="sheet-actions">
      ${cat && !fixe ? `<button type="button" class="btn danger" data-act="delete-cat" data-type="${type}" data-id="${cat.id}">Supprimer</button>` : ''}
      <button class="btn primary grow" type="submit">Enregistrer</button>
    </div>
  </form>`;
  sheet.showModal();
}

function saveCat(f) {
  const type = f.dataset.type, id = f.dataset.edit, el = f.elements;
  const nom = el.nom.value.trim();
  if (!nom) { el.nom.focus(); return; }
  const data = {
    nom,
    emoji: el.emoji.value.trim() || '🏷️',
    color: (f.querySelector('input[name=color]:checked') || {}).value || PALETTE[0],
  };
  if (type === 'depense') data.quotidien = el.quotidien.checked;
  const list = state.cats[type];
  if (id) Object.assign(list.find(c => c.id === id), data);
  else list.splice(Math.max(0, list.findIndex(c => c.id === fallbackId(type))), 0, { id: 'c-' + uid(), ...data });
  save(); sheet.close(); render();
  toast(id ? 'Catégorie modifiée' : 'Catégorie ajoutée');
}

function deleteCat(type, id) {
  if (id === fallbackId(type)) return;
  const c = catInfo(type, id), dest = catInfo(type, fallbackId(type));
  if (!confirm(`Supprimer « ${c.nom} » ? Ses opérations passeront dans « ${dest.nom} ».`)) return;
  state.cats[type] = state.cats[type].filter(x => x.id !== id);
  state.transactions.forEach(t => { if (t.type === type && t.cat === id) t.cat = dest.id; });
  state.plans.forEach(p => { if (p.type === type && p.cat === id) p.cat = dest.id; });
  if (type === 'depense') delete state.catBudgets[id];
  save(); sheet.close(); render();
  toast('Catégorie supprimée');
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
  // Nouvelle opération avec une date future : on la programme
  if (!id && !f.dataset.plan && data.date > todayStr()) {
    state.plans.push({ id: uid(), type: data.type, amount, label: data.label, cat: data.cat, freq: 'unique', date: data.date, day: 1, auto: false, lastDone: null, added: false });
    save(); sheet.close(); render();
    return toast(`Programmée pour le ${shortDate(data.date)}`);
  }
  // Confirmation d'une prévision (« C'est fait »)
  if (!id && f.dataset.plan) {
    const p = state.plans.find(x => x.id === f.dataset.plan);
    if (p) {
      data.planId = p.id; data.occ = f.dataset.occ;
      if (p.freq === 'mois') p.lastDone = f.dataset.occ; else p.added = true;
    }
  }
  if (id) Object.assign(state.transactions.find(t => t.id === id), data);
  else state.transactions.push({ id: uid(), created: Date.now(), ...data });
  save(); sheet.close();
  const linked = autoLink();
  render();
  toast(linked && !id ? 'Ajoutée et associée à ta prévision' : id ? 'Opération modifiée' : 'Opération ajoutée');
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
  const freq = el.freq.value;
  const auto = el.auto.checked;
  const id = f.dataset.edit;
  const old = id && state.plans.find(p => p.id === id);
  const data = {
    type, amount, freq, auto,
    label: el.label.value.trim(),
    cat: type === 'epargne' ? 'livret' : checkedCat(f),
    source: type === 'epargne' ? el.source.value : undefined,
    day: Math.min(31, Math.max(1, parseInt(el.day.value, 10) || 1)),
    date: el.date.value || todayStr(),
  };
  if (auto && (!old || !old.auto)) data.since = todayStr();
  if (old) Object.assign(old, data);
  else state.plans.push({ id: uid(), lastDone: null, added: false, ...data });
  save(); sheet.close(); render();
  toast(id ? 'Prévision modifiée' : 'Prévision ajoutée');
}

/* =====================================================
   11. Sauvegarde : export / import
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
   12. Ajout rapide par lien (#ajout?montant=…&commerce=…)
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
   13. Événements
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
    case 'save-now': openSavForm(null, 'versement', Number(t.dataset.amount)); break;
    case 'add-plan': openPlanForm(null, t.dataset.freq, t.dataset.type, t.dataset.source); break;
    case 'edit-plan': openPlanForm(state.plans.find(x => x.id === id)); break;
    case 'plan-done': markPlanDone(id, t.dataset.occ); break;
    case 'plan-confirm': {
      const p = state.plans.find(x => x.id === id);
      if (!p) break;
      if (p.type === 'epargne') { markPlanDone(id, t.dataset.occ); break; }
      openTxForm(null, { type: p.type, amount: p.amount, label: p.label, cat: p.cat, date: todayStr(), planId: p.id, occ: t.dataset.occ });
      break;
    }
    case 'edit-budget': openBudgetForm(id); break;
    case 'delete-budget':
      delete state.catBudgets[id];
      save(); sheet.close(); render(); toast('Budget retiré');
      break;
    case 'add-cat': openCatForm(t.dataset.type); break;
    case 'edit-cat': openCatForm(t.dataset.type, getCats(t.dataset.type).find(c => c.id === id)); break;
    case 'delete-cat': deleteCat(t.dataset.type, id); break;
    case 'plan-skip': skipPlan(id, t.dataset.occ); break;
    case 'ops-prev': opsMonth = addMonths(opsMonth, -1); render(); break;
    case 'ops-next': if (opsMonth < monthKey()) { opsMonth = addMonths(opsMonth, 1); render(); } break;
    case 'export': exportData(); break;
    case 'refresh': refreshApp(); break;
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
  } else if (f.id === 'cycle-form') {
    saveCycle(f);
  } else if (f.id === 'catbudget-form') {
    const nb = {};
    dailyCats().forEach(c => {
      const v = parseNumber(f.elements[c.id].value);
      if (v > 0) nb[c.id] = Math.abs(v);
    });
    state.catBudgets = nb;
    save(); render(); toast('Budgets enregistrés');
  } else if (f.id === 'budget-cat-form') {
    const v = Math.abs(parseNumber(f.elements.amount.value));
    if (!v) return formError(f, 'Indique un montant, par exemple 200');
    state.catBudgets[f.dataset.cat] = { amount: v, mode: f.elements.mode.value };
    save(); sheet.close(); render(); toast('Budget enregistré');
  } else if (f.id === 'cat-form') saveCat(f);
  else if (f.id === 'tx-form') saveTx(f);
  else if (f.id === 'sav-form') saveSav(f);
  else if (f.id === 'plan-form') savePlan(f);
});

function saveCycle(f) {
  const d = parseInt(f.elements.cycleDay.value, 10);
  const m = parseNumber(f.elements.margin.value);
  S().cycleDay = Math.min(28, Math.max(1, d || 1));
  S().margin = isNaN(m) ? 0 : Math.abs(m);
  save(); render();
  const c = cycleAt(0);
  toast(`Cycle : du ${shortDate(c.s)} au ${shortDate(c.e)}`);
}

document.addEventListener('change', e => {
  const el = e.target;
  if (el.form && el.form.id === 'cycle-form') return saveCycle(el.form);
  if (el.id === 'import-file') return importData(el.files[0]);
  if (el.dataset.feature) {
    S().features[el.dataset.feature] = el.checked;
    save(); render();
    return;
  }
  if (el.dataset.tip) {
    const off = new Set(S().tipsOff);
    el.checked ? off.delete(el.dataset.tip) : off.add(el.dataset.tip);
    S().tipsOff = [...off];
    save();
    return;
  }
  const f = el.form;
  if (!f) return;
  if (el.name === 'type') {
    f.querySelector('[data-chips]').innerHTML = chips(el.value);
    const fs = f.querySelector('.cats');
    if (fs) fs.hidden = el.value === 'epargne';
    f.querySelectorAll('[data-for-type]').forEach(x => { x.hidden = x.dataset.forType !== el.value; });
    if (el.value === 'epargne' && !f.elements.label.value) f.elements.label.value = 'Épargne Livret A';
  }
  if (el.name === 'source') {
    const lab = f.elements.label;
    if (!lab.value || lab.value === 'Épargne Livret A' || lab.value === 'Virement de mes parents') {
      lab.value = el.value === 'proches' ? 'Virement de mes parents' : 'Épargne Livret A';
    }
    if (el.value === 'proches') f.elements.auto.checked = true;
  }
  if (el.name === 'kind') f.querySelector('[data-kind-help]').textContent = KINDS[el.value].aide;
  if (el.name === 'mode' && f.id === 'budget-cat-form') {
    f.querySelector('[data-mode-help]').textContent = MODES[el.value].aide(budgetPeriod().n);
    f.querySelector('[data-amount-unit]').textContent = el.value === 'semaine' ? 'par semaine' : 'par cycle';
  }
  if (el.name === 'date' && f.id === 'tx-form') {
    const fh = f.querySelector('[data-future]');
    if (fh) fh.hidden = !(el.value > todayStr()) || !!f.dataset.edit || !!f.dataset.plan;
  }
  if (f.id === 'cat-form' && (el.name === 'color')) updateCatPreview(f);
  if (el.name === 'cat') f.dataset.catTouched = '1';
  if (el.name === 'freq') f.querySelectorAll('[data-for]').forEach(x => { x.hidden = x.dataset.for !== el.value; });
});

function updateCatPreview(f) {
  const pv = f.querySelector('[data-preview]');
  const col = (f.querySelector('input[name=color]:checked') || {}).value || PALETTE[0];
  pv.querySelector('.bubble').style.background = col + '24';
  pv.querySelector('.bubble').textContent = f.elements.emoji.value || '🏷️';
  pv.querySelector('strong').textContent = f.elements.nom.value || 'Ma catégorie';
}

document.addEventListener('input', e => {
  const el = e.target, f = el.form;
  if (f && f.id === 'cat-form') return updateCatPreview(f);
  if (f && f.id === 'budget-cat-form' && el.name === 'amount') { f.querySelector('.form-error').hidden = true; return; }
  if (f && f.id === 'catbudget-form') {
    const total = sum(dailyCats().map(c => Math.abs(parseNumber(f.elements[c.id].value)) || 0));
    f.querySelector('[data-cb-total]').textContent = cbTotalText(total);
    return;
  }
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
   14. Démarrage
   ===================================================== */
let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

// Télécharge la dernière version de l'app (les données ne sont pas touchées)
async function refreshApp() {
  const el = document.getElementById('ptr');
  try {
    const r = await fetch('index.html', { cache: 'no-store' });
    if (!r.ok) throw new Error('réseau');
  } catch (e) {
    state = load(); render();
    el.classList.remove('on');
    return toast('Pas de connexion : écran actualisé');
  }
  el.textContent = 'Actualisation…';
  el.classList.add('on');
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.update().catch(() => {})));
    }
    if (window.caches) {
      const ks = await caches.keys();
      await Promise.all(ks.map(k => caches.delete(k)));
    }
  } catch (e) { /* on recharge quand même */ }
  location.reload();
}

// Tirer l'écran vers le bas pour actualiser
(function pullToRefresh() {
  const el = document.getElementById('ptr');
  let startY = null, dy = 0;
  window.addEventListener('touchstart', e => {
    startY = (!sheet.open && window.scrollY <= 0) ? e.touches[0].clientY : null;
    dy = 0;
  }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (startY === null) return;
    dy = e.touches[0].clientY - startY;
    if (dy > 15 && window.scrollY <= 0) {
      el.classList.add('pull');
      el.style.transform = `translate(-50%, ${Math.min(dy * 0.4, 60)}px)`;
      el.textContent = dy > 120 ? '↻ Relâche pour actualiser' : '↓ Tire pour actualiser';
    }
  }, { passive: true });
  window.addEventListener('touchend', () => {
    if (startY === null) return;
    const go = dy > 120;
    startY = null;
    el.classList.remove('pull');
    el.style.transform = '';
    if (go) refreshApp();
  }, { passive: true });
})();

state = load();
save();
opsMonth = monthKey();
render();
handleHash();
window.addEventListener('hashchange', handleHash);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
