// Connection lifecycle separated from browser globals for login/reconnect race tests.
export function createPaymentConnectionManager({ createConnection, getSession, getToken, warn = () => {} }) {
    let connection = null, identity = null, pendingIdentity = null, pending = null;
    let generation = 0, status = 'disconnected';
    const seen = new Set(), listeners = new Set(), statusListeners = new Set();
    const key = () => {
        const session = getSession();
        return session ? `${session.accountId.toLowerCase()}:${session.accountType}` : null;
    };
    function notify(state) {
        status = state;
        statusListeners.forEach(fn => { try { fn(state); } catch { warn('Payment status listener failed'); } });
    }
    async function dispatch(event) {
        await Promise.allSettled([...listeners].map(async fn => fn(event)));
    }
    async function stop() {
        generation++;
        const previous = connection;
        connection = null; identity = null; pendingIdentity = null; pending = null;
        seen.clear(); notify('disconnected');
        if (previous) { try { await previous.stop(); } catch { warn('Payment connection stop failed'); } }
    }
    function start() {
        const requested = key();
        if (!requested) return stop().then(() => null);
        if (pending && pendingIdentity === requested) return pending;
        if (connection && identity === requested && ['Connected', 'Reconnecting'].includes(connection.state))
            return Promise.resolve(connection);
        const previous = connection, version = ++generation;
        if (identity !== requested) seen.clear();
        connection = null; identity = null; pendingIdentity = requested;
        const work = (async () => {
            if (previous) { try { await previous.stop(); } catch { warn('Previous payment connection stop failed'); } }
            if (version !== generation || key() !== requested) return null;
            const current = createConnection({ accessTokenFactory: async () => {
                if (key() !== requested) throw new Error('Payment session changed');
                const token = await getToken();
                if (key() !== requested) throw new Error('Payment session changed');
                return token;
            } });
            connection = current; identity = requested;
            const active = () => current === connection && version === generation && key() === requested;
            current.on('InvoicePaymentUpdated', async event => {
                if (!active() || !event?.eventId || !event.invoiceId || event.status !== 'Paid' || seen.has(event.eventId)) return;
                seen.add(event.eventId);
                if (seen.size > 1000) seen.delete(seen.values().next().value);
                await dispatch(event);
            });
            current.onreconnecting(() => { if (active()) notify('reconnecting'); });
            current.onreconnected(async () => {
                if (!active()) return;
                notify('connected'); await dispatch({ isReconnect: true });
            });
            current.onclose(() => { if (active()) notify('disconnected'); });
            notify('connecting');
            try {
                await current.start();
                if (!active()) { await current.stop(); return null; }
                notify('connected'); await dispatch({ isReconnect: true });
                return current;
            } catch (error) {
                if (active()) { notify('error'); warn('Payment connection failed'); }
                throw error;
            }
        })();
        pending = work;
        work.finally(() => { if (pending === work) { pending = null; pendingIdentity = null; } }).catch(() => {});
        return work;
    }
    return {
        start, stop,
        subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
        subscribeStatus(fn) { statusListeners.add(fn); fn(status); return () => statusListeners.delete(fn); },
        getState() { return connection?.state || 'Disconnected'; },
    };
}
