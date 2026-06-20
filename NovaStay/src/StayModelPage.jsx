import { useEffect } from 'react'
import {
  BadgeCheck,
  Banknote,
  BedDouble,
  Bot,
  Building2,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileSignature,
  Gauge,
  Home,
  Landmark,
  Mail,
  MessageSquareText,
  QrCode,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react'
import './StayModelPage.css'

const metrics = [
  { value: '324', label: 'Tổng phòng', delta: '+12 so với tháng trước' },
  { value: '85,8%', label: 'Tỷ lệ lấp đầy', delta: '+6,4%' },
  { value: '128,45 triệu', label: 'Doanh thu tháng', delta: '+14,4%' },
  { value: '23,85 triệu', label: 'Công nợ', delta: '-9,1%' },
]

const goals = [
  'Giảm thao tác thủ công',
  'Tự động hóa quy trình vận hành',
  'Tăng tỷ lệ lấp đầy phòng',
  'Hạn chế thất thoát doanh thu',
  'Quản lý tập trung nhiều tòa nhà',
  'Việc của bạn là làm 1 ly cooffee, còn lại cứ để NovaStay lo',
]

const stayModels = [
  {
    icon: Home,
    title: 'Nhà trọ / Chung cư mini',
    text: 'Quản lý phòng, tầng, khu vực, cư dân và hợp đồng thuê dài hạn trong một sổ vận hành tập trung.',
  },
  {
    icon: BedDouble,
    title: 'Ký túc xá',
    text: 'Theo dõi giường, ca ở, hồ sơ cư dân, nội quy và công suất theo từng phòng.',
  },
  {
    icon: Building2,
    title: 'Sleepbox',
    text: 'Quản lý box, lịch đặt, khung giờ thuê, trạng thái sử dụng và doanh thu linh hoạt.',
  },
  {
    icon: Landmark,
    title: 'Homestay / Airbnb',
    text: 'Kết nối lịch lưu trú, kênh bán, dịch vụ cộng thêm và quy trình chăm sóc khách.',
  },
]

const features = [
  {
    icon: Building2,
    title: 'Quản lý vận hành lưu trú',
    items: ['Phòng, giường, sleepbox', 'Hợp đồng thuê và ký số', 'Cư dân, tạm trú, đặt cọc', 'Công nợ và doanh thu'],
  },
  {
    icon: QrCode,
    title: 'Thanh toán & hóa đơn',
    items: ['Tự động tính tiền phòng', 'Điện nước theo chỉ số', 'VietQR động qua webhook', 'Lịch sử thanh toán tập trung'],
  },
  {
    icon: Wrench,
    title: 'Quản lý bảo trì',
    items: ['Tiếp nhận báo hỏng', 'Điều phối kỹ thuật viên', 'Theo dõi tiến độ xử lý', 'Nghiệm thu sau sửa chữa'],
  },
  {
    icon: Users,
    title: 'Quản lý môi giới',
    items: ['Nguồn khách cộng tác viên', 'Theo dõi đặt cọc', 'Ký hợp đồng', 'Đối soát hoa hồng'],
  },
]

const aiFeatures = [
  { icon: ScanLine, title: 'AI OCR', text: 'Nhận diện chỉ số điện nước từ ảnh chụp và giảm sai sót nhập liệu.' },
  { icon: MessageSquareText, title: 'Tự động nhắc nợ', text: 'Soạn tin nhắn theo công nợ, lịch sử thanh toán và ngữ cảnh từng cư dân.' },
  { icon: Bot, title: 'AI truy vấn', text: 'Hỏi đáp dữ liệu vận hành bằng ngôn ngữ tự nhiên, không cần mở nhiều báo cáo.' },
  { icon: Sparkles, title: 'AI Chatbot', text: 'Tư vấn khách thuê và hỗ trợ đặt phòng 24/7 theo kịch bản của từng cơ sở.' },
  { icon: Gauge, title: 'Dynamic Pricing', text: 'Gợi ý giá thuê tối ưu theo mùa, nhu cầu và tỷ lệ lấp đầy thực tế.' },
]

const roles = [
  { title: 'Platform Super Admin', text: 'Quản lý gói dịch vụ, khách hàng doanh nghiệp và doanh thu toàn hệ thống.' },
  { title: 'Business Admin', text: 'Theo dõi vận hành, tài chính, nhân sự và chuỗi tòa nhà của từng doanh nghiệp.' },
  { title: 'Co-Admin & Manager', text: 'Quản lý thực địa, chốt điện nước, xử lý check-in, check-out và công việc hằng ngày.' },
  { title: 'Broker', text: 'Xem phòng trống, theo dõi khách hàng, đặt cọc và hoa hồng môi giới.' },
  { title: 'Technician', text: 'Nhận yêu cầu bảo trì, cập nhật trạng thái xử lý và lưu lịch sử nghiệm thu.' },
  { title: 'Resident', text: 'Xem hóa đơn, thanh toán, ký hợp đồng và gửi yêu cầu hỗ trợ khi cần.' },
]

const paymentSteps = ['Lập hóa đơn', 'Gửi thông báo', 'Tạo VietQR động', 'Xác nhận webhook', 'Cập nhật công nợ']
const maintenanceSteps = ['Tạo yêu cầu', 'Phân công kỹ thuật', 'Xử lý & cập nhật', 'Cư dân nghiệm thu', 'Lưu lịch sử']

function useStayModelEffects() {
  useEffect(() => {
    document.body.classList.add('stay-model-page-active')

    return () => {
      document.body.classList.remove('stay-model-page-active')
    }
  }, [])

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll('[data-reveal]'))
    if (!targets.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -28% 0px', threshold: 0.24 },
    )

    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const updateScrollState = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0
      document.documentElement.style.setProperty('--page-progress', `${Math.min(progress, 1)}`)
      document.documentElement.style.setProperty('--hero-depth', `${Math.min(window.scrollY / 560, 1)}`)
    }

    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      window.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [])
}

