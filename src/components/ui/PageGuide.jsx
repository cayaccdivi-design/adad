import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, ChevronDown, X, Sparkles } from 'lucide-react'

/**
 * PageGuide — banner hướng dẫn xuất hiện ở đầu mỗi trang.
 *
 * Props:
 * - id            : key duy nhất, dùng để lưu trạng thái thu gọn vào localStorage
 * - title         : tiêu đề hướng dẫn
 * - subtitle      : mô tả ngắn
 * - steps         : mảng { icon: emoji|node, title, desc }
 * - tone          : 'purple' | 'cyan' | 'pink' | 'green' | 'orange' (mặc định 'purple')
 * - dismissible   : có nút X tắt hẳn (mặc định true)
 */
export default function PageGuide({
  id = 'guide',
  title = 'Hướng dẫn nhanh',
  subtitle,
  steps = [],
  tone = 'purple',
  dismissible = true,
}) {
  const COLLAPSE_KEY = `nova_guide_collapsed_${id}`
  const DISMISS_KEY  = `nova_guide_dismissed_${id}`

  const [collapsed, setCollapsed] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1')
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1')
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    try { localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0') } catch {}
  }

  const dismiss = () => {
    setDismissed(true)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
  }

  if (dismissed) return null

  const tones = {
    purple: { from: '#6e4bff', to: '#4dd0ff', text: '#a78bfa', icon: 'rgba(110,75,255,0.25)', border: 'rgba(110,75,255,0.3)' },
    cyan:   { from: '#0ea5e9', to: '#2bf2c0', text: '#67e8f9', icon: 'rgba(77,208,255,0.25)',  border: 'rgba(77,208,255,0.3)' },
    pink:   { from: '#ec4899', to: '#8b5cf6', text: '#f9a8d4', icon: 'rgba(236,72,153,0.25)',  border: 'rgba(236,72,153,0.3)' },
    green:  { from: '#10b981', to: '#2bf2c0', text: '#6ee7b7', icon: 'rgba(16,185,129,0.25)',  border: 'rgba(16,185,129,0.3)' },
    orange: { from: '#f59e0b', to: '#ef4444', text: '#fcd34d', icon: 'rgba(245,158,11,0.25)',  border: 'rgba(245,158,11,0.3)' },
  }
  const c = tones[tone] || tones.purple

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl mb-6"
      style={{
        background: `linear-gradient(135deg, ${c.from}1f, ${c.to}10)`,
        border: `1px solid ${c.border}`,
        backdropFilter: 'blur(24px) saturate(180%)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}>
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${c.from}, ${c.to}, transparent)` }} />
      {/* Particle bg */}
      <div className="absolute inset-0 bg-particles opacity-40 pointer-events-none" />
      {/* Glow blob */}
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${c.from}40 0%, transparent 70%)` }} />

      {/* Header */}
      <div className="relative flex items-start gap-3 p-4 sm:p-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 pulse-ring"
          style={{ background: c.icon, border: `1px solid ${c.border}`, color: c.text }}>
          <Lightbulb size={18} className="icon-float" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-white text-sm sm:text-base">{title}</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: c.icon, color: c.text, border: `1px solid ${c.border}` }}>
              <Sparkles size={9} /> HƯỚNG DẪN
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-white/55 mt-1 leading-relaxed">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={toggleCollapse}
            title={collapsed ? 'Mở rộng' : 'Thu gọn'}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
            <motion.div animate={{ rotate: collapsed ? -90 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown size={16} />
            </motion.div>
          </button>
          {dismissible && (
            <button onClick={dismiss}
              title="Đóng hướng dẫn"
              className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Steps */}
      <AnimatePresence initial={false}>
        {!collapsed && steps.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 0.8, 0.22, 1] }}
            className="overflow-hidden">
            <div className="relative px-4 sm:px-5 pb-5">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative flex gap-3 p-3 rounded-xl group transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}>
                    {/* Step number */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{
                          background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
                          color: '#fff',
                          boxShadow: `0 4px 12px ${c.from}55`,
                        }}>
                        {i + 1}
                      </div>
                      <div className="text-base">
                        {typeof step.icon === 'string' ? <span>{step.icon}</span> : step.icon}
                      </div>
                    </div>
                    {/* Content */}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white/90 leading-snug">{step.title}</p>
                      {step.desc && (
                        <p className="text-[11px] text-white/45 leading-relaxed mt-0.5">{step.desc}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
