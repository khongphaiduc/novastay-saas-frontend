import * as signalR from '@microsoft/signalr';
import { isTokenExpired, refreshToken } from '../utils/auth';
import { createPaymentConnectionManager } from './paymentConnectionManager';

const API_ROOT = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function getPaymentSession() {
    try {
        const account = JSON.parse(localStorage.getItem('ns_account') || 'null');
        return account?.accountId && ['BusinessOwner', 'Resident'].includes(account.accountType)
            ? { accountId: account.accountId, accountType: account.accountType } : null;
    } catch { return null; }
}

const manager = createPaymentConnectionManager({
    getSession: getPaymentSession,
    async getToken() {
        if (isTokenExpired()) return refreshToken();
        const account = JSON.parse(localStorage.getItem('ns_account') || '{}');
        return account.accessToken || '';
    },
    createConnection({ accessTokenFactory }) {
        return new signalR.HubConnectionBuilder()
            .withUrl(`${API_ROOT}/hubs/payments`, { accessTokenFactory, withCredentials: false })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .configureLogging(signalR.LogLevel.Warning)
            .build();
    },
    warn(message) { console.warn(message); },
});

export const startPaymentConnection = () => manager.start();
export const stopPaymentConnection = () => manager.stop();
export const onInvoicePaymentUpdated = callback => manager.subscribe(callback);
export const onPaymentConnectionStatus = callback => manager.subscribeStatus(callback);
export const getPaymentConnectionState = () => manager.getState();