// ═══════════════════════════════════════════════════════
// CONSTANTS · Static data: goals, habits, supplements, etc.
// ═══════════════════════════════════════════════════════

const GOALS = {
  hybrid:       { id: 'hybrid',       name: 'Hybrid Athlet',   icon: '⚔️', color: '#5CB875', desc: 'Kraft und Ausdauer vereint.' },
  bodybuilder:  { id: 'bodybuilder',  name: 'Bodybuilder',     icon: '💪', color: '#E89B4D', desc: 'Maximale Muskelmasse durch Wissenschaft.' },
  longevity:    { id: 'longevity',    name: 'Longevity',       icon: '🌿', color: '#52B5A8', desc: 'Länger, gesünder, schärfer leben.' },
  biohacker:    { id: 'biohacker',    name: 'Biohacker',       icon: '🧬', color: '#9B82C9', desc: 'Den Körper als System optimieren.' },
  entrepreneur: { id: 'entrepreneur', name: 'Unternehmer',     icon: '🧠', color: '#6BA5D4', desc: 'Mentale Schärfe als stärkste Ressource.' },
  custom:       { id: 'custom',       name: 'Eigenes Ziel',    icon: '⚡', color: '#E0BE7E', desc: 'Deine Regeln.' },
};

const HABITS = [
  { id: 'sport',    cat: 'body',       icon: '🏋', label: 'Training',     xp: 30 },
  { id: 'cold',     cat: 'body',       icon: '🚿', label: 'Kaltdusche',   xp: 25 },
  { id: 'walk',     cat: 'body',       icon: '🚶', label: 'Spaziergang',  xp: 15 },
  { id: 'read',     cat: 'mind',       icon: '📖', label: 'Lesen',        xp: 20 },
  { id: 'meditate', cat: 'mind',       icon: '🧘', label: 'Meditation',   xp: 15 },
  { id: 'journal',  cat: 'mind',       icon: '✍',  label: 'Journaling',   xp: 15 },
  { id: 'nosnooze', cat: 'discipline', icon: '⏰', label: 'Kein Snooze',  xp: 20 },
  { id: 'plan',     cat: 'discipline', icon: '📋', label: 'Tag geplant',  xp: 15 },
];

const SUPPS = [
  { id: 'kreatin', n: 'Kreatin',       d: '5g',      ic: '💊', t: '07:30' },
  { id: 'vitd',    n: 'Vitamin D',     d: '5000 IE', ic: '☀️', t: '08:00' },
  { id: 'omega3',  n: 'Omega 3',       d: '2 Kps.',  ic: '🐟', t: '12:00' },
  { id: 'prework', n: 'Pre-Workout',   d: '1 Prtg.', ic: '⚡', t: '17:30' },
  { id: 'protein', n: 'Protein Shake', d: '30g',     ic: '🥤', t: '19:00' },
];

