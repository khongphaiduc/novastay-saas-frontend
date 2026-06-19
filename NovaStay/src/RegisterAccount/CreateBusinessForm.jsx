import { useState } from 'react';
import './CreateBusinessForm.css'; // Nhúng file CSS vào đây
import { Eye, EyeOff } from 'lucide-react';

const confettiPieces = Array.from({ length: 25 }, (_, index) => {
  const seed = index + 1;
  const isGold = index % 10 > 2;

  return {
    id: `confetti-${index}`,
    backgroundColor: isGold ? '#C19A6B' : '#F4EBD0',
    width: `${isGold ? 5 + (seed % 5) : 8 + (seed % 4)}px`,
    height: `${isGold ? 10 + (seed % 10) : 15 + (seed % 5)}px`,
    left: `${(seed * 37) % 100}%`,
    animation: `fall ${3 + (seed % 4)}s infinite ${(seed % 3) * 0.6}s`,
  };
});

const leafPieces = Array.from({ length: 14 }, (_, index) => {
  const seed = index + 1;
  const variant = index % 4;

  return {
    id: `leaf-${index}`,
    left: `${(seed * 29) % 100}%`,
    scale: 0.75 + (variant * 0.12),
    rotation: (seed * 27) % 360,
    opacity: 0.28 + (variant * 0.08),
    animation: `leafFall ${9 + (seed % 5)}s infinite ${(seed % 6) * 0.55}s linear`,
    leafClass: `leaf-piece leaf-piece-${variant + 1}`,
  };
});

const CreateBusinessForm = () => {
  const [businessType, setBusinessType] = useState('Khách sạn & Nhà nghỉ');
  const [businessName, setBusinessName] = useState('Khách sạn Phượng Hoàng');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword((isVisible) => !isVisible);
  };

  return (
    <div className="page-container">
      {/* Lớp lá bàng rơi */}
      {leafPieces.map(({ id, left, scale, rotation, opacity, animation, leafClass }) => (
        <span
          key={id}
          className={leafClass}
          style={{
            left,
            opacity,
            animation,
            '--leaf-scale': scale,
            '--leaf-rotation': `${rotation}deg`,
          }}
        />
      ))}

      {/* Hiển thị Confetti rơi ở nền */}
      {confettiPieces.map(({ id, ...style }) => (
        <div key={id} className="confetti-piece" style={{ ...style, top: '-12vh' }} />
      ))}

      <div className="form-wrapper">
        <div className="form-header">
          <div className="ornate-icon">
            <span>🏆</span>
            <span>🏨</span>
          </div>
          <h1 className="form-title">Hãy tạo doanh nghiệp của bạn</h1>
        </div>

        <form>
          <div className="input-group">
            <label htmlFor="businessType" className="input-label">Ngành hàng kinh doanh</label>
            <select
              id="businessType"
              className="classic-select"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            >
              <option value="Khách sạn & Nhà nghỉ">Khách sạn & Nhà nghỉ</option>
              <option value="Nhà hàng">Nhà hàng</option>
              <option value="Dịch vụ du lịch">Dịch vụ du lịch</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="businessName" className="input-label">Tên doanh nghiệp</label>
            <input
              type="text"
              id="businessName"
              className="classic-input"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ví dụ: Khách sạn Phượng Hoàng"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">Nhập mật khẩu</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={`classic-input password-input ${passwordError ? 'error' : ''}`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (e.target.value.length > 0 && e.target.value.length < 8) {
                    setPasswordError('Nhập mật khẩu (tối thiểu 8 ký tự)');
                  } else {
                    setPasswordError('');
                  }
                }}
                placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordError && <span className="error-message">{passwordError}</span>}
          </div>

          <p className="access-address">
            Địa chỉ truy cập: <span className="highlight">hotel.kiotviet.vn/{businessName.toLowerCase().replace(/\s+/g, '')}</span>
          </p>

          <button type="submit" className="submit-button">
            Tạo doanh nghiệp
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBusinessForm;
