export default function LuxuryRegistrationForm({ onBackHome, onContinue }) {
  return (
    // Sử dụng phông chữ chung là sans, nhưng sẽ dùng serif cho các tiêu đề để tạo nét cổ điển
    <div className="flex min-h-screen w-full bg-[#F9F8F3] font-sans">
      
      {/* Cột trái: Hình ảnh & Slogan (Ẩn trên màn hình nhỏ) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-center items-center text-center p-12">
        {/* Background Image với Overlay tối màu */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            // Bạn có thể thay link ảnh này bằng ảnh nhân viên của bạn
            backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
          }}
        >
          {/* Lớp phủ Xanh Navy đậm tạo sự sang trọng */}
          <div className="absolute inset-0 bg-[#0A192F]/80 mix-blend-multiply"></div>
          {/* Gradient nhẹ từ dưới lên */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-transparent to-transparent opacity-90"></div>
        </div>

        {/* Nội dung Slogan */}
        <div className="relative z-10 text-white flex flex-col items-center">
          <h1 className="text-5xl font-serif font-bold tracking-wide mb-6 text-[#D4AF37] leading-tight">
            Quản lý dễ dàng <br />
            <span className="text-white">Vận hàng Nhà Trọ / Chung Cư Mini đơn giản</span>
          </h1>
          
          {/* Khung viền vàng cổ điển */}
          <div className="mt-6 border border-[#D4AF37] px-8 py-3 backdrop-blur-sm bg-black/20">
            <p className="text-lg font-light tracking-wider">
              Hỗ trợ đăng ký <span className="font-bold text-[#D4AF37] ml-2">ptrungduc1011@gmail.com</span>
            </p>
          </div>
        </div>
      </div>

      {/* Cột phải: Form Đăng ký */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white">
        {/* Nút Đóng (Góc phải trên) */}
        <button 
          type="button"
          onClick={onBackHome}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        {/* Khung Form Container */}
        <div className="w-full max-w-md bg-white/80 p-8 sm:p-10 rounded-[34px] border border-[#D4AF37]/20 shadow-[0_28px_70px_rgba(10,25,47,0.14)] backdrop-blur-xl relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#D4AF37]/12 via-transparent to-[#ffffff]/80"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-serif font-semibold text-center text-[#0A192F] mb-10">
              Tạo tài khoản dùng thử miễn phí
            </h2>

          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault()
              onContinue()
            }}
          >
            {/* Nhập tên khách hàng */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-2">Tên khách hàng</label>
              <input
                type="text"
                placeholder="Nhập tên khách hàng"
                className="w-full px-4 py-3 border border-gray-300 rounded-sm text-gray-900 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-2">Số điện thoại</label>
              <div className="relative">
                <div className="absolute left-3 top-0 h-full flex items-center pointer-events-none">
                  <span className="text-lg">🇻🇳</span>
                </div>
                <input
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9]*"
                  placeholder="091 234 56 78"
                  onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, ''); }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-sm text-gray-900 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                />
              </div>
            </div>

            {/* Quốc gia đang kinh doanh */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-2">Quốc gia đang kinh doanh</label>
              <div className="relative">
                <select className="w-full px-4 py-3 border border-gray-300 rounded-sm appearance-none focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] bg-white text-gray-800">
                  <option value="">-- Chọn quốc gia --</option>
                  <option value="vn">Việt Nam</option>
                  <option value="th">Thái Lan</option>
                  <option value="sg">Singapore</option>
                </select>
                <div className="absolute top-0 right-0 h-full flex items-center pr-4 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Chọn khu vực (Tỉnh) */}
            <div>
              <label className="block text-sm text-gray-700 font-medium mb-2">Chọn khu vực (Tỉnh)</label>
              <div className="relative">
                <select className="w-full px-4 py-3 border border-gray-300 rounded-sm appearance-none focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] bg-white text-gray-800">
                  <option value="">-- Chọn khu vực --</option>
                  <option value="hn">Hà Nội</option>
                  <option value="hcm">Hồ Chí Minh</option>
                  <option value="dn">Đà Nẵng</option>
                  <option value="hai">Hải Phòng</option>
                  <option value="ct">Cần Thơ</option>
                </select>
                <div className="absolute top-0 right-0 h-full flex items-center pr-4 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Checkbox đồng ý chính sách */}
            <div className="flex items-start gap-3 pt-4">
              <div className="flex items-center h-5">
                <input 
                  type="checkbox" 
                  id="policy" 
                  className="w-4 h-4 border-gray-300 rounded-sm text-[#0A192F] focus:ring-[#D4AF37]" 
                />
              </div>
              <label htmlFor="policy" className="text-sm text-gray-600 leading-snug">
                Tôi đã đọc và đồng ý <a href="#" className="text-[#D4AF37] font-medium hover:underline">Điều khoản và chính sách sử dụng</a> của hệ thống
              </label>
            </div>

            {/* Nút Submit */}
            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                className="bg-[#0A192F] hover:bg-[#112240] text-white font-medium py-3 px-10 rounded-sm shadow-md transition-all duration-300 hover:shadow-lg border border-transparent hover:border-[#D4AF37]"
              >
                Tiếp tục
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
