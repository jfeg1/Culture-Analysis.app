// Run with: node tests/test.js
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const grab = (a, b) => html.split(a)[1].split(b)[0];
const Core = new Function(grab('/*CORE-START*/', '/*CORE-END*/').replace("if (typeof module !== 'undefined') module.exports = Core;", '') + '; return Core;')();
const exampleProject = new Function('Core', grab('/*EXAMPLE-START*/', '/*EXAMPLE-END*/') + '; return exampleProject;')(Core);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, a + ' != ' + b);

// median
assert.strictEqual(Core.median([3, 1, 2]), 2);
assert.strictEqual(Core.median([4, 2, 2, 4]), 3);
assert.strictEqual(Core.median([]), null);

// classify: Split is checked first, then Agreed, else Scattered
const g = r => Core.classify(r).group;
assert.strictEqual(g([4]), 'Too few');
assert.strictEqual(g([3, 3, 4, 4, 5]), 'Agreed');
assert.strictEqual(g([2, 4, 4, 4, 4]), 'Agreed');      // one outlier in five = 20% (< 25%), and 80% within one point
assert.strictEqual(g([2, 4, 4, 4]), 'Split');          // one outlier in four = 25% on its own side of a 2-point gap
assert.strictEqual(g([2, 2, 4, 4]), 'Split');          // median 3 puts everyone "within one", so Split must be checked first
assert.strictEqual(g([1, 1, 5]), 'Split');
assert.strictEqual(g([1, 2, 3, 4, 5]), 'Scattered');   // no 2-point gap, 60% within one point
assert.strictEqual(g([1, 2, 3, 4, 5, 3]), 'Scattered');
assert.strictEqual(Core.classify([1, 2, 3, 4, 5], { agreePct: 60 }).group, 'Agreed'); // settings are honoured
near(Core.classify([1, 2, 3, 4, 5]).withinPct, 60);

// starter bank: 26 items, 19 with a personal version
let p = Core.blank();
assert.strictEqual(p.items.length, 26);
assert.strictEqual(p.items.filter(it => it.self).length, 19);
assert.strictEqual(new Set(p.items.map(it => it.id)).size, 26);

// team answer: median unless the workshop set a figure
p.respondents = [1, 2, 3, 4, 5].map(i => ({ id: 'r' + i, name: 'R' + i, free: {}, ratings: {} }));
[4, 4, 5, 4, 3].forEach((v, i) => { p.respondents[i].ratings.m2 = v; });
const m2 = p.items.find(it => it.id === 'm2');
assert.strictEqual(Core.teamAnswer(p, m2), 4);
assert.strictEqual(Core.itemStats(p, m2).group, 'Agreed');
assert.deepStrictEqual(Core.itemStats(p, m2).counts, [0, 0, 1, 3, 1]);
p.workshop.m2 = { decision: 'accept', answer: 4.5 };
assert.strictEqual(Core.teamAnswer(p, m2), 4.5);

// form 4: needs accepted + ticked + a personal version + ratings
assert.strictEqual(Core.form4Items(p).length, 0);
p.workshop.m2.form4 = true;
assert.strictEqual(Core.form4Items(p).length, 1);
p.workshop.m1 = { decision: 'accept', form4: true };   // M1 has no personal version
p.respondents[0].ratings.m1 = 3; p.respondents[1].ratings.m1 = 3;
assert.strictEqual(Core.form4Items(p).length, 1);
p.workshop.m2.decision = 'none';
assert.strictEqual(Core.form4Items(p).length, 0);

// consonance: the worked example from the forms document = 51 of 60 = 85%
p = Core.blank();
p.respondents = [{ id: 'r1', name: 'A', free: {}, ratings: {} }, { id: 'r2', name: 'B', free: {}, ratings: {} }];
const fifteen = p.items.filter(it => it.self).slice(0, 15);
fifteen.forEach(it => { p.respondents[0].ratings[it.id] = 3; p.respondents[1].ratings[it.id] = 3; p.workshop[it.id] = { decision: 'accept', form4: true }; });
assert.strictEqual(Core.form4Items(p).length, 15);
const cand = { id: 'p1', name: 'C', ratings: {} };
fifteen.forEach((it, i) => { cand.ratings[it.id] = 3 + (i < 8 ? 0 : i < 13 ? 1 : 2); });
let c = Core.consonance(p, cand);
assert.strictEqual(c.total, 51); assert.strictEqual(c.max, 60); near(c.pct, 85);
assert.deepStrictEqual(c.bands, ['High']);
assert.strictEqual(c.gaps[0].gap, 2);                  // largest gaps first
delete cand.ratings[fifteen[14].id];                   // unanswered items are left out, not counted as zero
c = Core.consonance(p, cand);
assert.strictEqual(c.n, 14); assert.strictEqual(c.missing, 1); near(c.pct, 49 / 56 * 100);
assert.strictEqual(Core.consonance(p, { id: 'x', ratings: {} }).pct, null);