// Whole, mostly unprocessed foods (per typical portion). Users can still add
// their own via "+ Eigene Mahlzeit". Kept realistic, not exhaustive.
const FOODS = [
  // ── Protein ──
  { id: 'f1',  n: 'Hähnchenbrust 150g',   kcal: 165, p: 31, c: 0,  f: 3,  ic: '🍗', cat: 'Protein' },
  { id: 'f2',  n: 'Lachs 150g',           kcal: 280, p: 34, c: 0,  f: 16, ic: '🐟', cat: 'Protein' },
  { id: 'f3',  n: 'Eier x2',              kcal: 140, p: 12, c: 1,  f: 10, ic: '🥚', cat: 'Protein' },
  { id: 'f4',  n: 'Magerquark 200g',      kcal: 130, p: 24, c: 6,  f: 1,  ic: '🫙', cat: 'Protein' },
  { id: 'f6',  n: 'Protein Shake',        kcal: 130, p: 25, c: 5,  f: 2,  ic: '🥤', cat: 'Protein' },
  { id: 'f7',  n: 'Rindfleisch 150g',     kcal: 250, p: 39, c: 0,  f: 10, ic: '🥩', cat: 'Protein' },
  { id: 'f8',  n: 'Putenbrust 150g',      kcal: 160, p: 34, c: 0,  f: 2,  ic: '🦃', cat: 'Protein' },
  { id: 'f9',  n: 'Thunfisch (Dose) 150g', kcal: 170, p: 38, c: 0, f: 2,  ic: '🐟', cat: 'Protein' },
  { id: 'f10', n: 'Hüttenkäse 200g',      kcal: 200, p: 26, c: 6,  f: 8,  ic: '🧀', cat: 'Protein' },
  { id: 'f11', n: 'Naturjoghurt 250g',    kcal: 155, p: 9,  c: 12, f: 8,  ic: '🥛', cat: 'Protein' },
  { id: 'f12', n: 'Linsen (gekocht) 200g', kcal: 230, p: 18, c: 40, f: 1, ic: '🫘', cat: 'Protein' },
  { id: 'f13', n: 'Kichererbsen 200g',    kcal: 260, p: 14, c: 44, f: 4,  ic: '🫘', cat: 'Protein' },
  { id: 'f14', n: 'Tofu 150g',            kcal: 180, p: 17, c: 3,  f: 11, ic: '🧊', cat: 'Protein' },
  // ── Komplexe Carbs ──
  { id: 'f5',  n: 'Haferflocken 80g',     kcal: 300, p: 10, c: 54, f: 6,  ic: '🌾', cat: 'Carbs' },
  { id: 'f15', n: 'Reis (gekocht) 200g',  kcal: 260, p: 5,  c: 56, f: 1,  ic: '🍚', cat: 'Carbs' },
  { id: 'f16', n: 'Süßkartoffel 200g',    kcal: 180, p: 3,  c: 41, f: 0,  ic: '🍠', cat: 'Carbs' },
  { id: 'f17', n: 'Kartoffeln 250g',      kcal: 190, p: 5,  c: 43, f: 0,  ic: '🥔', cat: 'Carbs' },
  { id: 'f18', n: 'Vollkornbrot 2 Scheiben', kcal: 190, p: 8, c: 34, f: 3, ic: '🍞', cat: 'Carbs' },
  { id: 'f19', n: 'Vollkornnudeln 125g roh', kcal: 440, p: 16, c: 84, f: 3, ic: '🍝', cat: 'Carbs' },
  { id: 'f20', n: 'Quinoa (gekocht) 185g', kcal: 220, p: 8, c: 39, f: 4,  ic: '🌾', cat: 'Carbs' },
  // ── Gemüse & Obst ──
  { id: 'f21', n: 'Brokkoli 200g',        kcal: 70,  p: 6,  c: 8,  f: 1,  ic: '🥦', cat: 'Gemüse' },
  { id: 'f22', n: 'Spinat 100g',          kcal: 25,  p: 3,  c: 2,  f: 0,  ic: '🥬', cat: 'Gemüse' },
  { id: 'f23', n: 'Gemischter Salat',     kcal: 40,  p: 2,  c: 6,  f: 0,  ic: '🥗', cat: 'Gemüse' },
  { id: 'f24', n: 'Avocado ½',            kcal: 160, p: 2,  c: 9,  f: 15, ic: '🥑', cat: 'Gemüse' },
  { id: 'f25', n: 'Banane',               kcal: 105, p: 1,  c: 27, f: 0,  ic: '🍌', cat: 'Obst' },
  { id: 'f26', n: 'Apfel',                kcal: 95,  p: 0,  c: 25, f: 0,  ic: '🍎', cat: 'Obst' },
  { id: 'f27', n: 'Beeren 150g',          kcal: 85,  p: 1,  c: 18, f: 1,  ic: '🫐', cat: 'Obst' },
  // ── Fette & Snacks ──
  { id: 'f28', n: 'Mandeln 30g',          kcal: 175, p: 6,  c: 6,  f: 15, ic: '🌰', cat: 'Fette & Nüsse' },
  { id: 'f29', n: 'Walnüsse 30g',         kcal: 200, p: 5,  c: 4,  f: 20, ic: '🌰', cat: 'Fette & Nüsse' },
  { id: 'f30', n: 'Olivenöl 1 EL',        kcal: 120, p: 0,  c: 0,  f: 14, ic: '🫒', cat: 'Fette & Nüsse' },
  { id: 'f31', n: 'Erdnussbutter 1 EL',   kcal: 95,  p: 4,  c: 3,  f: 8,  ic: '🥜', cat: 'Fette & Nüsse' },

  // ── Protein · mehr Fleisch, Fisch, Eier, Milchprodukte, Hülsenfrüchte ──
  { id: 'f32', n: 'Forelle 150g',         kcal: 190, p: 30, c: 0,  f: 8,  ic: '🐟', cat: 'Protein' },
  { id: 'f33', n: 'Makrele 150g',         kcal: 305, p: 28, c: 0,  f: 22, ic: '🐟', cat: 'Protein' },
  { id: 'f34', n: 'Garnelen 150g',        kcal: 100, p: 24, c: 0,  f: 1,  ic: '🦐', cat: 'Protein' },
  { id: 'f35', n: 'Kabeljau 150g',        kcal: 110, p: 26, c: 0,  f: 1,  ic: '🐟', cat: 'Protein' },
  { id: 'f36', n: 'Sardinen 100g',        kcal: 210, p: 25, c: 0,  f: 11, ic: '🐟', cat: 'Protein' },
  { id: 'f37', n: 'Hähnchenschenkel 150g', kcal: 220, p: 27, c: 0, f: 12, ic: '🍗', cat: 'Protein' },
  { id: 'f38', n: 'Rinderhack 150g',      kcal: 280, p: 30, c: 0,  f: 18, ic: '🥩', cat: 'Protein' },
  { id: 'f39', n: 'Lammfleisch 150g',     kcal: 280, p: 25, c: 0,  f: 20, ic: '🍖', cat: 'Protein' },
  { id: 'f40', n: 'Schweinefilet 150g',   kcal: 200, p: 31, c: 0,  f: 8,  ic: '🍖', cat: 'Protein' },
  { id: 'f41', n: 'Ente 150g',            kcal: 300, p: 28, c: 0,  f: 21, ic: '🦆', cat: 'Protein' },
  { id: 'f42', n: 'Rinderleber 100g',     kcal: 135, p: 20, c: 4,  f: 4,  ic: '🥩', cat: 'Protein' },
  { id: 'f43', n: 'Griech. Joghurt 200g', kcal: 180, p: 18, c: 8,  f: 8,  ic: '🥛', cat: 'Protein' },
  { id: 'f44', n: 'Skyr 200g',            kcal: 130, p: 22, c: 8,  f: 0,  ic: '🥛', cat: 'Protein' },
  { id: 'f45', n: 'Mozzarella 100g',      kcal: 250, p: 18, c: 1,  f: 19, ic: '🧀', cat: 'Protein' },
  { id: 'f46', n: 'Feta 50g',             kcal: 130, p: 7,  c: 1,  f: 11, ic: '🧀', cat: 'Protein' },
  { id: 'f47', n: 'Schwarze Bohnen 200g', kcal: 260, p: 16, c: 40, f: 1,  ic: '🫘', cat: 'Protein' },
  { id: 'f48', n: 'Edamame 150g',         kcal: 180, p: 17, c: 14, f: 8,  ic: '🫛', cat: 'Protein' },
  { id: 'f49', n: 'Tempeh 100g',          kcal: 190, p: 19, c: 8,  f: 11, ic: '🧊', cat: 'Protein' },

  // ── Gemüse ──
  { id: 'f51', n: 'Karotte 100g',         kcal: 40,  p: 1,  c: 9,  f: 0,  ic: '🥕', cat: 'Gemüse' },
  { id: 'f52', n: 'Paprika 100g',         kcal: 30,  p: 1,  c: 6,  f: 0,  ic: '🫑', cat: 'Gemüse' },
  { id: 'f53', n: 'Tomaten 150g',         kcal: 27,  p: 1,  c: 5,  f: 0,  ic: '🍅', cat: 'Gemüse' },
  { id: 'f54', n: 'Gurke 150g',           kcal: 22,  p: 1,  c: 4,  f: 0,  ic: '🥒', cat: 'Gemüse' },
  { id: 'f55', n: 'Zucchini 150g',        kcal: 25,  p: 2,  c: 5,  f: 0,  ic: '🥒', cat: 'Gemüse' },
  { id: 'f56', n: 'Blumenkohl 150g',      kcal: 38,  p: 3,  c: 7,  f: 0,  ic: '🥦', cat: 'Gemüse' },
  { id: 'f57', n: 'Grünkohl 100g',        kcal: 35,  p: 3,  c: 4,  f: 1,  ic: '🥬', cat: 'Gemüse' },
  { id: 'f58', n: 'Rosenkohl 150g',       kcal: 65,  p: 5,  c: 13, f: 1,  ic: '🥬', cat: 'Gemüse' },
  { id: 'f59', n: 'Rote Bete 150g',       kcal: 65,  p: 2,  c: 15, f: 0,  ic: '🥬', cat: 'Gemüse' },
  { id: 'f60', n: 'Kürbis 200g',          kcal: 52,  p: 2,  c: 12, f: 0,  ic: '🎃', cat: 'Gemüse' },
  { id: 'f61', n: 'Champignons 150g',     kcal: 33,  p: 5,  c: 5,  f: 0,  ic: '🍄', cat: 'Gemüse' },
  { id: 'f62', n: 'Zwiebel 100g',         kcal: 40,  p: 1,  c: 9,  f: 0,  ic: '🧅', cat: 'Gemüse' },
  { id: 'f63', n: 'Knoblauch 15g',        kcal: 22,  p: 1,  c: 5,  f: 0,  ic: '🧄', cat: 'Gemüse' },
  { id: 'f64', n: 'Spargel 150g',         kcal: 30,  p: 3,  c: 6,  f: 0,  ic: '🥬', cat: 'Gemüse' },
  { id: 'f65', n: 'Aubergine 150g',       kcal: 38,  p: 1,  c: 9,  f: 0,  ic: '🍆', cat: 'Gemüse' },
  { id: 'f66', n: 'Rucola 40g',           kcal: 10,  p: 1,  c: 1,  f: 0,  ic: '🥬', cat: 'Gemüse' },
  { id: 'f67', n: 'Grüne Bohnen 150g',    kcal: 47,  p: 3,  c: 10, f: 0,  ic: '🫛', cat: 'Gemüse' },
  { id: 'f68', n: 'Erbsen 150g',          kcal: 120, p: 8,  c: 21, f: 1,  ic: '🫛', cat: 'Gemüse' },
  { id: 'f69', n: 'Mais 150g',            kcal: 130, p: 5,  c: 28, f: 2,  ic: '🌽', cat: 'Gemüse' },

  // ── Obst ──
  { id: 'f70', n: 'Orange',               kcal: 62,  p: 1,  c: 15, f: 0,  ic: '🍊', cat: 'Obst' },
  { id: 'f71', n: 'Birne',                kcal: 100, p: 1,  c: 27, f: 0,  ic: '🍐', cat: 'Obst' },
  { id: 'f72', n: 'Trauben 100g',         kcal: 70,  p: 1,  c: 18, f: 0,  ic: '🍇', cat: 'Obst' },
  { id: 'f73', n: 'Erdbeeren 150g',       kcal: 50,  p: 1,  c: 12, f: 0,  ic: '🍓', cat: 'Obst' },
  { id: 'f74', n: 'Kiwi x2',              kcal: 90,  p: 2,  c: 22, f: 1,  ic: '🥝', cat: 'Obst' },
  { id: 'f75', n: 'Ananas 150g',          kcal: 75,  p: 1,  c: 20, f: 0,  ic: '🍍', cat: 'Obst' },
  { id: 'f76', n: 'Mango 150g',           kcal: 90,  p: 1,  c: 23, f: 0,  ic: '🥭', cat: 'Obst' },
  { id: 'f77', n: 'Wassermelone 200g',    kcal: 60,  p: 1,  c: 15, f: 0,  ic: '🍉', cat: 'Obst' },
  { id: 'f78', n: 'Pfirsich',             kcal: 60,  p: 1,  c: 14, f: 0,  ic: '🍑', cat: 'Obst' },
  { id: 'f79', n: 'Kirschen 150g',        kcal: 95,  p: 2,  c: 24, f: 0,  ic: '🍒', cat: 'Obst' },
  { id: 'f80', n: 'Granatapfel ½',        kcal: 70,  p: 1,  c: 17, f: 1,  ic: '🔴', cat: 'Obst' },
  { id: 'f81', n: 'Datteln x3',           kcal: 200, p: 2,  c: 53, f: 0,  ic: '🌴', cat: 'Obst' },
  { id: 'f82', n: 'Zitrone',              kcal: 17,  p: 1,  c: 5,  f: 0,  ic: '🍋', cat: 'Obst' },
  { id: 'f83', n: 'Grapefruit ½',         kcal: 52,  p: 1,  c: 13, f: 0,  ic: '🍊', cat: 'Obst' },

  // ── Komplexe Carbs & natürliche Süße (Honig etc.) ──
  { id: 'f84', n: 'Honig 1 EL',           kcal: 64,  p: 0,  c: 17, f: 0,  ic: '🍯', cat: 'Carbs' },
  { id: 'f85', n: 'Ahornsirup 1 EL',      kcal: 52,  p: 0,  c: 13, f: 0,  ic: '🍁', cat: 'Carbs' },
  { id: 'f86', n: 'Buchweizen (gek.) 150g', kcal: 140, p: 5, c: 30, f: 1,  ic: '🌾', cat: 'Carbs' },
  { id: 'f87', n: 'Hirse (gekocht) 150g', kcal: 160, p: 5,  c: 33, f: 1,  ic: '🌾', cat: 'Carbs' },
  { id: 'f88', n: 'Naturreis (gek.) 200g', kcal: 220, p: 5, c: 46, f: 2,  ic: '🍚', cat: 'Carbs' },
  { id: 'f89', n: 'Couscous VK 150g',     kcal: 170, p: 6,  c: 35, f: 0,  ic: '🌾', cat: 'Carbs' },
  { id: 'f90', n: 'Dinkelbrot 2 Scheiben', kcal: 180, p: 8, c: 33, f: 2,  ic: '🍞', cat: 'Carbs' },
  { id: 'f91', n: 'Roggenbrot 2 Scheiben', kcal: 160, p: 6, c: 31, f: 2,  ic: '🍞', cat: 'Carbs' },
  { id: 'f92', n: 'Müsli-Basis 60g',      kcal: 230, p: 7,  c: 40, f: 5,  ic: '🥣', cat: 'Carbs' },

  // ── Fette, Nüsse & Samen ──
  { id: 'f93', n: 'Cashews 30g',          kcal: 165, p: 5,  c: 9,  f: 13, ic: '🥜', cat: 'Fette & Nüsse' },
  { id: 'f94', n: 'Haselnüsse 30g',       kcal: 190, p: 4,  c: 5,  f: 18, ic: '🌰', cat: 'Fette & Nüsse' },
  { id: 'f95', n: 'Paranüsse 30g',        kcal: 200, p: 4,  c: 4,  f: 20, ic: '🌰', cat: 'Fette & Nüsse' },
  { id: 'f96', n: 'Pistazien 30g',        kcal: 170, p: 6,  c: 8,  f: 14, ic: '🥜', cat: 'Fette & Nüsse' },
  { id: 'f97', n: 'Kürbiskerne 30g',      kcal: 170, p: 9,  c: 4,  f: 14, ic: '🎃', cat: 'Fette & Nüsse' },
  { id: 'f98', n: 'Sonnenblumenkerne 30g', kcal: 175, p: 6, c: 6,  f: 15, ic: '🌻', cat: 'Fette & Nüsse' },
  { id: 'f99', n: 'Chiasamen 20g',        kcal: 100, p: 3,  c: 8,  f: 6,  ic: '🌱', cat: 'Fette & Nüsse' },
  { id: 'f100', n: 'Leinsamen 20g',       kcal: 105, p: 4,  c: 6,  f: 8,  ic: '🌱', cat: 'Fette & Nüsse' },
  { id: 'f101', n: 'Kokosöl 1 EL',        kcal: 120, p: 0,  c: 0,  f: 14, ic: '🥥', cat: 'Fette & Nüsse' },
  { id: 'f102', n: 'Kokosnuss 40g',       kcal: 140, p: 1,  c: 6,  f: 13, ic: '🥥', cat: 'Fette & Nüsse' },
  { id: 'f103', n: 'Macadamia 30g',       kcal: 215, p: 2,  c: 4,  f: 23, ic: '🌰', cat: 'Fette & Nüsse' },
  { id: 'f104', n: 'Tahini 1 EL',         kcal: 90,  p: 3,  c: 3,  f: 8,  ic: '🥣', cat: 'Fette & Nüsse' },

  // ── Milchprodukte ──
  { id: 'f105', n: 'Milch 250ml',          kcal: 125, p: 8,  c: 12, f: 5,  ic: '🥛', cat: 'Milchprodukte' },
  { id: 'f106', n: 'Hafermilch 250ml',     kcal: 110, p: 3,  c: 17, f: 4,  ic: '🥛', cat: 'Milchprodukte' },
  { id: 'f107', n: 'Sojamilch 250ml',      kcal: 95,  p: 8,  c: 4,  f: 5,  ic: '🥛', cat: 'Milchprodukte' },
  { id: 'f108', n: 'Butter 10g',           kcal: 74,  p: 0,  c: 0,  f: 8,  ic: '🧈', cat: 'Milchprodukte' },
  { id: 'f109', n: 'Sahne 30g',            kcal: 90,  p: 1,  c: 1,  f: 9,  ic: '🥛', cat: 'Milchprodukte' },
  { id: 'f110', n: 'Cheddar 30g',          kcal: 120, p: 7,  c: 0,  f: 10, ic: '🧀', cat: 'Milchprodukte' },
  { id: 'f111', n: 'Gouda 30g',            kcal: 110, p: 8,  c: 0,  f: 9,  ic: '🧀', cat: 'Milchprodukte' },
  { id: 'f112', n: 'Frischkäse 30g',       kcal: 75,  p: 2,  c: 1,  f: 7,  ic: '🧀', cat: 'Milchprodukte' },

  // ── Getränke ──
  { id: 'f113', n: 'Orangensaft 250ml',    kcal: 110, p: 2,  c: 26, f: 0,  ic: '🧃', cat: 'Getränke' },
  { id: 'f114', n: 'Apfelsaft 250ml',      kcal: 115, p: 0,  c: 28, f: 0,  ic: '🧃', cat: 'Getränke' },
  { id: 'f115', n: 'Cola 330ml',           kcal: 139, p: 0,  c: 35, f: 0,  ic: '🥤', cat: 'Getränke' },
  { id: 'f116', n: 'Kaffee schwarz',       kcal: 2,   p: 0,  c: 0,  f: 0,  ic: '☕', cat: 'Getränke' },
  { id: 'f117', n: 'Grüner Tee',           kcal: 0,   p: 0,  c: 0,  f: 0,  ic: '🍵', cat: 'Getränke' },
  { id: 'f118', n: 'Bier 500ml',           kcal: 210, p: 2,  c: 16, f: 0,  ic: '🍺', cat: 'Getränke' },
  { id: 'f119', n: 'Rotwein 150ml',        kcal: 125, p: 0,  c: 4,  f: 0,  ic: '🍷', cat: 'Getränke' },

  // ── Snacks & Süßes ──
  { id: 'f120', n: 'Zartbitterschokolade 30g', kcal: 170, p: 2, c: 13, f: 12, ic: '🍫', cat: 'Snacks & Süßes' },
  { id: 'f121', n: 'Vollmilchschokolade 30g',  kcal: 160, p: 2, c: 17, f: 9,  ic: '🍫', cat: 'Snacks & Süßes' },
  { id: 'f122', n: 'Proteinriegel',        kcal: 200, p: 20, c: 20, f: 7,  ic: '🍫', cat: 'Snacks & Süßes' },
  { id: 'f123', n: 'Reiswaffeln x2',       kcal: 70,  p: 1,  c: 15, f: 0,  ic: '🍘', cat: 'Snacks & Süßes' },
  { id: 'f124', n: 'Popcorn 30g',          kcal: 120, p: 3,  c: 20, f: 4,  ic: '🍿', cat: 'Snacks & Süßes' },
  { id: 'f125', n: 'Chips 30g',            kcal: 160, p: 2,  c: 15, f: 10, ic: '🥔', cat: 'Snacks & Süßes' },
  { id: 'f126', n: 'Gummibärchen 30g',     kcal: 100, p: 2,  c: 23, f: 0,  ic: '🐻', cat: 'Snacks & Süßes' },
  { id: 'f127', n: 'Studentenfutter 40g',  kcal: 210, p: 6,  c: 14, f: 15, ic: '🥜', cat: 'Snacks & Süßes' },
  { id: 'f128', n: 'Müsliriegel',          kcal: 120, p: 2,  c: 20, f: 4,  ic: '🍫', cat: 'Snacks & Süßes' },

  // ── Protein · mehr ──
  { id: 'f129', n: 'Seitan 100g',          kcal: 120, p: 25, c: 4,  f: 2,  ic: '🌾', cat: 'Protein' },
  { id: 'f130', n: 'Räuchertofu 100g',     kcal: 150, p: 16, c: 2,  f: 9,  ic: '🧊', cat: 'Protein' },
  { id: 'f131', n: 'Hähnchen-Aufschnitt 50g', kcal: 55, p: 11, c: 0, f: 1, ic: '🍗', cat: 'Protein' },
  { id: 'f132', n: 'Kabanossi 50g',        kcal: 175, p: 9,  c: 1,  f: 15, ic: '🌭', cat: 'Protein' },
  { id: 'f133', n: 'Räucherlachs 50g',     kcal: 90,  p: 10, c: 0,  f: 6,  ic: '🐟', cat: 'Protein' },

  // ── Carbs · mehr ──
  { id: 'f134', n: 'Bagel',                kcal: 250, p: 10, c: 48, f: 2,  ic: '🥯', cat: 'Carbs' },
  { id: 'f135', n: 'Tortilla-Wrap',        kcal: 140, p: 4,  c: 24, f: 3,  ic: '🌯', cat: 'Carbs' },
  { id: 'f136', n: 'Cornflakes 40g',       kcal: 150, p: 3,  c: 34, f: 0,  ic: '🥣', cat: 'Carbs' },
  { id: 'f137', n: 'Pfannkuchen x1',       kcal: 90,  p: 3,  c: 12, f: 3,  ic: '🥞', cat: 'Carbs' },

  // ── Gemüse · mehr ──
  { id: 'f138', n: 'Sellerie 100g',        kcal: 16,  p: 1,  c: 3,  f: 0,  ic: '🥬', cat: 'Gemüse' },
  { id: 'f139', n: 'Lauch 100g',           kcal: 30,  p: 1,  c: 6,  f: 0,  ic: '🥬', cat: 'Gemüse' },
  { id: 'f140', n: 'Radieschen 100g',      kcal: 16,  p: 1,  c: 3,  f: 0,  ic: '🥬', cat: 'Gemüse' },
  { id: 'f141', n: 'Fenchel 100g',         kcal: 31,  p: 1,  c: 7,  f: 0,  ic: '🥬', cat: 'Gemüse' },

  // ── Obst · mehr ──
  { id: 'f142', n: 'Aprikose x2',          kcal: 34,  p: 1,  c: 8,  f: 0,  ic: '🍑', cat: 'Obst' },
  { id: 'f143', n: 'Pflaume x2',           kcal: 60,  p: 1,  c: 15, f: 0,  ic: '🫐', cat: 'Obst' },
  { id: 'f144', n: 'Feige x2',             kcal: 74,  p: 1,  c: 19, f: 0,  ic: '🫐', cat: 'Obst' },
  { id: 'f145', n: 'Cranberries 40g',      kcal: 20,  p: 0,  c: 5,  f: 0,  ic: '🫐', cat: 'Obst' },
  { id: 'f146', n: 'Rosinen 30g',          kcal: 90,  p: 1,  c: 22, f: 0,  ic: '🍇', cat: 'Obst' },
];

