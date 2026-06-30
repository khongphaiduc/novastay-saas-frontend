import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Image, FileText, DollarSign, AlertTriangle,
  Bell, Shield, Key, LogOut, Download, Droplet, Zap, Wifi
} from 'lucide-react';

export default function RoomResidentDashboard() {
  const [activeTab, setActiveTabState] = useState(() => {
    return localStorage.getItem('ns_active_tab_resident') || 'overview';
  });

  const setActiveTab = (tabName) => {
    setActiveTabState(tabName);
    localStorage.setItem('ns_active_tab_resident', tabName);
  };

  const navigate = useNavigate();

  const [residentData, setResidentData] = useState(() => {
    const accountData = localStorage.getItem('ns_account');
    if (accountData) {
      try {
        const parsed = JSON.parse(accountData);
        if (parsed.accountType === 'Resident') {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse ns_account', e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (!residentData) {
      navigate('/login/resident');
    }
  }, [residentData, navigate]);

  const handleLogout = async () => {
    try {
      const accountData = localStorage.getItem('ns_account');
      let refreshToken = '';
      let accessToken = '';
      if (accountData) {
        try {
          const parsed = JSON.parse(accountData);
          refreshToken = parsed.refreshToken || '';
          accessToken = parsed.accessToken || '';
        } catch (e) {
          console.warn('Failed to parse ns_account', e);
        }
      }

      const API_ROOT = import.meta.env.VITE_API_URL || '';
      await fetch(`${API_ROOT}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'accessToken': accessToken,
        },
        body: JSON.stringify({
          RefreshToken: refreshToken
        })
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('ns_account');
      localStorage.removeItem('ns_active_tab_resident');
      navigate('/');
    }
  };

  // Dữ liệu thực tế của phòng trọ cao cấp
  const residentInfo = {
    name: residentData?.name || residentData?.customerName || "NGUYỄN VĂN AN",
    room: residentData?.roomName || "Phòng 402 - Tầng 4",
    address: residentData?.address || "Tòa nhà The Luxury House - 123 Đường Láng, Đống Đa, Hà Nội",
    contractDate: residentData?.contractDate || "01/10/2025 - 01/10/2026",
    phone: residentData?.phone || residentData?.sdt || "0987.xxx.xxx"
  };

  const roomImages = [
    { url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80", title: "Không gian ngủ & Làm việc" },
    { url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80", title: "Khu vực bếp nấu ăn" },
    { url: "https://images.unsplash.com/photo-1620626011161-997c514473ae?auto=format&fit=crop&w=600&q=80", title: "Phòng vệ sinh khép kín" }
  ];

  const services = [
    { id: 1, name: "Tiền điện (Theo đồng hồ riêng)", price: "3.800 đ / kWh", status: "Áp dụng thực tế", icon: <Zap size={16} className="text-amber-400" /> },
    { id: 2, name: "Tiền nước sinh hoạt", price: "100.000 đ / người / tháng", status: "Cố định", icon: <Droplet size={16} className="text-blue-400" /> },
    { id: 3, name: "Combo Mạng Internet Wifi + Vệ sinh chung", price: "150.000 đ / phòng / tháng", status: "Cố định", icon: <Wifi size={16} className="text-purple-400" /> },
    { id: 4, name: "Dịch vụ giặt sấy đồ tại khu máy giặt chung", price: "20.000 đ / lượt", status: "Tùy chọn mua thêm", icon: <Key size={16} className="text-emerald-400" /> },
  ];

  const invoices = [
    { id: "HD-04-2026", month: "Tiền nhà + Dịch vụ Tháng 04/2026", amount: "5.450.000 đ", status: "Đã đóng", date: "05/04/2026" },
    { id: "HD-05-2026", month: "Tiền nhà + Dịch vụ Tháng 05/2026", amount: "5.620.000 đ", status: "Chờ thanh toán", date: "05/05/2026" },
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F5F7] font-sans antialiased flex selection:bg-[#E5C158] selection:text-black">

      {/* 1. SIDEBAR - THANH ĐIỀU HƯỚNG TỐI GIẢN */}
      <aside className="w-80 bg-[#1A1A1A] border-r border-[#E5C158]/10 flex flex-col justify-between p-8 sticky top-0 h-screen">
        <div>
          {/* Tên khu nhà trọ */}
          <div className="text-center pb-8 border-b border-[#E5C158]/10">
            <h1 className="text-xl font-bold tracking-[0.15em] text-[#E5C158]">LUXURY APARTMENT</h1>
            <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase mt-1 font-medium">Hệ Thống Phòng Trọ Cao Cấp</p>
          </div>

          {/* Thẻ Cư Dân Phòng Trọ */}
          <div className="mt-8 p-5 bg-[#222222] rounded-xl border border-[#E5C158]/10 text-center shadow-inner">
            <div className="w-14 h-14 mx-auto bg-[#E5C158]/10 border border-[#E5C158]/30 rounded-full flex items-center justify-center mb-3">
              <User size={24} className="text-[#E5C158]" />
            </div>
            <h3 className="text-base text-white font-semibold tracking-wide">{residentInfo.name}</h3>
            <p className="text-xs text-[#E5C158] font-medium tracking-wider mt-1 uppercase opacity-90">{residentInfo.room}</p>
            <p className="text-[11px] text-gray-400 mt-2 bg-black/40 py-1 px-3 rounded-md inline-block max-w-full truncate">{residentInfo.address}</p>
          </div>

          {/* Menu Điều Hướng Thực Tế */}
          <nav className="mt-8 space-y-1.5">
            {[
              { id: 'overview', label: 'Tổng quan phòng ở', icon: <Shield size={18} /> },
              { id: 'gallery', label: 'Hình ảnh phòng hiện tại', icon: <Image size={18} /> },
              { id: 'services', label: 'Bảng giá dịch vụ', icon: <Key size={18} /> },
              { id: 'contracts', label: 'Hợp đồng thuê nhà', icon: <FileText size={18} /> },
              { id: 'billing', label: 'Hóa đơn hàng tháng', icon: <DollarSign size={18} /> },
              { id: 'report', label: 'Báo hỏng đồ / Gửi sự cố', icon: <AlertTriangle size={18} /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 ${activeTab === item.id
                  ? 'bg-[#E5C158] text-black font-semibold shadow-lg shadow-[#E5C158]/10'
                  : 'text-gray-400 hover:bg-[#222222] hover:text-[#E5C158]'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Nút Đăng Xuất */}
        <div className="pt-6 border-t border-[#E5C158]/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-transparent border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/10 transition-all text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT - KHÔNG GIAN CHÍNH */}
      <main className="flex-1 p-12 overflow-y-auto max-w-6xl mx-auto w-full">

        {/* TOP BAR */}
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-[#E5C158]/10">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#E5C158] font-bold">Cổng Thông Tin Người Thuê Nhà</span>
            <h2 className="text-2xl font-semibold mt-1 text-white tracking-wide">Xin chào {residentInfo.name},</h2>
          </div>
          <div className="flex items-center space-x-6">
            <button className="relative p-3 bg-[#1A1A1A] border border-[#E5C158]/10 rounded-xl hover:border-[#E5C158]/40 transition-all">
              <Bell size={18} className="text-[#E5C158]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full"></span>
            </button>
            <div className="text-right border-l border-[#E5C158]/20 pl-6">
              <p className="text-xs text-gray-400 font-medium">Số điện thoại Chủ nhà / Quản lý</p>
              <p className="text-[#E5C158] font-bold text-sm tracking-wider mt-0.5">
                {residentData?.ownerPhone || "0000000000"}
              </p>
            </div>
          </div>
        </header>

        {/* ================= TAB: TỔNG QUAN ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#E5C158]/10">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Số phòng thuê</p>
                <p className="text-xl font-bold text-[#E5C158] mt-2 tracking-wide">{residentInfo.room}</p>
              </div>
              <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#E5C158]/10">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Thời hạn hợp đồng</p>
                <p className="text-sm font-bold text-white mt-3 tracking-wide">{residentInfo.contractDate}</p>
              </div>
              <div className="bg-[#1A1A1A] p-6 rounded-xl border border-[#E5C158]/10">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Tình trạng đóng tiền</p>
                <p className="text-xl font-bold text-amber-400 mt-2 tracking-wide">Chờ đóng tiền tháng này</p>
              </div>
            </div>

            <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#E5C158]/10 space-y-4">
              <h3 className="text-base font-bold text-[#E5C158] tracking-wide">Thông tin cá nhân cư dân</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-gray-300">
                <div>
                  <span className="text-gray-400 block text-xs uppercase font-medium tracking-wider">Họ và tên</span>
                  <span className="text-white font-semibold mt-1 block">{residentInfo.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs uppercase font-medium tracking-wider">Số điện thoại</span>
                  <span className="text-white font-semibold mt-1 block">{residentInfo.phone}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs uppercase font-medium tracking-wider">Số CMND / CCCD</span>
                  <span className="text-white font-semibold mt-1 block">{residentData?.identityCardNumber || "Chưa cung cấp"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-xs uppercase font-medium tracking-wider">Giới tính</span>
                  <span className="text-white font-semibold mt-1 block">
                    {residentData?.sex === 'Female' ? 'Nữ' : (residentData?.sex === 'Male' ? 'Nam' : (residentData?.sex || 'Khác'))}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#E5C158]/10 space-y-4">
              <h3 className="text-base font-bold text-[#E5C158] tracking-wide">Nội quy phòng trọ văn minh</h3>
              <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside font-normal leading-relaxed">
                <li>Giữ gìn trật tự chung sau <span className="text-[#E5C158]">23:00</span> để không ảnh hưởng phòng bên cạnh.</li>
                <li>Đổ rác đúng nơi quy định tại khu vực hành lang tập trung.</li>
                <li>Khóa xe máy cẩn thận ở tầng 1, tắt bớt thiết bị điện khi ra khỏi phòng để phòng chống cháy nổ.</li>
                <li>Mọi sự cố hỏng hóc đồ đạc (đèn, vòi nước, điều hòa...) vui lòng chụp ảnh và gửi ở tab <span className="text-[#E5C158]">"Báo hỏng đồ"</span> để chủ nhà qua sửa.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ================= TAB: HÌNH ẢNH PHÒNG ================= */}
        {activeTab === 'gallery' && (
          <div>
            <h3 className="text-lg font-bold text-[#E5C158] mb-6 tracking-wide">Hình Ảnh Hiện Trạng Phòng Khi Bàn Giao</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roomImages.map((img, idx) => (
                <div key={idx} className="group overflow-hidden rounded-xl border border-[#E5C158]/10 bg-[#1A1A1A] transition-all hover:border-[#E5C158]/40">
                  <div className="overflow-hidden relative h-56">
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-4 bg-[#1A1A1A]">
                    <p className="text-sm font-semibold text-white tracking-wide">{img.title}</p>
                    <p className="text-xs text-gray-400 mt-1">Ảnh đối chiếu khi trả phòng</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: BẢNG GIÁ DỊCH VỤ ================= */}
        {activeTab === 'services' && (
          <div>
            <h3 className="text-lg font-bold text-[#E5C158] mb-6 tracking-wide">Biểu Phí Điện Nước & Dịch Vụ Nhà Trọ</h3>
            <div className="bg-[#1A1A1A] rounded-xl border border-[#E5C158]/10 overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#222222] text-[#E5C158] border-b border-[#E5C158]/10 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4 pl-6">Khoản mục</th>
                    <th className="p-4">Đơn giá</th>
                    <th className="p-4">Hình thức tính</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-[#E5C158]/5">
                  {services.map((srv) => (
                    <tr key={srv.id} className="hover:bg-[#222222]/40 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-white flex items-center space-x-3">
                        {srv.icon}
                        <span>{srv.name}</span>
                      </td>
                      <td className="p-4 text-[#E5C158] font-semibold">{srv.price}</td>
                      <td className="p-4 text-xs text-gray-400">
                        <span className="border border-gray-700 px-2.5 py-1 rounded-md bg-black/20">{srv.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB: HỢP ĐỒNG ================= */}
        {activeTab === 'contracts' && (
          <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#E5C158]/10">
            <h3 className="text-lg font-bold text-[#E5C158] mb-6 tracking-wide">Hợp Đồng Thuê Nhà Pháp Lý</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-5 bg-[#222222] rounded-xl border border-[#E5C158]/5 hover:border-[#E5C158]/20 transition-all">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-black/30 rounded-xl text-[#E5C158]">
                    <FileText size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white tracking-wide">Hợp đồng thuê phòng 402 - The Luxury House</p>
                    <p className="text-xs text-gray-400 mt-0.5">Thời hạn 1 năm • Tiền cọc giữ phòng: <span className="text-[#E5C158] font-medium">5.000.000 đ</span></p>
                  </div>
                </div>
                <button className="flex items-center space-x-2 text-xs font-semibold text-[#E5C158] border border-[#E5C158]/30 px-4 py-2 rounded-lg hover:bg-[#E5C158] hover:text-black transition-all">
                  <Download size={14} />
                  <span>Xem file scan PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: HÓA ĐƠN TIỀN PHÒNG ================= */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#E5C158] tracking-wide">Danh Sách Tiền Phòng Hàng Tháng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {invoices.map((inv) => (
                <div key={inv.id} className="bg-[#1A1A1A] p-6 rounded-xl border border-[#E5C158]/10 flex flex-col justify-between shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold tracking-widest bg-black/40 px-2 py-1 rounded">{inv.id}</span>
                      <h4 className="text-base font-bold text-white mt-3 tracking-wide">{inv.month}</h4>
                      <p className="text-xs text-gray-400 mt-1">Hạn đóng: Trước ngày 05 hàng tháng</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${inv.status === 'Đã đóng' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                      {inv.status}
                    </span>
                  </div>

                  {/* Chi tiết hóa đơn kiểu nhà trọ thực tế */}
                  <div className="mt-4 p-3 bg-black/30 rounded-lg text-xs space-y-1 text-gray-400">
                    <p className="flex justify-between"><span>• Tiền nhà cố định:</span> <span className="text-white">5.000.000 đ</span></p>
                    <p className="flex justify-between"><span>• Tiền điện + nước + mạng:</span> <span className="text-white">Tính theo thực tế tháng</span></p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-400">Tổng tiền cần đóng</p>
                      <p className="text-xl font-bold text-[#E5C158] mt-1 tracking-wide">{inv.amount}</p>
                    </div>
                    {inv.status === 'Chờ thanh toán' && (
                      <button className="bg-[#E5C158] text-black text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-[#d4b047] transition-all shadow-md">
                        Xem STK nhận tiền
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB: BÁO CÁO SỰ CỐ / HỎNG ĐỒ ================= */}
        {activeTab === 'report' && (
          <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#E5C158]/10 max-w-2xl">
            <h3 className="text-lg font-bold text-[#E5C158] tracking-wide">Báo Hỏng Đồ / Gửi Sự Cố Phòng Ở</h3>
            <p className="text-xs text-gray-400 mt-1 mb-6">Vui lòng điền thông tin sự cố. Chủ nhà hoặc thợ sửa chữa sẽ qua xử lý cho bạn sớm nhất.</p>

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Đã gửi thông tin báo hỏng. Ban quản lý phòng trọ sẽ liên hệ qua kiểm tra đồ đạc cho bạn nhé.'); }}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Vấn đề cần hỗ trợ</label>
                <select className="w-full bg-[#222222] border border-[#E5C158]/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#E5C158] text-sm">
                  <option>Hỏng thiết bị điện (Điều hòa, tủ lạnh, bóng đèn, bình nóng lạnh...)</option>
                  <option>Hỏng hệ thống nước (Tắc cống, rò rỉ nước vòi sen, bồn cầu...)</option>
                  <option>Mạng Wifi yếu / Không kết nối được</option>
                  <option>Vấn đề an ninh, xe cộ, khóa vân tay tầng 1</option>
                  <option>Khác (Ý kiến đóng góp, phản ánh phòng bên ồn ào...)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Mô tả chi tiết sự cố</label>
                <textarea
                  rows="4"
                  placeholder="Ví dụ: Điều hòa phòng 402 bật không lên mát, chảy nước ở cục lạnh. Nhờ chủ nhà cho thợ qua xem giúp..."
                  className="w-full bg-[#222222] border border-[#E5C158]/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#E5C158] text-sm placeholder-gray-600 leading-relaxed"
                ></textarea>
              </div>

              <button type="submit" className="w-full bg-[#E5C158] text-black text-sm font-bold tracking-wider uppercase py-3.5 rounded-lg hover:bg-[#d4b047] transition-all shadow-lg shadow-[#E5C158]/5">
                Gửi Thông Báo Tới Chủ Nhà
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}