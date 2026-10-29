import test from 'node:test';
import assert from 'node:assert/strict';
import { getPeriodReading, getPreviousReading, isRoomRecorded, validateReadings, loadAllPages } from './utilityReadings.js';

const meter = (overrides = {}) => ({ id: 'meter-1', serviceName: 'Điện', initialReading: 100, readings: [], ...overrides });

test('room without a meter cannot be marked recorded or saved', () => {
    assert.equal(isRoomRecorded([], '2026-10'), false);
    assert.match(validateReadings([], {}, '2026-10'), /tạo đồng hồ/);
});

test('first reading starts from the configured initial index and accepts decimal water usage', () => {
    assert.equal(getPreviousReading(meter(), '2026-10'), 100);
    assert.equal(validateReadings([meter()], { 'meter-1': '101.125' }, '2026-10'), '');
    assert.match(validateReadings([meter()], { 'meter-1': '99' }, '2026-10'), /nhỏ hơn số cũ/);
});

test('reject blank, malformed, infinite readings and invalid periods', () => {
    for (const value of ['', ' ', '12abc', 'Infinity', undefined]) {
        assert.notEqual(validateReadings([meter()], { 'meter-1': value }, '2026-10'), '');
    }
    for (const period of ['', '2026-00', '2026-13', '2026-1']) {
        assert.notEqual(validateReadings([meter()], { 'meter-1': 101 }, period), '');
    }
});

test('recorded state persists per billing period after loading readings again', () => {
    const reading = { billingPeriod: '2026-10', previousReading: 100, currentReading: 150 };
    const saved = meter({ latestReading: reading, readings: [reading] });
    assert.equal(isRoomRecorded([saved], '2026-10'), true);
    assert.equal(isRoomRecorded([saved], '2026-11'), false);
    assert.equal(getPreviousReading(saved, '2026-10'), 100);
    assert.equal(getPreviousReading(saved, '2026-11'), 150);
    assert.deepEqual(getPeriodReading(saved, '2026-10'), reading);
});

test('retry only validates unsaved meters after partial success', () => {
    const saved = meter({ readings: [{ billingPeriod: '2026-10', currentReading: 150 }] });
    const pending = meter({ id: 'meter-2', serviceName: 'Nước', initialReading: 5 });
    assert.equal(isRoomRecorded([saved, pending], '2026-10'), false);
    assert.equal(validateReadings([saved, pending], { 'meter-2': '6.5' }, '2026-10'), '');
});

test('backdating a new reading cannot corrupt an existing later period', () => {
    const newer = meter({ latestReading: { billingPeriod: '2026-11', currentReading: 150 } });
    assert.match(validateReadings([newer], { 'meter-1': 120 }, '2026-10'), /kỳ sau/);
});

test('all property and room pages are loaded', async () => {
    const calls = [];
    const result = await loadAllPages(async page => {
        calls.push(page);
        return { items: [page], hasNextPage: page < 3 };
    });
    assert.deepEqual(result, [1, 2, 3]);
    assert.deepEqual(calls, [1, 2, 3]);
});