const RECOVERY = [
  { id: 'sauna',    n: 'Sauna',         ic: '🔥', c: '#E89B4D', t: '15–30 Min' },
  { id: 'cold',     n: 'Kältetherapie', ic: '🧊', c: '#6BA5D4', t: '2–5 Min' },
  { id: 'stretch',  n: 'Stretching',    ic: '🧘', c: '#9B82C9', t: '15 Min' },
  { id: 'fascia',   n: 'Faszienrolle',  ic: '🫀', c: '#5CB875', t: '10 Min' },
  { id: 'redlight', n: 'Rotlicht',      ic: '🔴', c: '#E16868', t: '15 Min' },
];

// Slow, earned progression — 15 stages. Early levels take days, later levels
// weeks/months. XP also decays on missed days (see decayXP), so a title has to
// be maintained, not just reached once.
const LEVELS = [
  { l: 1,  n: 'Anfänger',        min: 0,     max: 399 },
  { l: 2,  n: 'Lehrling',        min: 400,   max: 999 },
  { l: 3,  n: 'Geselle',         min: 1000,  max: 1999 },
  { l: 4,  n: 'Fortgeschritten', min: 2000,  max: 3499 },
  { l: 5,  n: 'Könner',          min: 3500,  max: 5499 },
  { l: 6,  n: 'Profi',           min: 5500,  max: 7999 },
  { l: 7,  n: 'Experte',         min: 8000,  max: 10999 },
  { l: 8,  n: 'Meister',         min: 11000, max: 14999 },
  { l: 9,  n: 'Veteran',         min: 15000, max: 19999 },
  { l: 10, n: 'Elite',           min: 20000, max: 26999 },
  { l: 11, n: 'Champion',        min: 27000, max: 35999 },
  { l: 12, n: 'Vorbild',         min: 36000, max: 47999 },
  { l: 13, n: 'Legende',         min: 48000, max: 64999 },
  { l: 14, n: 'Ikone',           min: 65000, max: 89999 },
  { l: 15, n: 'Großmeister',     min: 90000, max: Infinity },
];