function ScrollRail() {
  return (
    <aside className="scroll-rail" aria-hidden="true">
      <span className="rail-dot" />
      <span className="rail-progress" />
      <div className="rail-chapter">
        <strong>01</strong>
        <span>Tổng quan</span>
      </div>
      <div className="rail-chapter">
        <strong>02</strong>
        <span>AI vận hành</span>
      </div>
      <div className="rail-chapter">
        <strong>03</strong>
        <span>Tăng trưởng</span>
      </div>
    </aside>
  )
}

function DashboardMockup() {
  return (
    <div className="dashboard-shell" aria-label="Bảng điều hành NovaStay">
      <aside className="mock-sidebar">
        <div className="mini-brand">
          <Building2 size={16} />
          NovaStay
        </div>
        {['Tổng quan', 'Phòng', 'Hợp đồng', 'Cư dân', 'Thu chi', 'Bảo trì'].map((item, index) => (
          <span className={index === 0 ? 'active' : ''} key={item}>
            {item}
          </span>
        ))}
      </aside>

      <div className="mock-content">
        <div className="mock-topline">
          <strong>Tổng quan vận hành</strong>
          <span>Tháng này</span>
        </div>
        <div className="metric-grid">
          {metrics.map((metric) => (
            <div className="metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.delta}</small>
            </div>
          ))}
        </div>

        <div className="chart-panel">
          <div className="chart-header">
            <strong>Doanh thu & chi phí</strong>
            <span>Webhook đã đối soát</span>
          </div>
          <div className="chart-lines">
            <span className="line line-a" />
            <span className="line line-b" />
            <span className="line line-c" />
          </div>
        </div>

        <div className="work-grid">
          <div className="work-panel">
            <strong>Hóa đơn quá hạn</strong>
            {['Phòng 203', 'Phòng 404', 'Phòng 106'].map((room, index) => (
              <p key={room}>
                {room}
                <span>Quá {index + 1} ngày</span>
              </p>
            ))}
          </div>
          <div className="work-panel">
            <strong>Yêu cầu bảo trì</strong>
            {['Điều hòa không lạnh', 'Tắc vòi nước', 'Đèn hành lang hỏng'].map((task) => (
              <p key={task}>
                {task}
                <span>Đang xử lý</span>
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="copilot-panel">
        <div>
          <strong>AI Concierge</strong>
          <Bot size={18} />
        </div>
        {['Tóm tắt tình hình hôm nay', 'Phân tích doanh thu & công nợ', 'Gợi ý tăng lấp phòng'].map((prompt) => (
          <button type="button" key={prompt}>
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

function SectionHeading({ title, text }) {
  return (
    <div className="section-heading" data-reveal="right">
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  )
}

function ChapterIntro({ number, label, title, text }) {
  return (
    <div className="chapter-intro" data-reveal="right">
      <span>{number}</span>
      <small>{label}</small>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  )
}

function Flow({ title, accent, steps }) {
  return (
    <div className="flow luxury-panel" data-reveal="left">
      <h3>{title}</h3>
      <div className="flow-line">
        {steps.map((step, index) => (
          <div className="flow-step" key={step}>
            <span style={{ '--step-accent': accent }}>{index + 1}</span>
            <p>{step}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StayModelPage({ onBackHome }) {
  useStayModelEffects()

  return (
    <div className="app" id="top">
      <ScrollRail />
      <button className="home-fab" type="button" onClick={onBackHome} aria-label="Quay lại trang chủ">
        <Home size={20} />
        <span>Trang chủ</span>
      </button>

      <main>
        <section className="hero-section" id="overview">
          <div className="hero-line" aria-hidden="true" />
          <div className="hero-copy" data-reveal="left">
            <h1 >NovaStay</h1>
            <h2>PLatform SaaS quản lý lưu trú thông minh tích hợp AI</h2>
            <p>
              Số hóa toàn bộ quy trình vận hành nhà trọ, chung cư mini, ký túc xá, sleepbox và homestay:
              từ quản lý phòng, hợp đồng, cư dân, thu tiền thuê, điện nước đến bảo trì và chăm sóc khách thuê.
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#contact">
                Dùng thử miễn phí 14 ngày
                <ChevronRight size={18} />
              </a>
              <a className="secondary-action" href="#features">
                Xem tính năng
              </a>
            </div>
            <div className="goal-strip">
              {goals.map((goal) => (
                <span key={goal}>
                  <CheckCircle2 size={16} />
                  {goal}
                </span>
              ))}
            </div>
          </div>
          <div className="hero-visual parallax-panel annotation-surface" data-reveal="right" data-note="Dashboard vận hành theo thời gian thực">
            <DashboardMockup />
          </div>
        </section>

        <section className="models-section chapter-section">
          <ChapterIntro
            number="01"
            label="Vận hành thông minh"
            title="Số hóa toàn bộ quy trình vận hành"
            text="Mọi nghiệp vụ được nối thành một dòng vận hành duy nhất, từ phòng, giường, hợp đồng, cư dân, đặt cọc, điện nước đến bảo trì."
          />
          <div className="motion-path" aria-hidden="true" />
          <div className="model-grid">
            {stayModels.map(({ icon: Icon, title, text }) => (
              <article className="model-item float-card luxury-panel" data-reveal="left" data-note="Một hệ thống, nhiều mô hình" key={title}>
                <Icon size={34} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="features-section" id="features">
          <SectionHeading
            title="Các tính năng nổi bật"
            text="Tập trung vào các nghiệp vụ tạo doanh thu, giảm thất thoát và giúp đội vận hành theo dõi mọi việc trong cùng một luồng dữ liệu."
          />
          <div className="feature-grid">
            {features.map(({ icon: Icon, title, items }) => (
              <article className="feature-card float-card luxury-panel" data-reveal="left" data-note="Tối ưu nghiệp vụ hằng ngày" key={title}>
                <Icon size={28} />
                <h3>{title}</h3>
                <ul>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="ai-section chapter-section" id="ai">
          <div className="ai-copy" data-reveal="right">
            <span className="chapter-number">02</span>
            <h2>AI tự động hóa đúng điểm tạo giá trị</h2>
            <p>
              NovaStay kích hoạt AI tại các chức năng có tác động vận hành cao: đọc chỉ số, nhắc nợ,
              phân tích dữ liệu, tư vấn khách thuê và đề xuất giá.
            </p>
          </div>
          <div className="ai-core" aria-hidden="true">
            <span>AI</span>
          </div>
          <div className="ai-grid">
            {aiFeatures.map(({ icon: Icon, title, text }) => (
              <article className="ai-card float-card luxury-panel" data-reveal="left" data-note="AI chạy ở điểm có giá trị cao" key={title}>
                <Icon size={26} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="roles-section" id="roles">
          <SectionHeading
            title="Bảo mật &  Hệ sinh thái"
            text="Multi-tenant SaaS giúp nhiều chủ cơ sở dùng chung nền tảng, trong khi dữ liệu từng tenant được tách biệt và bảo mật."
          />
          <div className="roles-grid">
            {roles.map((role) => (
              <article className="role-card float-card luxury-panel" data-reveal="left" data-note="Phân quyền theo vai trò thực tế" key={role.title}>
                <BadgeCheck size={22} />
                <h3>{role.title}</h3>
                <p>{role.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="workflow-section chapter-section">
          <ChapterIntro
            number="03"
            label="Tăng trưởng bền vững"
            title="Thanh toán &  vận hành "
            text="Tự động hóa từ hóa đơn đến xác nhận thanh toán, đồng thời giữ yêu cầu bảo trì minh bạch cho cư dân và đội kỹ thuật."
          />
          <div className="flow-grid">
            <Flow title="Thanh toán thông minh" accent="#b8872d" steps={paymentSteps} />
            <Flow title="Bảo trì hiệu quả" accent="#123047" steps={maintenanceSteps} />
          </div>
          <div className="integration-strip luxury-panel annotation-surface" data-reveal="left" data-note="Kết nối thanh toán, ký số và thiết bị">
            {[
              { icon: QrCode, label: 'VietQR' },
              { icon: CreditCard, label: 'Cổng thanh toán' },
              { icon: Banknote, label: 'Ngân hàng' },
              { icon: FileSignature, label: 'E-Signature' },
              { icon: Mail, label: 'Email / SMS' },
              { icon: ClipboardCheck, label: 'Thiết bị IoT' },
            ].map(({ icon: Icon, label }) => (
              <span key={label}>
                <Icon size={20} />
                {label}
              </span>
            ))}
          </div>
        </section>

        <section className="difference-section">
          <div className="difference-copy" data-reveal="right">
            <h2>Giá trị khác biệt của NovaStay</h2>
            <p>
              NovaStay kết hợp AI, OCR, QR Payment và E-Signature trong một hệ sinh thái duy nhất,
              giúp chủ cơ sở lưu trú kiểm soát vận hành, tối ưu doanh thu và nâng cao trải nghiệm cư dân.
            </p>
          </div>
          <div className="difference-list annotation-surface" data-note="Khác biệt cốt lõi của nền tảng">
            <span className="luxury-panel" data-reveal="left">
              <ShieldCheck size={20} />
              Dữ liệu tenant tách biệt hoàn toàn
            </span>
            <span className="luxury-panel" data-reveal="left">
              <ChartNoAxesCombined size={20} />
              Gợi ý giá thuê theo mùa và nhu cầu
            </span>
            <span className="luxury-panel" data-reveal="left">
              <Bot size={20} />
              Copilot truy vấn vận hành bằng tiếng Việt
            </span>
          </div>
        </section>

        <section className="cta-section" id="contact">
          <div data-reveal="right">
            <h2>Quản lý thông minh cùng NovaStay ngay hôm nay</h2>
            <p>Dùng thử miễn phí 14 ngày. Không cần thẻ tín dụng. Hỗ trợ triển khai tập trung cho các mô hình lưu trú.</p>
            <div className="hero-actions">
              <a className="primary-action light" href="mailto:support@novastay.vn">
                Liên hệ tư vấn
                <ChevronRight size={18} />
              </a>
              <a className="secondary-action light" href="#overview">
                Xem lại tổng quan
              </a>
            </div>
          </div>
          <div className="device-preview annotation-surface" data-reveal="right" data-note="Quản lý trên mọi thiết bị">
            <DashboardMockup />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-col brand">
            <strong>NovaStay Corporation</strong>
            <p>Nền tảng SaaS quản lý lưu trú thông minh tích hợp AI — quản lý phòng, hợp đồng, thu chi, bảo trì và trải nghiệm cư dân.</p>
            <small>© 2026 NovaStay. All rights reserved.</small>
          </div>

          <div className="footer-col links">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Tính năng</a></li>
              <li><a href="#ai">AI & OCR</a></li>
              <li><a href="#roles">Phân quyền</a></li>
              <li><a href="#contact">Liên hệ / Demo</a></li>
            </ul>
          </div>

          <div className="footer-col resources">
            <h4>Hỗ trợ</h4>
            <ul>
              <li><a href="mailto:support@novastay.vn">support@novastay.vn</a></li>
              <li><a href="mailto:sales@novastay.vn">sales@novastay.vn</a></li>
              <li><a href="#">Tài liệu hướng dẫn</a></li>
            </ul>
          </div>

          <div className="footer-col legal">
            <h4>Pháp lý</h4>
            <ul>
              <li><a href="/terms">Điều khoản dịch vụ</a></li>
              <li><a href="/privacy">Chính sách bảo mật</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>Khác biệt để làm tốt</span>
          <div className="social">
            <a href="#" aria-label="LinkedIn">
              <Users size={16} />
            </a>
            <a href="mailto:info@novastay.vn" aria-label="Email">
              <Mail size={16} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
