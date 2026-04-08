import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

type NoticeProps = {
  title: string;
  children: ReactNode;
  tone?: 'info' | 'error' | 'success';
};

const toneConfig = {
  info: {
    icon: Info,
    container: 'bg-sky-50 border-sky-200 text-sky-950',
    iconClass: 'text-sky-600',
  },
  error: {
    icon: AlertCircle,
    container: 'bg-rose-50 border-rose-200 text-rose-950',
    iconClass: 'text-rose-600',
  },
  success: {
    icon: CheckCircle2,
    container: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    iconClass: 'text-emerald-600',
  },
};

export default function Notice({ title, children, tone = 'info' }: NoticeProps) {
  const config = toneConfig[tone];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border p-4 ${config.container}`} role="status">
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${config.iconClass}`} />
        <div>
          <p className="font-semibold">{title}</p>
          <div className="mt-1 text-sm leading-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