// ─── INTEL KNOWLEDGE BASE ─────────────────────────────
const INTEL_SECTIONS = [
  { id: 'cortisol', ic: '🧬', label: 'Kortisol', color: '#E16868',
    items: [
      { h: 'Sofort-Maßnahmen', c: '#E16868', tips: ['Koffein erst 90 Min nach dem Aufwachen', 'Box Breathing 4-4-4-4 täglich 5 Min', '20 Min Natur-Spaziergang = –21% Kortisol', 'Magnesium Glycinat 400mg abends'] },
      { h: 'Supplements', c: '#9B82C9', tips: ['Ashwagandha KSM-66 300–600mg abends', 'Omega-3 3–4g täglich', 'Rhodiola Rosea 200–400mg morgens'] },
      { h: 'Bei extremem Stress', c: '#E0BE7E', tips: ['Pomodoro 25/5 Rhythmus', 'Aufgaben abends aufschreiben', 'Feste Arbeitsendezeit täglich', 'Kein Social Media morgens'] },
    ] },
  { id: 'sleep', ic: '🌙', label: 'Schlaf & Luzid', color: '#9B82C9',
    items: [
      { h: 'Schlaf optimieren', c: '#9B82C9', tips: ['7–9h vor Mitternacht', '18°C Zimmer, totale Dunkelheit', 'Magnesium 300mg abends', 'Kein Essen 2h vor Schlafen'] },
      { h: 'Luzides Träumen', c: '#6BA5D4', tips: ['MILD beim Einschlafen – Intention setzen', 'WBTB: Nach 5–6h kurz aufwachen + einschlafen', 'Reality Checks 10–15x täglich', 'Traumtagebuch sofort nach Aufwachen'] },
      { h: 'Supplements Luzidität', c: '#6BA5D4', tips: ['Galantamin 4–8mg bei WBTB (max 2x/Wo!)', 'Alpha-GPC 300mg bei WBTB', 'Vitamin B6 100mg abends', 'Melatonin max 0.5–1mg'] },
    ] },
  { id: 'vo2', ic: '🫁', label: 'VO2max', color: '#E16868',
    items: [
      { h: 'Protokolle', c: '#E16868', tips: ['Norwegisches 4x4: 4 Min @ 90–95% max HR, 4 Runden', 'Zone 2 Cardio: 3–4x/Woche @ 120–150 Puls', 'HIIT Sprints: 8x30 Sek Vollsprint, 90 Sek Pause'] },
      { h: 'Ernährung & Supps', c: '#5CB875', tips: ['Rote-Bete-Saft 500ml 2h vor Training', 'Eisenreiche Ernährung + Vitamin C', 'Wim Hof Breathing 10 Min vor Training'] },
    ] },
  { id: 'supps', ic: '💊', label: 'Supplements', color: '#6BA5D4',
    items: [
      { h: 'Absolute Basis', c: '#E0BE7E', tips: ['Vitamin D 5000 IE + K2 100mcg morgens', 'Omega-3 2–4g EPA+DHA zur Mahlzeit', 'Magnesium Glycinat 300–400mg abends', 'Kreatin 5g täglich'] },
      { h: 'Performance', c: '#5CB875', tips: ['Zink 15–25mg abends', 'Kollagen 15g + Vit C nach Training', 'Ashwagandha 300mg abends'] },
      { h: 'Mental & Longevity', c: '#9B82C9', tips: ["Lion's Mane 500mg täglich", 'L-Theanin 200mg + Koffein 100mg', 'NMN/NR 250–500mg morgens nüchtern'] },
    ] },
  { id: 'joints', ic: '🦴', label: 'Gelenke & Körper', color: '#6BA5D4',
    items: [
      { h: 'Selbst-Massage', c: '#6BA5D4', tips: ['Lacrosse Ball: Schulterblatt, Gesäß, Fußsohle – 60 Sek halten', 'Psoas-Release täglich – Ursache 70% aller Rückenschmerzen', 'Foam Rolling: 60 Sek pro Muskelgruppe'] },
      { h: 'Gelenke heilen', c: '#5CB875', tips: ['Kollagen + Vit C 30 Min VOR Training', 'Omega-3: natürliches Ibuprofen', 'Kurkuma + schwarzer Pfeffer 500mg täglich'] },
      { h: 'Rücken', c: '#E0BE7E', tips: ['Cat-Cow morgens 10 Wiederholungen', 'McGill Big 3 täglich: Bird Dog, Curl-Up, Side Plank', 'Dead Hangs 3x60 Sek – Wirbelsäule dekomprimieren'] },
    ] },
  { id: 'morning', ic: '🌅', label: 'Morgenroutine', color: '#E0BE7E',
    items: [
      { h: 'Die ersten 60 Min', c: '#E0BE7E', tips: ['Kein Snooze – sofort aufstehen', '500ml Wasser direkt nach Aufwachen', '10 Min Morgenlicht direkt (kein Glas)', 'Kaltdusche 2–3 Min', 'Koffein erst nach 90 Min'] },
      { h: 'Niemals morgens', c: '#E16868', tips: ['❌ Social Media in der ersten Stunde', '❌ E-Mails sofort checken', '❌ News oder YouTube', '❌ Zuckerfrühstück'] },
    ] },
  { id: 'longevity', ic: '🌿', label: 'Longevity', color: '#5CB875',
    items: [
      { h: 'Tägliche Basics', c: '#5CB875', tips: ['Morgenlicht 10 Min direkt nach Aufwachen', 'Zone 2 Cardio 3–4x/Woche', 'Sauna 4x/Woche – Herzerkrankungen –50% (Studie)', 'Kein Sitzen über 90 Min am Stück'] },
      { h: 'Tracking', c: '#E0BE7E', tips: ['Blutbild jährlich: Testosteron, Vit D, Ferritin, CRP', 'HRV täglich messen – stärkste Gesundheitsmetrik', 'Oura Ring / Whoop für tägliche Körperdaten'] },
    ] },
  { id: 'height', ic: '📏', label: 'Height Maxxing', color: '#9B82C9',
    items: [
      { h: 'Training', c: '#5CB875', tips: ['Sprinting: GH +700% – stärkster natürlicher Stimulus', 'Dead Hangs täglich 3x60 Sek', 'Schwimmen 2–3x/Woche', 'Kein schweres Heben vor 18 Jahren!'] },
      { h: 'Supps & Ernährung', c: '#9B82C9', tips: ['Vitamin D 5000 IE + Zink 15mg', 'L-Arginin 2–3g nüchtern', 'GABA 3–5g vor Schlafen: GH +400% in Studien', 'Calcium 1000mg täglich'] },
      { h: 'Haltung', c: '#5CB875', tips: ['Aufrechte Haltung = sofort 2–5cm sichtbar mehr', 'Hüftbeuger täglich dehnen – 60 Sek/Seite', 'Core täglich 10 Min: Plank, Bird Dog'] },
    ] },
  { id: 'mental', ic: '🧠', label: 'Mental Performance', color: '#6BA5D4',
    items: [
      { h: 'Fokus & Deep Work', c: '#6BA5D4', tips: ['2–4h nach Aufwachen: schärfstes kognitives Fenster', 'Pomodoro 25/5', 'Handy in anderen Raum = IQ +10 Punkte (Studie)', 'NSDR / Yoga Nidra nach Mittag'] },
      { h: 'Supplements', c: '#E0BE7E', tips: ["Lion's Mane 500–1000mg täglich", 'L-Theanin 200mg + Koffein 100mg', 'Bacopa Monnieri 300mg abends', 'DHA Omega-3 täglich'] },
    ] },
];

