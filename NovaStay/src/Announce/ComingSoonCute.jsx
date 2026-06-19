import { useEffect, useState } from 'react';
import {
  Bell,
  Bot,
  Building2,
  CalendarClock,
  CreditCard,
  FileSignature,
  Home,
  KeyRound,
  Mail,
  QrCode,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import NovastayLogo from '../components/NovastayLogo';

const launchFeatures = [
  {
    icon: Building2,
    title: 'Quản lý phòng tập trung',
    text: 'Theo dõi phòng trống, phòng đang thuê, công nợ và hợp đồng trên cùng một màn hình.',
  },
  {
    icon: Bot,
    title: 'AI hỗ trợ vận hành',
    text: 'Gợi ý nhắc nợ, đọc dữ liệu vận hành và hỗ trợ chủ cơ sở ra quyết định nhanh hơn.',
  },
  {
    icon: QrCode,
    title: 'Thanh toán tự động',
    text: 'Kết nối VietQR, hóa đơn và webhook để giảm thao tác đối soát thủ công.',
  },
  {
    icon: Wrench,
    title: 'Bảo trì minh bạch',
    text: 'Tiếp nhận, phân công và theo dõi yêu cầu sửa chữa từ cư dân đến đội kỹ thuật.',
  },
];

const countdownLabels = [
  ['days', 'Ngày'],
  ['hours', 'Giờ'],
  ['minutes', 'Phút'],
  ['seconds', 'Giây'],
];

const luxuryNotifications = [
  {
    icon: Bell,
    title: 'Nhắc nợ tự động',
    text: '12 hóa đơn đã được lên lịch gửi tối nay',
    tone: 'sky',
  },
  {
    icon: ShieldCheck,
    title: 'Tenant an toàn',
    text: 'Dữ liệu từng cơ sở được tách biệt',
    tone: 'emerald',
  },
  {
    icon: CreditCard,
    title: 'Đối soát VietQR',
    text: 'Webhook thanh toán sẵn sàng kích hoạt',
    tone: 'amber',
  },
];

export default function ComingSoonCute() {
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 8,
    minutes: 34,
    seconds: 57,
  });
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }

        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        }

        if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }

        if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }

        clearInterval(timer);
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!email.trim()) return;

    setIsSubscribed(true);
    setEmail('');
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7fbff] text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(212,175,55,0.2),transparent_24%),linear-gradient(135deg,#f7fbff_0%,#ecf7ff_46%,#fff8e7_100%)]" />
      <div className="absolute left-8 top-24 h-32 w-32 rounded-full border border-sky-200/70 bg-white/30 blur-sm" />
      <div className="absolute bottom-8 right-10 h-44 w-44 rounded-full border border-amber-200/80 bg-amber-100/30 blur-sm" />
      <div className="luxury-notification-aurora" aria-hidden="true" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <NovastayLogo className="w-[160px] md:w-[210px]" />
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-sky-300 hover:text-sky-700"
          >
            <Home className="h-4 w-4" />
            Trang chủ
          </a>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:py-14">
          <section>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm backdrop-blur">
              <CalendarClock className="h-4 w-4" />
              Phân hệ đang được hoàn thiện
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              NovaStay sắp mở thêm phân hệ quản trị lưu trú thông minh.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Chúng tôi đang hoàn thiện trải nghiệm cho các mô hình nhà nghỉ, khách sạn, homestay và hệ sinh thái AI. Mục tiêu là giúp chủ cơ sở quản lý phòng, hợp đồng, thanh toán, bảo trì và cư dân trong một nền tảng thống nhất.
            </p>

            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {countdownLabels.map(([key, label]) => (
                <div
                  key={key}
                  className="rounded-3xl border border-slate-200 bg-white/75 p-4 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur"
                >
                  <strong className={`block text-3xl font-black ${key === 'seconds' ? 'text-sky-600' : 'text-slate-950'}`}>
                    {String(timeLeft[key]).padStart(2, '0')}
                  </strong>
                  <span className="mt-1 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSubscribe}
              className="luxury-subscribe-panel mt-8 flex max-w-2xl flex-col gap-3 rounded-[28px] border border-slate-200 bg-white/80 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur sm:flex-row"
            >
              <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <Mail className="h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email của bạn"
                  disabled={isSubscribed}
                  className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubscribed}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white transition ${
                  isSubscribed ? 'bg-emerald-500' : 'bg-sky-600 hover:bg-sky-700'
                }`}
              >
                <Bell className="h-4 w-4" />
                {isSubscribed ? 'Đã đăng ký nhận tin' : 'Nhận thông báo'}
              </button>
            </form>

            {isSubscribed ? (
              <div className="luxury-success-toast mt-4 max-w-2xl rounded-3xl border border-emerald-200 bg-emerald-50/90 px-5 py-4 text-sm font-semibold text-emerald-800 shadow-[0_20px_60px_rgba(16,185,129,0.18)]">
                NovaStay đã ghi nhận email của bạn. Chúng tôi sẽ gửi thông báo khi phân hệ sẵn sàng.
              </div>
            ) : null}
          </section>

          <section className="relative">
            <div className="luxury-alert-rail" aria-label="Thông báo vận hành NovaStay">
              {luxuryNotifications.map(({ icon: Icon, title, text, tone }, index) => (
                <article
                  key={title}
                  className={`luxury-alert-card luxury-alert-${tone}`}
                  style={{ '--alert-delay': `${index * 0.75}s` }}
                >
                  <span className="luxury-alert-icon">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                  <span className="luxury-live-dot" />
                </article>
              ))}
            </div>

            <div className="rounded-[34px] border border-white/80 bg-white/75 p-5 shadow-[0_30px_90px_rgba(15,23,42,0.14)] backdrop-blur-xl">
              <div className="luxury-preview-shell rounded-[26px] border border-slate-200 bg-slate-950 p-5 text-white shadow-inner">
                <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                      NovaStay Control Center
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">Bản xem trước phân hệ</h2>
                  </div>
                  <Sparkles className="h-6 w-6 text-amber-300" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {launchFeatures.map(({ icon: Icon, title, text }) => (
                    <article
                      key={title}
                      className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 transition hover:border-sky-300/60 hover:bg-sky-400/10"
                    >
                      <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-200">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="text-base font-bold">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                    </article>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: ShieldCheck, label: 'Dữ liệu tenant tách biệt' },
                    { icon: CreditCard, label: 'Đối soát thanh toán' },
                    { icon: FileSignature, label: 'Hợp đồng và ký số' },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 text-xs font-semibold text-slate-200"
                    >
                      <Icon className="h-4 w-4 text-amber-300" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden rounded-3xl border border-sky-100 bg-white p-4 shadow-[0_24px_70px_rgba(14,165,233,0.18)] sm:block">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <KeyRound className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-950">Sẵn sàng tích hợp</p>
                  <p className="text-xs text-slate-500">Phòng, cư dân, công nợ, bảo trì</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
