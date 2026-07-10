import { useEffect, useState } from 'react'
import {
  AlertTriangle,
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
  RefreshCw,
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
  'Việc của bạn là làm 1 ly coffee, còn lại cứ để NestOne lo',
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

const q2Metrics = [
  { value: '3,85 Tỷ', label: 'Doanh thu Q2-2026', delta: '+22,4% so với Q1', detail: 'Tăng trưởng nhờ tự động hóa VietQR' },
  { value: '91,6%', label: 'Lấp đầy bình quân', delta: '+4,2%', detail: 'Tối ưu hóa giỏ hàng và môi giới' },
  { value: '1,46 Tỷ', label: 'Lợi nhuận ròng', delta: '+15,6%', detail: 'Biên lợi nhuận đạt 37,9%' },
  { value: '1,8%', label: 'Nợ quá hạn', delta: '-6,6%', detail: 'AI tự động nhắc nợ đa kênh hiệu quả' },
]

const q2Months = [
  {
    month: 'Tháng 4',
    revenue: 1220000000,
    expenses: 780000000,
    occupancy: '89.2%',
    highlights: ['Khai trương cơ sở Gold Tower (45 phòng)', 'Tích hợp thanh toán VietQR động']
  },
  {
    month: 'Tháng 5',
    revenue: 1280000000,
    expenses: 810000000,
    occupancy: '91.5%',
    highlights: ['Tự động hóa 100% chỉ số điện nước qua AI OCR', 'Giảm 25% cuộc gọi thắc mắc hóa đơn']
  },
  {
    month: 'Tháng 6',
    revenue: 1350000000,
    expenses: 800000000,
    occupancy: '94.1%',
    highlights: ['Lấp đầy 100% sleepbox khu vực quận 3', 'Đối soát tự động qua webhook khớp 99.8%']
  }
]

const auditTransactions = [
  {
    id: 'TX-9021',
    time: '22:45:12',
    bankTx: { amount: '+3,500,000đ', desc: 'NS-203-T6 (Nguyen Van A)' },
    invoice: { room: 'Phòng 203', amount: '3,500,000đ', tenant: 'Nguyễn Văn A' },
    status: 'matched',
    statusText: 'Khớp 100%',
    method: 'VietQR Webhook'
  },
  {
    id: 'TX-9022',
    time: '22:46:01',
    bankTx: { amount: '+5,200,000đ', desc: 'NS-404-T6 (Tran Thi B)' },
    invoice: { room: 'Phòng 404', amount: '5,200,000đ', tenant: 'Trần Thị B' },
    status: 'matched',
    statusText: 'Khớp 100%',
    method: 'VietQR Webhook'
  },
  {
    id: 'TX-9023',
    time: '22:48:30',
    bankTx: { amount: '+1,200,000đ', desc: 'Chuyen khoan tien phong P105' },
    invoice: { room: 'Phòng 105', amount: '1,500,000đ', tenant: 'Lê Văn C' },
    status: 'discrepancy',
    statusText: 'Lệch số tiền (Thiếu 300k)',
    method: 'Manual Bank Transfer'
  },
  {
    id: 'TX-9024',
    time: '22:50:15',
    bankTx: { amount: 'Không có giao dịch', desc: 'Người dùng thanh toán trực tiếp qua quản lý?' },
    invoice: { room: 'Phòng 302', amount: '2,800,000đ', tenant: 'Phạm Minh D' },
    status: 'unmatched',
    statusText: 'Chưa đối soát',
    method: 'Chờ xác nhận'
  }
]

const pieData = [
  { label: 'Điện nước & Dịch vụ', value: 30, amount: '717M', color: '#b8872d' },
  { label: 'Bảo trì & Thiết bị', value: 25, amount: '597.5M', color: '#102b42' },
  { label: 'Nhân sự & Vận hành', value: 25, amount: '597.5M', color: '#e4c57b' },
  { label: 'Khác & Dự phòng', value: 20, amount: '478M', color: '#47566a' },
]

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
      <div className="rail-chapter">
        <strong>04</strong>
        <span>Tài chính</span>
      </div>
    </aside>
  )
}

