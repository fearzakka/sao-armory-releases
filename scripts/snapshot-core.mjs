import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// outputs/SAO-Armory/public/model.js
var require_model = __commonJS({
  "outputs/SAO-Armory/public/model.js"(exports, module) {
    (function(root) {
      "use strict";
      const clean = (s) => String(s ?? "").replace(/[§&][0-9a-fk-orx]/gi, "").replace(/<[^>]{1,80}>/g, "").trim();
      const norm = (s) => clean(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’']/g, " ");
      const classes = { guerrier: "Warrior", warrior: "Warrior", assassin: "Assassin", archer: "Archer", mage: "Mage", shaman: "Shaman", chaman: "Shaman", "martial artist": "Martial Artist", "artiste martial": "Martial Artist" };
      function knownClasses(values) {
        return [...new Set(values.map((value) => classes[norm(value).replace(/[_-]+/g, " ").replace(/^assassins$/, "assassin")]).filter(Boolean))];
      }
      function matchesClass(item2, selected) {
        if (!selected) return true;
        if (selected === "unknown-skill") return item2.category === "Skill" && !item2.classes.length;
        return item2.classes.includes(selected) || item2.category !== "Skill" && !item2.classes.length;
      }
      const categories = ["All", "Weapon", "Staff", "Helmet", "Chestplate", "Leggings", "Boots", "Amulet", "Ring", "Bracelet", "Gloves", "Artifact", "Off-hand", "Title", "Rune", "Skill", "Other"];
      const armorSlots = ["helmet", "chestplate", "leggings", "boots"];
      const slots = ["weapon", "offhand", "helmet", "chestplate", "leggings", "boots", "amulet", "left-ring", "right-ring", "bracelet", "gloves", "artifact-1", "artifact-2", "artifact-3", "title", "skill-1", "skill-2", "skill-3", "skill-4", "skill-5", "skill-6", "passive"];
      const labels = { title: "Title", weapon: "Main weapon", offhand: "Off-hand", helmet: "Helmet", chestplate: "Chestplate", leggings: "Leggings", boots: "Boots", amulet: "Amulet", "left-ring": "Left ring", "right-ring": "Right ring", bracelet: "Bracelet", gloves: "Gloves", "artifact-1": "Artifact I", "artifact-2": "Artifact II", "artifact-3": "Artifact III", "rune-1": "Rune I", "rune-2": "Rune II", "rune-3": "Rune III", "rune-4": "Rune IV", "skill-1": "Skill I", "skill-2": "Skill II", "skill-3": "Skill III", "skill-4": "Skill IV", "skill-5": "Skill V", "skill-6": "Ultimate", "passive": "Passive" };
      function category(i) {
        const n = norm(i.name), b = norm(i.baseItem), h = norm(i.categoryHint), s = i.equippedSlot || "";
        if (h === "title" || s === "title") return "Title";
        if (h === "skill") return "Skill";
        if (/^(offhand|off.hand|catalyst|off_catalyst|grimoire|shield)(_|$)/.test(norm(i.itemType))) return "Off-hand";
        if (/^(staff|wand)(_|$)/.test(norm(i.itemType))) return "Staff";
        if (/^(sword|dagger|axe|bow|crossbow|spear|hammer|gauntlet)(_|$)/.test(norm(i.itemType))) return "Weapon";
        if (s && slots.includes(s)) {
          if (s.startsWith("artifact")) return "Artifact";
          if (s.includes("ring")) return "Ring";
          return labels[s] === "Main weapon" ? "Weapon" : labels[s];
        }
        if (/\brune\b|runestone|pierre runique/.test(n)) return "Rune";
        if (/grimoire/.test(n) || /lantern|lanterne/.test(n) && !/staff|baton|sceptre/.test(n) && /class(?:e)?\s*:\s*(shaman|chaman)/.test(norm((i.lore || []).join(" ")))) return "Off-hand";
        const tests = [["Staff", /staff|baton|sceptre/], ["Helmet", /helmet|casque|heaume/], ["Chestplate", /chestplate|plastron|tunique|cuirasse/], ["Leggings", /leggings|jambieres|pantalon/], ["Boots", /boots|bottes|chaussures/], ["Gloves", /gloves|gants/], ["Bracelet", /bracelet/], ["Ring", /\bring\b|anneau|bague/], ["Amulet", /amulet|collier/], ["Off-hand", /shield|bouclier/], ["Weapon", /sword|sabre|epee|poignard|dagger|katana|hache|\baxe\b|\bbow\b|\barc\b/]];
        for (const [c, re] of tests) if (re.test(n)) return c;
        if (/artefact|artifact/.test(h)) return "Artifact";
        if (/amulette/.test(h)) return "Amulet";
        for (const [c, re] of tests) if (re.test(b)) return c;
        return "Other";
      }
      const statNames = [
        ["Skill critical chance", /^(skill crit(?:ical)?\.? chance|chance critique (?:de )?competence|chance de critique de competence)/],
        ["Skill critical damage", /^(skill crit(?:ical)?\.? damage|degats critique(?:s)? (?:de )?competence|puissance critique de competence)/],
        ["Critical chance", /^(crit(?:ical)?\.? chance|chance (?:de )?critique)/],
        ["Critical damage", /^(crit(?:ical)?\.? (?:damage|power)|degats critique|puissance critique)/],
        ["Health regeneration", /^(health regeneration|regeneration (?:de )?(?:sante|pv)|sante\/s)/],
        ["Mana regeneration", /^(mana regeneration|regeneration (?:de )?mana)/],
        ["Stamina regeneration", /^(stamina regeneration|regeneration (?:de )?stamina)/],
        ["Movement speed", /^(movement speed|move speed|vitesse de deplacement)/],
        ["Attack speed", /^(attack speed|vitesse d attaque)/],
        ["Attack damage", /^(attack damage|attack dmg\.?|degats d attaque)/],
        ["Physical damage", /^(physical damage|degats physiques)/],
        ["Magic damage", /^(magic(?:al)? damage|degats magiques)/],
        ["Skill damage", /^(skill damage|degats (?:de )?competence)/],
        ["Projectile damage", /^(projectile damage|degats (?:de )?projectiles)/],
        ["Damage reduction", /^(damage reduction|reduction (?:de |des )?degats)/],
        ["Ability haste", /^(ability haste|hate d aptitude|cooldown reduction|reduction (?:du |de )?temps de recharge)/],
        ["Bonus healing", /^(bonus healing|bonus (?:de |aux )?soins|soins bonus)/],
        ["Healing received", /^(healing received|soins recus)/],
        ["Life steal", /^(life ?steal|vol de vie)/],
        ["Block chance", /^(block chance|chance de blocage)/],
        ["Dodge", /^(dodge|evasion|esquive|chance d esquive)/],
        ["Health", /^(?:max )?(health|sante|pv)(?: max)?\b/],
        ["Defense", /^defen[sc]e/],
        ["Mana", /^(?:max )?mana(?: max)?/],
        ["Stamina", /^(?:max )?stamina(?: max)?/],
        ["Tenacity", /^tenacity|^tenacite/]
      ];
      function stat(line) {
        let s = norm(line).replace(/^[^a-z0-9+\-]+/, "");
        const prefix = s.match(/^([+\-]\d+(?:[.,]\d+)?)(%|\/s)?\s+(.+)$/);
        let name, value, unit = "";
        if (prefix) {
          name = prefix[3];
          value = Number(prefix[1].replace(",", "."));
          unit = prefix[2] || "";
        } else {
          const parts2 = s.match(/^(.+?)\s*:\s*([+\-]?\d+(?:[.,]\d+)?)(%|\/s)?\s*$/);
          if (!parts2) return null;
          name = parts2[1];
          value = Number(parts2[2].replace(",", "."));
          unit = parts2[3] || "";
        }
        const match = statNames.find(([, re]) => re.test(name));
        if (!match) return null;
        if (/regeneration/.test(match[0].toLowerCase()) || /\/s/.test(name)) unit = "/s";
        const canonicalName = unit === "/s" && ["Health", "Mana", "Stamina"].includes(match[0]) ? match[0] + " regeneration" : match[0];
        return { name: canonicalName, value, unit, line: clean(line) };
      }
      function enrich(raw) {
        const i = { ...raw, name: clean(raw.name), lore: (raw.lore || []).map(clean) };
        i.category = i.categoryOverride || category(i);
        i.classes = [];
        i.socketedRunes = ["Helmet", "Chestplate", "Leggings", "Boots"].includes(i.category) ? runeLines(i.lore) : [];
        const cls = i.lore.map(norm).find((l) => /class(?:e)?\s*:/.test(l));
        if (cls) {
          const c = cls.split(":").slice(1).join(":");
          i.classes = Object.keys(classes).filter((k) => c.includes(k)).map((k) => classes[k]);
          i.classes = [...new Set(i.classes)];
        }
        if (i.category === "Skill") {
          i.classes = knownClasses([...Array.isArray(i.skillClasses) ? i.skillClasses : [], i.details?.className || "", ...i.classes]);
          i.skillClasses = i.classes;
        }
        i.level = Number(i.lore.join("\n").match(/(?:minimum\s+level|niveau\s+minimum)\s*:\s*(\d+)/i)?.[1] || 0);
        i.twoHanded = i.lore.some((l) => /two.handed|deux mains/i.test(l));
        i.stats = [];
        i.set = null;
        i.conditional = [];
        let group = null, threshold = 0;
        for (const line of i.lore) {
          const n = norm(line);
          if (/\bset\b/.test(n) && !n.includes("reset")) {
            group = clean(line).replace(/^[^A-Za-zÀ-ÿ]+/, "");
            i.set = group;
            continue;
          }
          const t = line.match(/^\[(\d+)\]\s*(.*)/);
          if (t) {
            threshold = Number(t[1]);
            const v = stat(t[2]);
            i.conditional.push({ threshold, text: t[2], stat: v });
            continue;
          }
          if (group) {
            if (line) i.conditional.push({ threshold, text: line, stat: stat(line) });
            continue;
          }
          if (i.category !== "Skill") {
            const v = stat(line);
            if (v) i.stats.push(v);
          }
        }
        if (i.category === "Title") i.stats = (i.details?.stats || []).filter((s) => Number.isFinite(s.value)).map((s) => {
          const value = s.value, unit = s.unit || "", parsed = stat((s.name || s.key) + ": " + value + unit);
          return parsed || { name: clean(s.name || s.key), value, unit, line: clean(s.name || s.key) + ": " + (value >= 0 ? "+" : "") + value + unit };
        });
        return i;
      }
      function runeLines(lore) {
        const out = [];
        for (const line of lore || []) {
          const text2 = clean(line).replace(/^[^A-Za-zÀ-ÿ]+/u, ""), m = text2.match(/^rune(?:\s+\d+)?\s*\(\s*(.+?)\s*\)\s*$/i) || text2.match(/^rune(?:\s+\d+)?\s*:\s*(.+?)\s*$/i);
          if (!m) continue;
          const name = clean(m[1]);
          if (!name || /^(?:none|no rune|empty|free|vacant|aucune?|vide|libre|sans rune|emplacement libre|[-—])$/i.test(norm(name))) continue;
          out.push({ name });
        }
        return out;
      }
      function runeNames(item2) {
        return [...new Set([item2.name, ...Object.values(item2.translations || {}).map((t) => t.name)].map(norm))];
      }
      function buildRunes(build, items) {
        const map = new Map(items.map((i) => [i.id, i])), stones = items.filter((i) => i.category === "Rune"), out = [];
        for (const slot of armorSlots) {
          const armor = map.get(build.slots?.[slot]);
          if (!armor) continue;
          const sockets = runeLines(armor.lore);
          for (const [index, rune] of sockets.entries()) {
            const names = /* @__PURE__ */ new Set([norm(rune.name)]);
            for (const t of Object.values(armor.translations || {})) {
              const translated = runeLines(t.lore);
              if (translated.length === sockets.length) names.add(norm(translated[index].name));
            }
            const matches = stones.filter((i) => runeNames(i).some((n) => names.has(n)));
            out.push({ slot, index, armorId: armor.id, armorName: armor.name, name: rune.name, itemId: matches.length === 1 ? matches[0].id : null });
          }
        }
        return out;
      }
      function compatible(slot, item2) {
        const cat = item2.category;
        if (slot.startsWith("skill") || slot === "passive") return cat === "Skill";
        if (slot.startsWith("rune")) return false;
        if (slot.startsWith("artifact")) return cat === "Artifact";
        if (slot.includes("ring")) return cat === "Ring";
        if (slot === "weapon") return ["Weapon", "Staff"].includes(cat);
        if (slot === "offhand") return ["Weapon", "Staff", "Off-hand"].includes(cat);
        return labels[slot] === cat;
      }
      function summarize(build, items) {
        const map = new Map(items.map((i) => [i.id, i])), totals = {}, sets = {}, warnings = [], skills = [];
        for (const [slot, id] of Object.entries(build.slots || {})) {
          if (slot.startsWith("rune")) continue;
          const i = map.get(id);
          if (!i) continue;
          if (!compatible(slot, i)) warnings.push(`${i.name} does not match ${labels[slot] || slot}.`);
          if (i.classes.length && !i.classes.includes(build.class)) warnings.push(`${i.name} requires ${i.classes.join(" / ")}.`);
          if (i.level > Number(build.level || 0)) warnings.push(`${i.name} requires level ${i.level}.`);
          if (i.category === "Skill") {
            skills.push(i);
            continue;
          }
          if (i.set) {
            sets[i.set] ??= { count: 0, effects: i.conditional };
            sets[i.set].count++;
          }
          for (const s of i.stats) {
            const key = s.name + "|" + s.unit;
            totals[key] ??= { name: s.name, unit: s.unit, value: 0, sources: [] };
            totals[key].value += s.value;
            totals[key].sources.push(i.name);
          }
        }
        const main = map.get(build.slots?.weapon);
        if (main?.twoHanded && build.slots?.offhand) warnings.push("A two-handed main weapon conflicts with the off-hand slot.");
        if (Object.keys(sets).length) warnings.push("Set effects are listed separately and are not added to gear totals.");
        return { totals: Object.values(totals).map((s) => ({ ...s, value: Math.round(s.value * 1e4) / 1e4 })), sets, warnings: [...new Set(warnings)], skills, runes: buildRunes(build, items) };
      }
      function language(i) {
        const n = norm(i.name), lines = (i.lore || []).slice(0, (i.lore || []).findIndex((l2) => /auction house|hotel des ventes|LEFT ALT/i.test(l2)) < 0 ? void 0 : (i.lore || []).findIndex((l2) => /auction house|hotel des ventes|LEFT ALT/i.test(l2))), l = norm(lines.join(" "));
        const frName = /\b(casque|plastron|jambieres|bottes|gants|anneau|amulette|collier|capuche|epee|baton|lanterne|du|des|aux)\b|\bde la\b/.test(n), enName = /\b(helmet|chestplate|leggings|boots|gloves|ring|amulet|sword|staff|lantern|of the|of|the)\b/.test(n);
        if (frName && !enName) return "fr";
        if (enName && !frName) return "en";
        const fr = (l.match(/\b(classe|niveau minimum|sante|degats|chance critique|competence|vitesse|vous devez|cette rune|cet objet|permet|equipement|appliquee)\b/g) || []).length, en = (l.match(/\b(class|minimum level|health|damage|critical chance|movement speed|you must|this rune|this item|equipment|when applied|max mana|max stamina|allows)\b/g) || []).length;
        return fr > en ? "fr" : "en";
      }
      function languageQuality(i, lang) {
        const l = norm(i.lore.join(" "));
        return (language(i) === lang ? 5 : 0) + (lang === "fr" ? (l.match(/classe\s*:|niveau minimum|sante\s*:|degats|regeneration/g) || []).length : (l.match(/class\s*:|minimum level|health\s*:|damage|regeneration/g) || []).length);
      }
      function identity(raw) {
        const i = enrich(raw), base = (i.baseItem.includes(":") ? i.baseItem : "minecraft:" + i.baseItem).toLowerCase();
        if (i.category === "Title") return "title|" + (i.details?.titleId || norm(i.name));
        if (i.category === "Skill") return "skill|" + (i.details?.skillId || norm(i.name)) + "|" + (i.details?.level || 0);
        const model = Number(i.model) || 0;
        const values = i.stats.map((s) => s.name + ":" + s.value + ":" + s.unit).sort().join(";");
        return [base, model, !model ? i.itemKey || norm(i.name) : "", values, i.classes.slice().sort().join(","), i.level].join("|");
      }
      function localized(i, lang, autoTranslate = true) {
        const chosen = i.translations?.[lang] || i.translations?.en || i.translations?.fr;
        const out = chosen ? { ...enrich({ ...i, ...chosen }), id: i.id, languageShown: i.translations?.[lang] ? lang : i.translations?.en ? "en" : "fr", languageFallback: !i.translations?.[lang] } : i;
        if (lang === "en" && autoTranslate && !i.translations?.en && i.generatedEnglish) {
          const generated = i.generatedEnglish;
          return { ...out, name: generated.name, lore: generated.lore, nameRich: null, loreRich: null, autoTranslated: true, originalText: chosen || { name: i.name, lore: i.lore, nameRich: i.nameRich, loreRich: i.loreRich }, languageShown: "en", languageFallback: false };
        }
        return out;
      }
      function itemViewKey(i) {
        return JSON.stringify([i.id, i.name, i.category, i.classes, i.level, i.lore, i.stats, i.details, i.set, i.conditional, i.twoHanded, i.favorite, i.tooltipStyle, i.nameRich, i.loreRich, i.socketedRunes, i.source, i.autoTranslated]);
      }
      const api = { clean, norm, classes, knownClasses, matchesClass, categories, slots, armorSlots, labels, stat, enrich, compatible, summarize, runeLines, runeNames, buildRunes, itemViewKey, language, languageQuality, identity, localized };
      if (typeof module !== "undefined") module.exports = api;
      else root.Armory = api;
    })(typeof window === "undefined" ? globalThis : window);
  }
});

// outputs/SAO-Armory/catalogue.cjs
var require_catalogue = __commonJS({
  "outputs/SAO-Armory/catalogue.cjs"(exports, module) {
    var M = require_model();
    var crypto2 = __require("crypto");
    function runeAliases(records) {
      const parent = /* @__PURE__ */ new Map(), find = (n) => {
        if (!parent.has(n)) parent.set(n, n);
        if (parent.get(n) !== n) parent.set(n, find(parent.get(n)));
        return parent.get(n);
      }, link = (names) => {
        const roots = names.map((n) => find(M.norm(n))).sort();
        for (const r of roots) parent.set(r, roots[0]);
      };
      for (const raw of records) {
        const item2 = M.enrich(raw);
        if (item2.category === "Rune") link(M.runeNames(item2));
        if (!item2.socketedRunes.length) continue;
        const variants = [item2.lore, ...Object.values(item2.translations || {}).map((t) => t.lore)].map(M.runeLines).filter((r) => r.length === item2.socketedRunes.length);
        for (let n = 0; n < item2.socketedRunes.length; n++) link(variants.map((v) => v[n].name));
      }
      return find;
    }
    function merge(records) {
      const map = /* @__PURE__ */ new Map(), aliases = /* @__PURE__ */ new Map(), runeKey = runeAliases(records);
      for (const raw of records) {
        const item2 = M.enrich(raw), socketKey = item2.socketedRunes.length ? "|socketed:" + item2.socketedRunes.map((r) => runeKey(M.norm(r.name))).sort().join(";") : "", id = crypto2.createHash("sha256").update("armory-v2|" + M.identity(item2) + socketKey).digest("hex");
        aliases.set(item2.id, id);
        for (const alias of item2.aliases || []) aliases.set(alias, id);
        const old = map.get(id);
        const translations = { ...old?.translations, ...item2.translations };
        const lang = M.language(item2);
        const candidate = { name: item2.name, lore: item2.lore, nameRich: item2.nameRich, loreRich: item2.loreRich, tooltipStyle: item2.tooltipStyle };
        const current = translations[lang];
        if (!current || M.languageQuality(candidate, lang) >= M.languageQuality(current, lang)) translations[lang] = candidate;
        const out = { ...old, ...item2, id, readerId: item2.readerId || item2.id, translations, firstSeen: Math.min(old?.firstSeen || Infinity, item2.firstSeen || Date.now()), lastSeen: Math.max(old?.lastSeen || 0, item2.lastSeen || 0), favorite: !!(old?.favorite || item2.favorite), categoryOverride: item2.categoryOverride || old?.categoryOverride || null, aliases: [.../* @__PURE__ */ new Set([...old?.aliases || [], ...item2.aliases || [], item2.id])].filter((x) => x !== id).slice(-40) };
        if (item2.category === "Skill") out.skillClasses = M.knownClasses([...old?.skillClasses || [], ...old?.classes || [], ...item2.classes]);
        const en = translations.en || translations.fr;
        Object.assign(out, M.enrich({ ...out, ...en }));
        map.set(id, out);
      }
      return { items: [...map.values()], aliases };
    }
    function remap(db, aliases) {
      const convert = (id) => aliases.get(id) || id;
      for (const build of db.builds || []) for (const slot of Object.keys(build.slots || {})) build.slots[slot] = convert(build.slots[slot]);
      for (const character of [db.character, ...db.inspections || []]) {
        for (const slot of Object.keys(character?.equipment || {})) character.equipment[slot] = convert(character.equipment[slot]);
        if (character?.skills) character.skills = [...new Set(character.skills.map(convert))];
        if (character?.title) character.title = convert(character.title);
        if (character?.titles) character.titles = [...new Set(character.titles.map(convert))];
      }
    }
    function recordInspections(db, records) {
      const saved = new Map((db.inspections || []).map((p) => [p.uuid, p]));
      for (const raw of (Array.isArray(records) ? records : []).slice(0, 100)) {
        if (!raw || !/^([a-f0-9]{8}-)([a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(raw.uuid) || !raw.equipmentLoaded || !raw.name) continue;
        const receivedAt = Number(raw.receivedAt);
        if (!Number.isFinite(receivedAt) || receivedAt <= 0 || receivedAt <= (saved.get(raw.uuid)?.receivedAt || 0)) continue;
        const equipment = {};
        for (const [slot, id] of Object.entries(raw.equipment || {})) if (M.slots.includes(slot) && /^[a-f0-9]{64}$/.test(id)) equipment[slot] = id;
        const stats = (Array.isArray(raw.stats) ? raw.stats : []).slice(0, 64).map((s) => ({ name: String(s.name || "").slice(0, 200), value: String(s.value ?? "").slice(0, 100) }));
        saved.set(raw.uuid, { uuid: raw.uuid, name: String(raw.name).slice(0, 80), class: String(raw.class || "").slice(0, 80), level: String(raw.level || "").slice(0, 20), receivedAt, inspected: true, equipmentLoaded: true, equipment, stats });
      }
      db.inspections = [...saved.values()].sort((a, b) => b.receivedAt - a.receivedAt).slice(0, 100);
    }
    function migrate(db) {
      const merged = merge(db.items);
      db.items = merged.items;
      remap(db, merged.aliases);
      for (const build of db.builds || []) for (const slot of Object.keys(build.slots || {})) if (slot.startsWith("rune")) delete build.slots[slot];
      db.schema = 3;
      return merged.aliases;
    }
    module.exports = { merge, remap, migrate, recordInspections };
  }
});

// outputs/SAO-Armory/guild-protocol.mjs
var import_catalogue = __toESM(require_catalogue(), 1);
var import_model = __toESM(require_model(), 1);
var Fault = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
};
var bad = (message) => {
  throw new Fault(400, message);
};
var text = (value, max = 200) => String(value ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").slice(0, max);
function integer(value, min, max) {
  if (!Number.isInteger(value) || value < min || value > max) bad("Number outside the allowed range");
  return value;
}
function point(p) {
  if (!p || !["x", "y", "z"].every((k) => Number.isFinite(p[k]) && Math.abs(p[k]) <= 3e7)) bad("Invalid position");
  return Object.fromEntries(["x", "y", "z"].map((k) => [k, Math.round(p[k] * 100) / 100]));
}
function runs(rows) {
  return (Array.isArray(rows) ? rows : []).slice(0, 100).map((r) => ({ text: text(r.text, 1e3), color: /^#[a-f0-9]{6}$/i.test(r.color) ? r.color : "#aaaaaa", bold: !!r.bold, italic: !!r.italic, font: /^[a-z0-9_.:-]+$/i.test(r.font) ? r.font : "minecraft:default" }));
}
function tooltip(raw) {
  const lore = (Array.isArray(raw.lore) ? raw.lore : []).slice(0, 100).map((l) => text(l, 1e3));
  const footer = lore.findIndex((l) => /auction house|h[oô]tel des ventes|LEFT ALT/i.test(l));
  const length = footer < 0 ? lore.length : footer;
  return { name: text(raw.name, 200), nameRich: runs(raw.nameRich), lore: lore.slice(0, length), loreRich: (Array.isArray(raw.loreRich) ? raw.loreRich : []).slice(0, length).map(runs), tooltipStyle: /^[a-z0-9_:/.-]+$/i.test(raw.tooltipStyle) ? raw.tooltipStyle : void 0 };
}
function item(raw) {
  if (!raw || typeof raw !== "object" || !raw.name) bad("An item needs a name");
  const value = { ...tooltip(raw), baseItem: text(raw.baseItem || "minecraft:air", 120), model: integer(Number(raw.model) || 0, 0, 2147483647), itemType: text(raw.itemType, 200), itemKey: text(raw.itemKey, 200), marketKey: text(raw.marketKey, 200), categoryHint: text(raw.categoryHint, 40) };
  if (!/^[a-z0-9_:./-]+$/i.test(value.baseItem)) bad("Invalid item material");
  if (raw.details && typeof raw.details === "object") value.details = Object.fromEntries(["titleId", "skillId", "level", "class"].filter((k) => ["string", "number"].includes(typeof raw.details[k])).map((k) => [k, typeof raw.details[k] === "string" ? text(raw.details[k]) : raw.details[k]]));
  if (raw.categoryHint?.toLowerCase() === "skill") value.skillClasses = import_model.default.knownClasses([...Array.isArray(raw.skillClasses) ? raw.skillClasses : [], ...Array.isArray(raw.classes) ? raw.classes : [], raw.details?.className || ""]);
  if (raw.categoryHint?.toLowerCase() === "title" && Array.isArray(raw.details?.stats)) value.details.stats = raw.details.stats.slice(0, 64).filter((s) => Number.isFinite(s.value) && Math.abs(s.value) <= 1e9).map((s) => ({ name: text(s.name || s.key, 100), value: s.value, unit: text(s.unit, 10) }));
  value.translations = {};
  for (const lang of ["en", "fr"]) if (raw.translations?.[lang]) value.translations[lang] = tooltip(raw.translations[lang]);
  if (!value.lore.length && !Object.values(value.translations).some((t) => t.lore.length)) bad("Items without observed details are not shared");
  const merged = import_catalogue.default.merge([{ ...value, id: "capture", firstSeen: 1, lastSeen: 1 }]).items[0];
  value.translations = Object.fromEntries(Object.entries(merged.translations || {}).filter(([k]) => ["en", "fr"].includes(k)).map(([k, v]) => [k, tooltip(v)]));
  return { id: merged.id, data: value };
}
function mergeItem(old, incoming) {
  const merged = import_catalogue.default.merge([{ ...old, id: "old", firstSeen: 1, lastSeen: 1 }, { ...incoming, id: "new", firstSeen: 1, lastSeen: 1 }]).items[0];
  return item(merged).data;
}
function merchant(raw) {
  if (!raw || !raw.stationId || !raw.name) bad("Invalid merchant");
  const value = { stationId: text(raw.stationId), name: text(raw.name), shopName: text(raw.shopName), world: text(raw.world), floor: integer(raw.floor, 0, 3), position: point(raw.position), locationSource: text(raw.locationSource, 60), markerId: raw.markerId ? text(raw.markerId) : null, hasBuy: raw.hasBuy !== false, hasSell: raw.hasSell !== false, tabs: {} };
  for (const tab of ["buy", "sell"]) if (raw.tabs?.[tab]) {
    const saved = raw.tabs[tab], pages = {};
    for (const [key, page] of Object.entries(saved.pages || {}).slice(0, 100)) {
      if (!/^\d{1,3}$/.test(key)) continue;
      const offers = /* @__PURE__ */ Object.create(null);
      for (const [id, o] of Object.entries(page.offers || {}).slice(0, 300)) {
        if (!Number.isFinite(o.price) || o.price < 0 || o.price > 1e12) bad("Invalid merchant price");
        offers[text(id)] = { id: text(id), name: text(o.name), capturedName: text(o.capturedName), itemId: /^[a-f0-9]{64}$/.test(o.itemId) ? o.itemId : null, marketKey: text(o.marketKey), price: o.price, stock: Number.isFinite(o.stock) ? o.stock : -1, quota: Number.isFinite(o.quota) ? o.quota : -1, rarity: text(o.rarity) };
      }
      pages[key] = { offers };
    }
    value.tabs[tab] = { pageCount: integer(saved.pageCount || 1, 1, 100), pages };
  }
  return value;
}
function mergeMerchant(old, next) {
  const tabs = { ...old?.tabs };
  for (const [name, tab] of Object.entries(next.tabs)) {
    tabs[name] = tab.pageCount === 1 ? tab : { ...tab, pages: { ...tabs[name]?.pages, ...tab.pages } };
  }
  return { ...old, ...next, tabs };
}

// outputs/SAO-Armory/snapshot-format.mjs
var parts = "0123456789abcdef".split("");
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().filter((k) => value[k] !== void 0).map((k) => [k, canonical(value[k])]));
  return value;
}
var stable = (value) => JSON.stringify(canonical(value));
function publicRecord(raw) {
  if (!raw || !["item", "merchant"].includes(raw.kind) || !/^[a-f0-9]{64}$/.test(raw.id || "") || !Number.isSafeInteger(raw.revision) || raw.revision < 0) throw Error("Invalid shared snapshot record");
  const data = raw.kind === "item" ? item(raw.data).data : merchant(raw.data);
  return { kind: raw.kind, id: raw.id, data, revision: raw.revision, updated: Number(raw.updated) || 0, deleted: raw.deleted ? 1 : 0 };
}
function mergePart(previous, changes, icons = {}) {
  const records = new Map((previous?.records || []).map((r) => [r.kind + ":" + r.id, publicRecord(r)]));
  for (const raw of changes) {
    const next = publicRecord(raw), key = next.kind + ":" + next.id, old = records.get(key);
    if (old && !next.deleted) next.data = next.kind === "item" ? mergeItem(old.data, next.data) : merchant(mergeMerchant(old.data, next.data));
    records.set(key, next);
  }
  return { schema: 1, records: [...records.values()].sort((a, b) => (a.kind + a.id).localeCompare(b.kind + b.id)), icons: { ...previous?.icons, ...icons } };
}
function manifest(value, repo) {
  if (!value || value.schema !== 1 || !/^snapshot-[a-f0-9]{32}$/.test(value.id || "") || !Number.isSafeInteger(value.revision) || !Array.isArray(value.parts) || value.parts.length !== 16) throw Error("Invalid shared library manifest");
  const found = /* @__PURE__ */ new Set();
  for (const p of value.parts) {
    if (!parts.includes(p.key) || found.has(p.key) || !assetUrl(p.url, repo) || !/^[a-f0-9]{64}$/.test(p.sha256) || !Number.isInteger(p.bytes) || p.bytes < 1 || p.bytes > 4194304) throw Error("Invalid shared library part");
    found.add(p.key);
  }
  return value;
}
function assetUrl(url, repo) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.host === "github.com" && !u.username && !u.password && !u.search && !u.hash && u.pathname.startsWith("/" + repo + "/releases/download/") && !u.pathname.includes("..");
  } catch {
    return false;
  }
}
export {
  assetUrl,
  canonical,
  manifest,
  mergePart,
  parts,
  publicRecord,
  stable
};
