/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { startPaymentConnection, stopPaymentConnection, onPaymentConnectionStatus, onInvoicePaymentUpdated, getPaymentSession } from '../services/paymentSignalR';
import { CheckCircle2, X } from 'lucide-react';

const PaymentSignalRContext = createContext({ connectionStatus: 'disconnected', reconnect: () => {}, lastPaymentEvent: null });

export function PaymentSuccessPopup({ notification, onClose }) {
    const panel = useRef(null);
    useEffect(() => {
        const previous = document.activeElement;
        panel.current?.querySelector('button')?.focus();
        const keyboard = event => {
            if (event.key === 'Escape') onClose();
            if (event.key === 'Tab') {
                const buttons = panel.current?.querySelectorAll('button');
                if (!buttons?.length) return;
                const first = buttons[0], last = buttons[buttons.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
        };
        document.addEventListener('keydown', keyboard);
        return () => { document.removeEventListener('keydown', keyboard); previous?.focus?.(); };
    }, [onClose]);
    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4">
            <section ref={panel} role="alertdialog" aria-modal="true" aria-labelledby="payment-success-title" aria-describedby="payment-success-description"
                className="relative w-full max-w-md rounded-2xl border border-emerald-400/40 bg-[#11111A] p-7 text-center text-white shadow-2xl">
                <button type="button" onClick={onClose} aria-label="Đóng thông báo thanh toán" className="absolute right-3 top-3 rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
                <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-400" />
                <h2 id="payment-success-title" className="text-xl font-bold">Thanh toán thành công!</h2>
                <p id="payment-success-description" className="mt-3 text-sm leading-6 text-gray-300">{notification.owner
                    ? 'Đã nhận thanh toán. Phiếu thu đã được quyết toán và công nợ đã được cập nhật.'
                    : 'Thanh toán hóa đơn của bạn đã được xác nhận. Bạn không cần chuyển khoản thêm.'}</p>
                {notification.paidAt && <p className="mt-3 text-xs text-gray-400">{new Date(notification.paidAt).toLocaleString('vi-VN')}</p>}
                <button type="button" onClick={onClose} className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-3 font-bold text-black hover:bg-emerald-400">Đã hiểu</button>
            </section>
        </div>, document.body,
    );
}

export function PaymentSignalRProvider({ children }) {
    const [status, setStatus] = useState('disconnected');
    const [notification, setNotification] = useState(null);
    const [lastPaymentEvent, setLastPaymentEvent] = useState(null);
    const sessionRef = useRef(null);
    const dismiss = useCallback(() => setNotification(null), []);
    const tryConnect = useCallback(() => {
        const session = getPaymentSession();
        const identity = session ? `${session.accountId}:${session.accountType}` : null;
        if (sessionRef.current !== identity) {
            sessionRef.current = identity;
            setNotification(null); setLastPaymentEvent(null);
        }
        startPaymentConnection().catch(() => {});
    }, []);
    useEffect(() => {
        const unsubscribeStatus = onPaymentConnectionStatus(setStatus);
        const unsubscribePayment = onInvoicePaymentUpdated(event => {
            if (!event || event.isReconnect || event.status !== 'Paid') return;
            setLastPaymentEvent(event);
            setNotification({ ...event, owner: getPaymentSession()?.accountType === 'BusinessOwner' });
        });
        const handleStorage = event => { if (!event || event.key === 'ns_account') tryConnect(); };
        const handleVisibility = () => { if (document.visibilityState === 'visible') tryConnect(); };
        window.addEventListener('storage', handleStorage);
        window.addEventListener('focus', tryConnect);
        document.addEventListener('visibilitychange', handleVisibility);
        // Detect same-tab login/logout/account switches as well as failed initial connections.
        const interval = setInterval(tryConnect, 4000);
        tryConnect();
        return () => {
            clearInterval(interval); unsubscribeStatus(); unsubscribePayment();
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('focus', tryConnect);
            document.removeEventListener('visibilitychange', handleVisibility);
            stopPaymentConnection().catch(() => {});
        };
    }, [tryConnect]);
    return (
        <PaymentSignalRContext.Provider value={{ connectionStatus: status, reconnect: tryConnect, lastPaymentEvent }}>
            {children}
            {notification && <PaymentSuccessPopup notification={notification} onClose={dismiss} />}
        </PaymentSignalRContext.Provider>
    );
}

export function usePaymentSignalR() { return useContext(PaymentSignalRContext); }