import { useState } from 'react';
import { getInitials } from '../lib/formatters';

type LawyerAvatarProps = {
  name: string;
  photoUrl?: string | null;
  className?: string;
  textClassName?: string;
};

export default function LawyerAvatar({
  name,
  photoUrl,
  className = 'w-24 h-24 rounded-xl',
  textClassName = 'text-lg',
}: LawyerAvatarProps) {
  const [showFallback, setShowFallback] = useState(!photoUrl);

  if (showFallback) {
    return (
      <div
        aria-hidden="true"
        className={`${className} flex items-center justify-center bg-slate-200 text-slate-700 font-semibold`}
      >
        <span className={textClassName}>{getInitials(name)}</span>
      </div>
    );
  }

  return (
    <img
      src={photoUrl ?? undefined}
      alt={name}
      className={`${className} object-cover`}
      onError={() => setShowFallback(true)}
    />
  );
}
