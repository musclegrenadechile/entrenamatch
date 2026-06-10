/**
 * Run: node functions/betaBotsScheduling.test.js
 */

const assert = require('assert');
const {
  getChileHour,
  isPeakHour,
  sameCityRegion,
  pickCityMate,
  liveRollThreshold,
  resolveBatchSize,
} = require('./betaBotsScheduling');

const BOTS = [
  { uid: 'beta_bot_01', city: 'Viña del Mar' },
  { uid: 'beta_bot_12', city: 'Reñaca' },
  { uid: 'beta_bot_02', city: 'Santiago' },
];

assert.strictEqual(sameCityRegion('Viña del Mar', 'Reñaca'), true);
assert.strictEqual(sameCityRegion('Viña del Mar', 'Santiago'), false);
assert.strictEqual(isPeakHour(7), true);
assert.strictEqual(isPeakHour(14), false);
assert.strictEqual(liveRollThreshold(7, 0), 0.32);
assert.strictEqual(liveRollThreshold(14, 0), 0.14);
assert.strictEqual(liveRollThreshold(20, 4), -1);
assert.strictEqual(resolveBatchSize({ batchSize: 3 }, 7), 4);
assert.strictEqual(resolveBatchSize({ batchSize: 3 }, 14), 3);

const mate = pickCityMate(BOTS[0], BOTS);
assert.ok(mate);
assert.notStrictEqual(mate.uid, BOTS[0].uid);
assert.ok(sameCityRegion(mate.city, BOTS[0].city));

const hour = getChileHour();
assert.ok(hour >= 0 && hour <= 23);

console.log('betaBotsScheduling.test.js OK', { hour });
