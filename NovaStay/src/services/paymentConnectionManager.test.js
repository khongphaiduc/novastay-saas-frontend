import test from 'node:test';
import assert from 'node:assert/strict';
import { createPaymentConnectionManager } from './paymentConnectionManager.js';

const payment = { eventId: 'event-1', invoiceId: 'invoice-1', status: 'Paid', paymentSource: 'PayOS' };
function setup({ failFirst = false } = {}) {
    let session = { accountId: 'owner-a', accountType: 'BusinessOwner' };
    const connections = [], events = [], statuses = [];
    const manager = createPaymentConnectionManager({
        getSession: () => session, getToken: async () => 'test-only-token',
        createConnection(options) {
            const connection = {
                options, state: 'Disconnected', starts: 0, stops: 0, handlers: {}, fail: failFirst && connections.length === 0,
                on(name, handler) { this.handlers[name] = handler; },
                onreconnecting(handler) { this.reconnecting = handler; },
                onreconnected(handler) { this.reconnected = handler; },
                onclose(handler) { this.close = handler; },
                async start() { this.starts++; if (this.fail) throw Error('initial connection failed'); this.state = 'Connected'; },
                async stop() { this.stops++; this.state = 'Disconnected'; this.close?.(); },
                async emit(event) { await this.handlers.InvoicePaymentUpdated(event); },
            };
            connections.push(connection); return connection;
        },
    });
    manager.subscribe(event => events.push(event)); manager.subscribeStatus(state => statuses.push(state));
    return { manager, connections, events, statuses, setSession: value => { session = value; } };
}

test('concurrent starts share one connection and initial connect reloads billing data', async () => {
    const s = setup();
    const [first, second] = await Promise.all([s.manager.start(), s.manager.start()]);
    assert.equal(first, second); assert.equal(s.connections.length, 1); assert.equal(first.starts, 1);
    assert.deepEqual(s.events, [{ isReconnect: true }]);
});

test('switching accounts closes the old socket and rejects events from the previous user', async () => {
    const s = setup(); const old = await s.manager.start();
    s.setSession({ accountId: 'resident-b', accountType: 'Resident' });
    await old.emit(payment); assert.equal(s.events.filter(e => e.eventId).length, 0);
    const current = await s.manager.start();
    assert.equal(old.stops, 1); assert.notEqual(old, current);
    await old.emit(payment); await current.emit(payment);
    assert.equal(s.events.filter(e => e.eventId).length, 1);
    await assert.rejects(old.options.accessTokenFactory(), /session changed/);
});

test('only confirmed Paid events notify, and duplicate deliveries show one popup', async () => {
    const s = setup(); const connection = await s.manager.start();
    await connection.emit({ ...payment, status: 'Pending' });
    await connection.emit({ ...payment, status: 'NeedsReview' });
    await connection.emit(payment); await connection.emit(payment);
    assert.equal(s.events.filter(e => e.eventId).length, 1);
});

test('native reconnect refreshes state and does not call start again while reconnecting', async () => {
    const s = setup(); const connection = await s.manager.start();
    connection.state = 'Reconnecting'; connection.reconnecting();
    assert.equal(await s.manager.start(), connection); assert.equal(connection.starts, 1);
    connection.state = 'Connected'; await connection.reconnected();
    assert.equal(s.events.filter(e => e.isReconnect).length, 2);
});

test('a failed first connection can be retried', async () => {
    const s = setup({ failFirst: true });
    await assert.rejects(s.manager.start(), /initial connection failed/);
    assert.equal(s.statuses.at(-1), 'error');
    const next = await s.manager.start();
    assert.equal(next.state, 'Connected'); assert.equal(s.connections.length, 2);
});

test('stop during connection replacement cannot resurrect a socket', async () => {
    const s = setup(); const next = await s.manager.start();
    let release;
    next.state = 'Disconnected';
    next.stop = () => new Promise(resolve => { release = resolve; });
    const pending = s.manager.start(); await s.manager.stop(); release();
    assert.equal(await pending, null); assert.equal(s.manager.getState(), 'Disconnected');
});

test('logout drops its socket and no longer delivers events to the old session', async () => {
    const s = setup(); const connection = await s.manager.start();
    s.setSession(null); await s.manager.start(); await connection.emit(payment);
    assert.equal(connection.stops, 1); assert.equal(s.manager.getState(), 'Disconnected');
    assert.equal(s.events.filter(e => e.eventId).length, 0);
});
