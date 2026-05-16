import { motion } from 'framer-motion'

/**
 * AnimatedTitle — tiêu đề trang hiện đại có icon glow + animated gradient text.
 *
 * Props:
 * - icon       : lucide icon component
 * - title      : tiêu đề chính (sẽ render với gradient động)
 * - subtitle   : phụ đề
 * - badge      : { label, color? } - badge nhỏ bên cạnh
 * - tone       : 'purple' | 'cyan' | 'pink' | 'green' | 'orange'
 * - actions    : node — element render sang phải
 */
export default function AnimatedTitle({
  icon: Icon,
  title,
  subtitle,
  badge,
  tone = 'purple',
  actions,
}) {
  const tones = {
    purple: { from: '#6e4bff', to: '#4dd0ff', glow: 'rgba(110,75,255,0.55)', text: '#a78bfa' },
    cyan:   { from: '#0ea5e9', to: '#2bf2c0', glow: 'rgba(14,165,233,0.55)', text: '#67e8f9' },
    pink:   { from: '#ec4899', to: '#8b5cf6', glow: 'rgba(236,72,153,0.55)', text: '#f9a8d4' },
    green:  { from: '#10b981', to: '#2bf2c0', glow: 'rgba(16,185,129,0.55)', text: '#6ee7b7' },
    orange: { from: '#f59e0b', to: '#ef4444', glow: 'rgba(245,158,11,0.55)', text: '#fcd34d' },
  }
  const c = tones[tone] || tones.purple

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.22, 0.8, 0.22, 1] }}
      className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4 min-w-0">
        {Icon && (
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center pulse-ring"
              style={{
                background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
                color: c.text,
                boxShadow: `0 8px 24px ${c.glow}, inset 0 1px 0 rgba(255,255,255,0.25)`,
              }}>
              <Icon size={22} className="text-white drop-shadow icon-float" />
            </div>
            {/* Orbiting dot */}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ background: c.from, boxShadow: `0 0 12px ${c.glow}` }} />
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-xl sm:text-2xl font-bold leading-tight">
              <span className="grad-anim">{title}</span>
            </h1>
            {badge && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full chip-glow"
                style={{
                  background: `${c.from}25`,
                  color: c.text,
                  border: `1px solid ${c.from}50`,
                }}>
                {badge.label}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-white/45 mt-1 leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </motion.div>
  )
}
