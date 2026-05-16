import { motion } from 'framer-motion'
import { Code2, ExternalLink, GitBranch, FileCode, Package, Cpu } from 'lucide-react'

const TECH = [
  { name: 'React 18.3', desc: 'Component-based UI, hooks, concurrent mode', icon: Code2, color: '#61dafb' },
  { name: 'Vite 5', desc: 'Lightning-fast HMR, ESM-first bundler', icon: Cpu, color: '#646cff' },
  { name: 'Tailwind CSS 3', desc: 'Utility-first CSS framework, JIT compiler', icon: FileCode, color: '#38bdf8' },
  { name: 'Zustand 5', desc: 'Lightweight state management, no boilerplate', icon: Package, color: '#443d2e' },
  { name: 'Konva + react-konva', desc: 'HTML5 Canvas 2D rendering for PSD layers', icon: Code2, color: '#0ec462' },
  { name: '@webtoon/psd', desc: 'Pure JS PSD parser, runs in browser', icon: FileCode, color: '#ff6b6b' },
  { name: 'Framer Motion', desc: 'Production-ready animations & gestures', icon: Code2, color: '#ff0080' },
  { name: 'Lucide React', desc: '1000+ beautiful open-source icons', icon: Code2, color: '#f56565' },
]

const STRUCTURE = [
  { path: 'src/pages/', desc: 'Tất cả trang (Dashboard, Shop, PSD Editor, Collage...)' },
  { path: 'src/components/', desc: 'Components tái sử dụng (layout, psd, ui)' },
  { path: 'src/store/', desc: 'Zustand stores (auth, app, shop, chat)' },
  { path: 'src/utils/', desc: 'Utilities (PSD parser, font manager, history hook)' },
]

export default function SourcePage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="inline-flex items-center gap-2 badge mb-3">
          <Code2 size={13} /> Open Source
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Mã nguồn <span className="grad">NOVA AI Studio</span>
        </h1>
        <p className="text-white/40 text-sm">Kiến trúc, công nghệ và cấu trúc thư mục dự án</p>
      </motion.div>

      {/* Repo link */}
      <motion.a
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        href="https://github.com/cayaccdivi-design/adad"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 glass-card p-5 group"
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(110,75,255,0.15)', border: '1px solid rgba(110,75,255,0.3)' }}>
          <GitBranch size={20} className="text-brand-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white group-hover:text-brand-200 transition-colors">cayaccdivi-design/adad</p>
          <p className="text-xs text-white/40">GitHub Repository — React + Vite + Tailwind + Konva</p>
        </div>
        <ExternalLink size={16} className="text-white/30 group-hover:text-brand-400 transition-colors flex-shrink-0" />
      </motion.a>

      {/* Tech Stack */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="font-display text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Cpu size={16} className="text-cyan-400" /> Tech Stack
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {TECH.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 + 0.2 }}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${t.color}18`, border: `1px solid ${t.color}30` }}>
                <t.icon size={14} style={{ color: t.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">{t.name}</p>
                <p className="text-[10px] text-white/35 truncate">{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Project structure */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="font-display text-base font-semibold text-white mb-4 flex items-center gap-2">
          <FileCode size={16} className="text-emerald-400" /> Cấu trúc thư mục
        </h2>
        <div className="glass-card p-4 space-y-2">
          {STRUCTURE.map(s => (
            <div key={s.path} className="flex items-center gap-3 py-1.5">
              <code className="text-xs font-mono px-2 py-0.5 rounded-lg flex-shrink-0"
                style={{ background: 'rgba(110,75,255,0.12)', color: 'rgba(167,139,250,1)' }}>
                {s.path}
              </code>
              <span className="text-xs text-white/45">{s.desc}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Dependencies */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Package size={14} className="text-amber-400" /> Dependencies chính
        </h3>
        <div className="flex flex-wrap gap-2">
          {['react', 'react-dom', 'react-router-dom', 'zustand', 'konva', 'react-konva', '@webtoon/psd', 'framer-motion', 'lucide-react', 'clsx', 'tailwindcss', 'vite'].map(dep => (
            <span key={dep} className="text-[10px] px-2 py-1 rounded-lg font-mono"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
              {dep}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