const BODYFIX_QUICK = [
  { ic: '🦶', t: 'Plattfuß – Fußgewölbe kollabiert' },
  { ic: '🧍', t: 'Rundrücken – schlechte Haltung' },
  { ic: '🦵', t: 'Knieschmerzen beim Treppensteigen' },
  { ic: '💆', t: 'Chronische Nackenverspannungen' },
  { ic: '🔩', t: 'Unterer Rückenschmerz / LWS' },
  { ic: '🦴', t: 'Schulterblatt-Schmerzen' },
  { ic: '🤸', t: 'Eingeschränkte Hüftmobilität' },
  { ic: '👣', t: 'Achillessehnen-Schmerzen' },
  { ic: '🖐', t: 'Karpaltunnel / Handgelenk' },
  { ic: '🦷', t: 'Kieferverspannung / Zähneknirschen' },
];

// ─── ACHIEVEMENTS ─────────────────────────────────────
// chk() callbacks reference engine functions (getDiscState, getPlan…) that
// live in screens/fokus.js — safe because all are hoisted function declarations.
const ACH = [
  { id: 'h1',       name: 'Erste Quest',     desc: 'Erste Habit erledigt',     chk: () => STATE.day.habits.length >= 1 },
  { id: 'lv2',      name: 'Aufsteiger',      desc: 'Level 2 erreicht',         chk: () => getLvl(STATE.totalXP).l >= 2 },
  { id: 'xp500',    name: 'XP Jäger',        desc: '500 XP gesammelt',         chk: () => STATE.totalXP >= 500 },
  { id: 'xp2k',     name: 'XP Master',       desc: '2000 XP gesammelt',        chk: () => STATE.totalXP >= 2000 },
  { id: 'all3',     name: 'Allrounder',      desc: 'Alle 3 Kategorien erledigt', chk: () => { const c = getCats(); return c.body && c.mind && c.discipline; } },
  { id: 'water',    name: 'Hydration King',  desc: '3L Wasser getrunken',      chk: () => STATE.day.water >= 3000 },
  { id: 'sleep8',   name: 'Schlafmeister',   desc: '8+ Stunden geschlafen',    chk: () => !!getSleepHours() && parseFloat(getSleepHours()) >= 8 },
  { id: 'combo5',   name: 'Combo King',      desc: '5er Combo erreicht',       chk: () => COMBO.count >= 5 },
  { id: 'goals3',   name: 'Ziel-Verfolger',  desc: '3 Ziele eingetragen',      chk: () => (ls('los_ziele') || []).length >= 3 },
  { id: 'j7',       name: 'Tagebuch-Held',   desc: '7 Journal-Einträge',       chk: () => (ls('los_j_list') || []).length >= 7 },
  { id: 'lv5',      name: 'Elite-Status',    desc: 'Level 5 erreicht',         chk: () => getLvl(STATE.totalXP).l >= 5 },
  { id: 'bf1',      name: 'Self-Healer',     desc: 'Body Fix genutzt',         chk: () => !!(ls('los_bodyfix') || []).length },
  { id: 'streak3',  name: 'Disziplin · 3',   desc: '3 Tage 100% Streak',       chk: () => getDiscState().streak >= 3 },
  { id: 'streak7',  name: 'Disziplin · 7',   desc: '7 Tage 100% Streak',       chk: () => getDiscState().streak >= 7 },
  { id: 'streak30', name: 'Eisern · 30',     desc: '30 Tage 100% Streak',      chk: () => getDiscState().streak >= 30 },
  { id: 'vow1',     name: 'Iron Vow',        desc: 'Erste Vow gesetzt',        chk: () => (getDiscState().vows || []).length >= 1 },
  { id: 'planner1', name: 'Tagesplaner',     desc: 'KI-Tagesplan erstellt',    chk: () => !!(getPlan().blocks || []).length },
];

const ACH_IC = { h1: '⚡', lv2: '⭐', xp500: '💎', xp2k: '👑', all3: '🏆', water: '💧', sleep8: '😴', combo5: '🔥', goals3: '🎯', j7: '📖', lv5: '💥', bf1: '🔧', streak3: '🔥', streak7: '⚔', streak30: '👑', vow1: '⚜', planner1: '🗓' };