function DashboardMockup() {
  const sidebarItems = [
    { label: 'Tổng quan', icon: Gauge },
    { label: 'Phòng', icon: Home },
    { label: 'Hợp đồng', icon: FileSignature },
    { label: 'Cư dân', icon: Users },
    { label: 'Thu chi', icon: CreditCard },
    { label: 'Bảo trì', icon: Wrench },
  ];

  return (
    <div className="dashboard-shell" aria-label="Bảng điều hành NestOne">
      <aside className="mock-sidebar">
        <div className="mini-brand">
          <Building2 size={16} />
          NestOne
        </div>
        {sidebarItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <span
              className={index === 0 ? 'active' : ''}
              key={item.label}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <Icon size={13} />
              {item.label}
            </span>
          );
        })}
      </aside>

      <div className="mock-content">
        <div className="mock-topline">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong>Tổng quan vận hành</strong>
            <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(184, 135, 45, 0.12)', color: 'var(--gold-dark)', fontWeight: 'bold' }}>
              Cơ sở: NestOne Luxury
            </span>
          </div>
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
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)' }} /> Doanh thu
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--navy-2)' }} /> Chi phí
              </span>
            </div>
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
            {[
              { room: 'Phòng 203', desc: 'Dịch vụ tháng 5', time: 'Quá 2 ngày', amount: '3.4M' },
              { room: 'Phòng 404', desc: 'Tiền phòng tháng 6', time: 'Quá 5 ngày', amount: '5.2M' },
              { room: 'Phòng 106', desc: 'Tiền điện nước', time: 'Quá 1 ngày', amount: '0.8M' },
            ].map((item) => (
              <div key={item.room} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(184, 135, 45, 0.08)', paddingBottom: '6px', marginTop: '10px' }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: 'var(--navy)', fontSize: '0.78rem', display: 'block' }}>{item.room}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--ink-soft)' }}>{item.desc}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.76rem', color: '#dc2626', fontWeight: 'bold', display: 'block' }}>{item.amount}</span>
                  <span style={{ fontSize: '0.64rem', color: 'var(--gold-dark)', fontWeight: 'bold' }}>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="work-panel">
            <strong>Yêu cầu bảo trì</strong>
            {[
              { title: 'Điều hòa không lạnh', room: 'P.203', tech: 'KTV. Hùng', status: 'Đang xử lý', color: 'var(--gold)' },
              { title: 'Tắc vòi nước', room: 'P.105', tech: 'KTV. Minh', status: 'Mới nhận', color: '#2563eb' },
              { title: 'Đèn hành lang hỏng', room: 'Tầng 3', tech: 'KTV. Hùng', status: 'Đã xong', color: '#16a34a' },
            ].map((task) => (
              <div key={task.title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(184, 135, 45, 0.08)', paddingBottom: '6px', marginTop: '10px' }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: 'var(--navy)', fontSize: '0.78rem', display: 'block' }}>{task.title}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--ink-soft)' }}>{task.room} - {task.tech}</span>
                </div>
                <span style={{ fontSize: '0.64rem', padding: '1px 5px', borderRadius: '3px', background: `${task.color}15`, color: task.color, fontWeight: 'bold' }}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="copilot-panel" style={{ zIndex: '20' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(184, 135, 45, 0.16)', paddingBottom: '6px', marginBottom: '8px' }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--navy)', fontSize: '0.78rem' }}>
            <Bot size={14} />
            AI Assistant
          </strong>
          <span style={{ fontSize: '0.64rem', color: '#16a34a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} /> Active
          </span>
        </div>
        <div style={{ background: 'rgba(184, 135, 45, 0.05)', border: '1px solid rgba(184, 135, 45, 0.12)', borderRadius: '6px', padding: '8px', fontSize: '0.7rem', color: 'var(--ink)', marginBottom: '8px' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--gold-dark)', fontSize: '0.7rem' }}>NestOne AI:</p>
          <p style={{ margin: '3px 0 0', lineHeight: '1.35', color: 'var(--ink-soft)' }}>
            Hóa đơn P.404 trễ hạn 5 ngày. Gợi ý gửi tin nhắn nhắc nợ cá nhân hóa qua Zalo/SMS. Bạn có muốn thực hiện?
          </p>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button type="button" style={{ margin: 0, padding: '5px 8px', fontSize: '0.68rem', flex: '1', textAlign: 'center', background: 'var(--gold)', color: '#fff8e8', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Đồng ý
          </button>
          <button type="button" style={{ margin: 0, padding: '5px 8px', fontSize: '0.68rem', flex: '1', textAlign: 'center', background: 'transparent', border: '1px solid var(--line-strong)', color: 'var(--ink)', borderRadius: '4px', cursor: 'pointer' }}>
            Bỏ qua
          </button>
        </div>
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
  const [selectedMonth, setSelectedMonth] = useState(2) // Default to June (index 2)
  const [filterStatus, setFilterStatus] = useState('all')
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [hoveredPieSlice, setHoveredPieSlice] = useState(null)

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
            <h1 >NestOne</h1>
            <h2>Platform SaaS quản lý lưu trú thông minh tích hợp AI</h2>
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
              NestOne kích hoạt AI tại các chức năng có tác động vận hành cao: đọc chỉ số, nhắc nợ,
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

        <section className="finance-section chapter-section" id="finance">
          <ChapterIntro
            number="04"
            label="Tài chính & Hiệu suất"
            title="Báo cáo Tài chính theo Quý"
            text="Tự động tổng hợp kết quả hoạt động kinh doanh, đo lường tỷ suất lợi nhuận và các chỉ số tăng trưởng thực tế theo thời gian thực."
          />

          <div className="finance-grid-wrapper" data-reveal="left">
            <div className="finance-metrics-strip">
              {q2Metrics.map((m) => (
                <div className="f-metric-card luxury-panel" key={m.label}>
                  <div className="f-metric-header">
                    <span>{m.label}</span>
                    <span className="f-metric-delta">{m.delta}</span>
                  </div>
                  <strong>{m.value}</strong>
                  <p>{m.detail}</p>
                </div>
              ))}
            </div>

            <div className="q2-interactive-report luxury-panel">
              <div className="q2-report-header">
                <h3>Chi tiết vận hành theo tháng - Quý Q2/2026</h3>
                <div className="month-tabs">
                  {q2Months.map((m, idx) => (
                    <button
                      key={m.month}
                      type="button"
                      className={`month-tab-btn ${selectedMonth === idx ? 'active' : ''}`}
                      onClick={() => setSelectedMonth(idx)}
                    >
                      {m.month}
                    </button>
                  ))}
                </div>
              </div>

              <div className="q2-charts-wrapper">
                {/* 1. LINE CHART */}
                <div className="chart-box line-chart-box">
                  <h4>Xu hướng Doanh thu & Chi phí Q2/2026 (Tỷ VND)</h4>
                  <div className="svg-chart-container" style={{ position: 'relative' }}>
                    <svg viewBox="0 0 400 200" className="svg-line-chart">
                      {/* Grid Lines */}
                      <line x1="50" y1="40" x2="350" y2="40" stroke="rgba(184, 135, 45, 0.08)" strokeDasharray="3 3" />
                      <line x1="50" y1="100" x2="350" y2="100" stroke="rgba(184, 135, 45, 0.08)" strokeDasharray="3 3" />
                      <line x1="50" y1="160" x2="350" y2="160" stroke="rgba(184, 135, 45, 0.08)" strokeDasharray="3 3" />

                      {/* Trục tọa độ */}
                      <line x1="50" y1="40" x2="50" y2="160" stroke="rgba(184, 135, 45, 0.2)" />
                      <line x1="50" y1="160" x2="350" y2="160" stroke="rgba(184, 135, 45, 0.2)" />

                      {/* Line Paths */}
                      <path
                        d="M 80,105 L 200,98 L 320,90"
                        fill="none"
                        stroke="var(--gold)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M 80,138 L 200,134 L 320,136"
                        fill="none"
                        stroke="var(--navy-2)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Revenue Points */}
                      {[
                        { cx: 80, cy: 105, val: '1.22B', month: 'Tháng 4', type: 'Doanh thu' },
                        { cx: 200, cy: 98, val: '1.28B', month: 'Tháng 5', type: 'Doanh thu' },
                        { cx: 320, cy: 90, val: '1.35B', month: 'Tháng 6', type: 'Doanh thu' }
                      ].map((pt, i) => (
                        <circle
                          key={i}
                          cx={pt.cx}
                          cy={pt.cy}
                          r="6"
                          fill="#fff"
                          stroke="var(--gold)"
                          strokeWidth="3"
                          style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                          onMouseEnter={(e) => setHoveredPoint({ ...pt, x: pt.cx, y: pt.cy })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      ))}

                      {/* Expense Points */}
                      {[
                        { cx: 80, cy: 138, val: '780M', month: 'Tháng 4', type: 'Chi phí' },
                        { cx: 200, cy: 134, val: '810M', month: 'Tháng 5', type: 'Chi phí' },
                        { cx: 320, cy: 136, val: '800M', month: 'Tháng 6', type: 'Chi phí' }
                      ].map((pt, i) => (
                        <circle
                          key={i}
                          cx={pt.cx}
                          cy={pt.cy}
                          r="6"
                          fill="#fff"
                          stroke="var(--navy-2)"
                          strokeWidth="3"
                          style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                          onMouseEnter={(e) => setHoveredPoint({ ...pt, x: pt.cx, y: pt.cy })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      ))}

                      {/* Labels */}
                      <text x="80" y="180" textAnchor="middle" fontSize="10" fill="var(--ink-soft)" fontWeight="600">Tháng 4</text>
                      <text x="200" y="180" textAnchor="middle" fontSize="10" fill="var(--ink-soft)" fontWeight="600">Tháng 5</text>
                      <text x="320" y="180" textAnchor="middle" fontSize="10" fill="var(--ink-soft)" fontWeight="600">Tháng 6</text>
                    </svg>

                    {/* Interactive Tooltip */}
                    {hoveredPoint && (
                      <div
                        className="chart-tooltip"
                        style={{
                          position: 'absolute',
                          left: `${(hoveredPoint.x / 400) * 100}%`,
                          top: `${(hoveredPoint.y / 200) * 100 - 18}%`,
                          transform: 'translate(-50%, -100%)',
                          backgroundColor: 'var(--navy)',
                          color: '#fff8e8',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 'bold',
                          pointerEvents: 'none',
                          boxShadow: 'var(--shadow)',
                          border: '1px solid var(--gold-light)',
                          zIndex: 10,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {hoveredPoint.month} - {hoveredPoint.type}: <span style={{ color: 'var(--gold-light)' }}>{hoveredPoint.val}</span>
                      </div>
                    )}
                  </div>
                  <div className="chart-legend">
                    <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--gold)' }} /> Doanh thu</span>
                    <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--navy-2)' }} /> Chi phí</span>
                  </div>
                </div>

                {/* 2. PIE CHART */}
                <div className="chart-box pie-chart-box">
                  <h4>Cơ cấu Chi phí Q2/2026 (%)</h4>
                  <div className="pie-chart-content">
                    <div className="svg-pie-container" style={{ position: 'relative', width: '150px', height: '150px' }}>
                      <svg width="100%" height="100%" viewBox="0 0 160 160">
                        <circle cx="80" cy="80" r="50" fill="none" stroke="rgba(184, 135, 45, 0.04)" strokeWidth="20" />
                        <circle
                          cx="80"
                          cy="80"
                          r="50"
                          fill="none"
                          stroke="#b8872d"
                          strokeWidth="20"
                          strokeDasharray="94.25 219.91"
                          strokeDashoffset="0"
                          className="pie-slice"
                          onMouseEnter={() => setHoveredPieSlice(0)}
                          onMouseLeave={() => setHoveredPieSlice(null)}
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="50"
                          fill="none"
                          stroke="#102b42"
                          strokeWidth="20"
                          strokeDasharray="78.54 235.62"
                          strokeDashoffset="-94.25"
                          className="pie-slice"
                          onMouseEnter={() => setHoveredPieSlice(1)}
                          onMouseLeave={() => setHoveredPieSlice(null)}
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="50"
                          fill="none"
                          stroke="#e4c57b"
                          strokeWidth="20"
                          strokeDasharray="78.54 235.62"
                          strokeDashoffset="-172.79"
                          className="pie-slice"
                          onMouseEnter={() => setHoveredPieSlice(2)}
                          onMouseLeave={() => setHoveredPieSlice(null)}
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="50"
                          fill="none"
                          stroke="#47566a"
                          strokeWidth="20"
                          strokeDasharray="62.83 251.33"
                          strokeDashoffset="-251.33"
                          className="pie-slice"
                          onMouseEnter={() => setHoveredPieSlice(3)}
                          onMouseLeave={() => setHoveredPieSlice(null)}
                        />
                      </svg>
                      <div
                        className="pie-center-info"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center',
                          pointerEvents: 'none'
                        }}
                      >
                        {hoveredPieSlice !== null ? (
                          <>
                            <strong style={{ fontSize: '1rem', color: 'var(--navy)', display: 'block' }}>
                              {pieData[hoveredPieSlice].value}%
                            </strong>
                            <span style={{ fontSize: '0.56rem', color: 'var(--ink-soft)', display: 'block', fontWeight: 'bold' }}>
                              {pieData[hoveredPieSlice].amount}
                            </span>
                          </>
                        ) : (
                          <>
                            <strong style={{ fontSize: '0.86rem', color: 'var(--navy)', display: 'block', lineHeight: 1.1 }}>
                              2.39 Tỷ
                            </strong>
                            <span style={{ fontSize: '0.52rem', color: 'var(--ink-soft)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold', marginTop: '2px' }}>
                              Tổng Chi
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="pie-legend">
                      {pieData.map((item, idx) => (
                        <div
                          key={idx}
                          className={`pie-legend-item ${hoveredPieSlice === idx ? 'hovered' : ''}`}
                          onMouseEnter={() => setHoveredPieSlice(idx)}
                          onMouseLeave={() => setHoveredPieSlice(null)}
                        >
                          <span className="legend-color-box" style={{ background: item.color }} />
                          <span className="legend-label-text">{item.label} ({item.value}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="q2-month-summary-panel">
                <div className="summary-section-title">
                  <span>Thông tin chi tiết {q2Months[selectedMonth].month}</span>
                </div>
                <div className="q2-report-body" style={{ border: 'none', marginTop: '12px', padding: 0 }}>
                  <div className="occupancy-display" style={{ background: 'rgba(184, 135, 45, 0.03)' }}>
                    <div className="occupancy-progress-circle">
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" className="circle-bg" />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          className="circle-fg"
                          style={{
                            strokeDasharray: 213.6,
                            strokeDashoffset: 213.6 - (213.6 * parseFloat(q2Months[selectedMonth].occupancy)) / 100
                          }}
                        />
                      </svg>
                      <div className="occupancy-val">
                        <strong>{q2Months[selectedMonth].occupancy}</strong>
                        <span>Lấp đầy</span>
                      </div>
                    </div>
                    <div className="occupancy-text">
                      <h4>Tỷ suất lấp đầy phòng</h4>
                      <p>Hệ thống tự động cập nhật giỏ hàng trống lên môi giới ngay khi cư dân hoàn tất thủ tục check-out.</p>
                    </div>
                  </div>

                  <div className="q2-month-highlights" style={{ padding: '16px', background: 'rgba(255, 250, 240, 0.42)', borderRadius: '8px', border: '1px solid rgba(184, 135, 45, 0.08)' }}>
                    <h4 style={{ margin: '0 0 8px' }}>Sự kiện vận hành nổi bật:</h4>
                    <ul>
                      {q2Months[selectedMonth].highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="audit-section" id="audit">
          <SectionHeading
            title="Giám sát Doanh thu & Kiểm toán Dòng tiền"
            text="Công cụ thông minh giúp loại bỏ hoàn toàn các rủi ro thất thoát doanh thu, tự động đối soát ngân hàng theo thời gian thực và quản lý dòng tiền chi tiết."
          />

          <div className="audit-sandbox-wrapper luxury-panel" data-reveal="right">
            <div className="sandbox-header">
              <div className="sandbox-title">
                <span className="pulse-dot" />
                <h3>NestOne Reconciler Sandbox™ (Mô phỏng đối soát dòng tiền)</h3>
              </div>
              <div className="sandbox-filters">
                <button type="button" className={filterStatus === 'all' ? 'active' : ''} onClick={() => setFilterStatus('all')}>Tất cả</button>
                <button type="button" className={filterStatus === 'matched' ? 'active' : ''} onClick={() => setFilterStatus('matched')}>Đã đối soát</button>
                <button type="button" className={filterStatus === 'discrepancy' ? 'active' : ''} onClick={() => setFilterStatus('discrepancy')}>Cảnh báo lệch</button>
                <button type="button" className={filterStatus === 'unmatched' ? 'active' : ''} onClick={() => setFilterStatus('unmatched')}>Chưa đối soát</button>
              </div>
            </div>

            <div className="sandbox-table-container">
              <table className="sandbox-table">
                <thead>
                  <tr>
                    <th>Giao dịch Ngân hàng (VietQR Webhook)</th>
                    <th>Hóa đơn Hệ thống (Sổ quỹ)</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {auditTransactions
                    .filter(tx => filterStatus === 'all' || tx.status === filterStatus)
                    .map((tx) => (
                      <tr key={tx.id} className={`tx-row ${tx.status}`}>
                        <td>
                          <div className="tx-bank-info">
                            <span className="tx-time">{tx.time}</span>
                            <span className="tx-amount">{tx.bankTx.amount}</span>
                            <span className="tx-desc">{tx.bankTx.desc}</span>
                          </div>
                        </td>
                        <td>
                          <div className="tx-invoice-info">
                            <span className="tx-invoice-room">{tx.invoice.room}</span>
                            <span className="tx-invoice-amount">{tx.invoice.amount}</span>
                            <span className="tx-invoice-tenant">{tx.invoice.tenant}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${tx.status}`}>
                            {tx.status === 'matched' && <CheckCircle2 size={12} />}
                            {tx.status === 'discrepancy' && <AlertTriangle size={12} />}
                            {tx.status === 'unmatched' && <RefreshCw size={12} className="spin-icon" />}
                            {tx.statusText}
                          </span>
                        </td>
                        <td>
                          {tx.status === 'matched' ? (
                            <span className="action-done">Tự động duyệt</span>
                          ) : tx.status === 'discrepancy' ? (
                            <button type="button" className="action-btn resolve" onClick={() => alert(`Đang kích hoạt AI soạn tin nhắn gửi cư dân ${tx.invoice.tenant} phòng ${tx.invoice.room} nợ thêm 300.000đ`)}>
                              Xử lý lệch qua AI
                            </button>
                          ) : (
                            <button type="button" className="action-btn match" onClick={() => alert(`Đang đối soát thủ công phòng ${tx.invoice.room} với dòng tiền tương đương`)}>
                              Đối soát
                            </button>
                          )
                          }
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="audit-features-grid">
              <div className="audit-feature-item">
                <ShieldCheck size={20} />
                <div>
                  <h4>Ghi vết thao tác (Audit Trails)</h4>
                  <p>Hệ thống lưu lại 100% hành vi tạo, sửa hoặc xóa hóa đơn của nhân viên quản lý cơ sở, chống thất thoát tiêu cực nội bộ.</p>
                </div>
              </div>
              <div className="audit-feature-item">
                <Users size={20} />
                <div>
                  <h4>AI Phát hiện Cư dân Lậu</h4>
                  <p>Đối chiếu tự động giữa số liệu đăng ký tạm trú, vân tay cửa ra vào và hợp đồng thuê phòng trên hệ thống.</p>
                </div>
              </div>
              <div className="audit-feature-item">
                <Bot size={20} />
                <div>
                  <h4>AI Dự báo Dòng tiền & Cảnh báo</h4>
                  <p>AI phân tích lịch sử trả tiền của cư dân để dự báo dòng tiền về và tự động gửi tin nhắn nhắc nợ cá nhân hóa đa kênh.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="difference-section">
          <div className="difference-copy" data-reveal="right">
            <h2>Giá trị khác biệt của NestOne</h2>
            <p>
              NestOne kết hợp AI, OCR, QR Payment và E-Signature trong một hệ sinh thái duy nhất,
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
            <h2>Quản lý thông minh cùng NestOne ngay hôm nay</h2>
            <p>Dùng thử miễn phí 14 ngày. Không cần thẻ tín dụng. Hỗ trợ triển khai tập trung cho các mô hình lưu trú.</p>
            <div className="hero-actions">
              <a className="primary-action light" href="mailto:support@nestone.vn">
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
            <strong>NestOne Corporation</strong>
            <p>Nền tảng SaaS quản lý lưu trú thông minh tích hợp AI — quản lý phòng, hợp đồng, thu chi, bảo trì và trải nghiệm cư dân.</p>
            <small>© 2026 NestOne. All rights reserved.</small>
          </div>

          <div className="footer-col links">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Tính năng</a></li>
              <li><a href="#ai">AI & OCR</a></li>
              <li><a href="#finance">Báo cáo Q2-2026</a></li>
              <li><a href="#audit">Kiểm toán dòng tiền</a></li>
              <li><a href="#contact">Liên hệ / Demo</a></li>
            </ul>
          </div>

          <div className="footer-col resources">
            <h4>Hỗ trợ</h4>
            <ul>
              <li><a href="mailto:support@nestone.vn">support@nestone.vn</a></li>
              <li><a href="mailto:sales@nestone.vn">sales@nestone.vn</a></li>
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
            <a href="mailto:info@nestone.vn" aria-label="Email">
              <Mail size={16} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