// bands overlap on purpose
assert.deepStrictEqual(Core.bandsFor(30), ['Low']);
assert.deepStrictEqual(Core.bandsFor(45), ['Low', 'Mid']);
assert.deepStrictEqual(Core.bandsFor(60), ['Mid']);
assert.deepStrictEqual(Core.bandsFor(70), ['Mid', 'High']);
assert.deepStrictEqual(Core.bandsFor(90), ['High']);
assert.deepStrictEqual(Core.bandsFor(null), []);

// free-list tally counts people, not mentions, and ignores case
p = Core.blank();
p.respondents = [
  { id: 'r1', name: 'A', free: { values: 'Speed\ncandour\nspeed' }, ratings: {} },
  { id: 'r2', name: 'B', free: { values: 'speed;  customers  first' }, ratings: {} },
];
let t = Core.freeTally(p).values;
assert.deepStrictEqual(t.map(x => [x.phrase, x.count]), [['Speed', 2], ['candour', 1], ['customers first', 1]]);
const added = Core.addItem(p, 'Values', 'Speed', 'free list');
assert.strictEqual(added.code, 'A1'); assert.strictEqual(p.items.length, 27); assert.strictEqual(Core.addItem(p).code, 'A2');

// respondent files carry only that person's answers
p.respondents[0].ratings.m1 = 5; p.respondents[1].ratings.m1 = 2;
let pk = Core.respondentPacket(p, 'r2', 1);
assert.strictEqual(pk.respondents.length, 1); assert.strictEqual(pk.items.length, 0);
assert.ok(!JSON.stringify(pk).includes('candour'));
pk = Core.normalize(JSON.parse(JSON.stringify(Core.respondentPacket(p, 'r2', 2))));
assert.strictEqual(pk.items.length, 28); assert.ok(!('self' in pk.items[0]));
pk.respondents[0].ratings.m2 = 4;
assert.ok(Core.mergeResponse(p, Core.respondentResponse(pk)));
assert.strictEqual(p.respondents[1].ratings.m2, 4); assert.strictEqual(p.respondents[0].ratings.m1, 5);
assert.ok(!Core.mergeResponse(p, Object.assign(Core.respondentResponse(pk), { projectId: 'other' })));
// a round-1 response merges lists and leaves ratings alone
let pk1 = Core.normalize(JSON.parse(JSON.stringify(Core.respondentPacket(p, 'r1', 1))));
pk1.respondents[0].free.norms = 'ask early'; pk1.respondents[0].ratings.m1 = 1;
assert.ok(Core.mergeResponse(p, Core.respondentResponse(pk1)));
assert.strictEqual(p.respondents[0].free.norms, 'ask early'); assert.strictEqual(p.respondents[0].ratings.m1, 5);

// a candidate's file never contains the team's answers or wording
p = exampleProject();
assert.ok(Core.form4Items(p).length >= 5);
let pp = Core.personPacket(p, 'p1'), txt = JSON.stringify(pp);
assert.ok(!('respondents' in pp) && !('workshop' in pp));
assert.ok(pp.items.every(it => Object.keys(it).sort().join() === 'id,self'));
assert.ok(!txt.includes('Around here') && !txt.includes('Founder A'));
pp = Core.normalize(JSON.parse(txt));
pp.people[0].ratings[pp.items[0].id] = 1;
assert.ok(Core.mergePerson(p, Core.personResponse(pp)));
assert.strictEqual(p.people[0].ratings[pp.items[0].id], 1);

// the example shows all three agreement groups and a scored candidate
p = exampleProject();
const groups = p.items.map(it => Core.itemStats(p, it).group);
['Agreed', 'Split', 'Scattered'].forEach(x => assert.ok(groups.includes(x), 'example has ' + x));
c = Core.consonance(p, p.people[0]);
assert.ok(c.pct > 0 && c.pct <= 100 && c.missing === 0);

// normalize fills gaps in older or partial files
const n = Core.normalize({ kind: 'oca-project', respondents: [{ id: 'a' }] });
assert.strictEqual(n.items.length, 26); assert.deepStrictEqual(n.respondents[0].ratings, {}); assert.strictEqual(n.settings.agreePct, 80);

console.log('All tests passed.');
