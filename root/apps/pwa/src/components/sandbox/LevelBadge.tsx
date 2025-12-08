import { Level } from '@/lib/sandbox/types';

interface LevelBadgeProps {
  level: Level;
  size?: 'sm' | 'md' | 'lg';
}

export function LevelBadge({ level, size = 'md' }: LevelBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className={`${level.badge.color} rounded-lg inline-flex items-center gap-2 ${sizeClasses[size]}`}>
      <i className={`fa-solid ${level.badge.icon}`}></i>
      <div className="text-white">
        <p className="font-bold">Lvl {level.level}</p>
        <p className="text-xs opacity-90">{level.title}</p>
      </div>
    </div>
  );
}