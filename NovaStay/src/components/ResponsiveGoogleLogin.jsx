import { useEffect, useRef, useState } from 'react';
import { GoogleLogin, useGoogleOAuth } from '@react-oauth/google';

export default function ResponsiveGoogleLogin({ busy = false, ...props }) {
  const container = useRef(null);
  const [width, setWidth] = useState(200);
  const [slow, setSlow] = useState(false);
  const { scriptLoadedSuccessfully } = useGoogleOAuth();

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.min(400, Math.max(200, Math.floor(entry.contentRect.width))));
    });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (scriptLoadedSuccessfully) return;
    const timer = setTimeout(() => setSlow(true), 12000);
    return () => clearTimeout(timer);
  }, [scriptLoadedSuccessfully]);

  return (
    <div ref={container} className="auth-google" aria-busy={busy}>
      {scriptLoadedSuccessfully ? (
        <div className="auth-google-button" inert={busy}>
          <GoogleLogin {...props} width={width} />
        </div>
      ) : (
        <div className="auth-google-loading" role="status">
          {slow ? 'Chưa tải được Google. Hãy kiểm tra kết nối mạng rồi thử lại.' : 'Đang tải đăng nhập Google…'}
          {slow && <button type="button" onClick={() => window.location.reload()}>Tải lại trang</button>}
        </div>
      )}
      {busy && <p role="status" className="auth-google-status">Đang xử lý đăng nhập, vui lòng chờ…</p>}
    </div>
  );
}
