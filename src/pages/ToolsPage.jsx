import { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wrench, Palette, QrCode, Image as ImageIcon, Type, Code2,
  Hash, Pipette, Sparkles, Copy, Check, Download, Upload,
  Shuffle, RotateCw, FileText, Lock, Unlock, ArrowRight, X,
} from 'lucide-react'
import PageGuide from '../components/ui/PageGuide'
import AnimatedTitle from '../components/ui/AnimatedTitle'
import { useAppStore } from '../store/useAppStore'

/* ─── Helpers ───────────────────────────────────────────── */
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  if (full.length !== 6) return null
  const num = parseInt(full, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')
}
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s, l = (max + min) / 2
  if (max === min) { h = s = 0 }
  else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}
function copyText(s, toast) {
  navigator.clipboard?.writeText(s).then(() => toast?.(`Đã sao chép`, 'success'))
}

/* ─── Tool wrapper card ─────────────────────────────────── */
function ToolCard({ icon: Icon, title, desc, color, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden tilt-3d"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
      }}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full p-4 flex items-center gap-3 text-left group hover:bg-white/[0.02] transition-colors">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 pulse-ring"
          style={{ background: `${color}22`, border: `1px solid ${color}50`, color }}>
          <Icon size={18} className="icon-glow" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-[11px] text-white/45 truncate">{desc}</p>
        </div>
        <motion.div animate={{ rotate: open ? 90 : 0 }} className="text-white/40">
          <ArrowRight size={16} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="px-4 pb-4 pt-1 border-t border-white/[0.05]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── 1. Color Picker + Palette ─────────────────────────── */
function ColorPickerTool({ toast }) {
  const [color, setColor] = useState('#6e4bff')
  const rgb = hexToRgb(color) || { r: 0, g: 0, b: 0 }
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

  // Generate harmonious palette: shades + complementary
  const palette = useMemo(() => {
    const shades = [-40, -20, 0, 20, 40].map(off => {
      const newL = Math.max(5, Math.min(95, hsl.l + off))
      return { mode: 'shade', label: `L${newL}`, hsl: `hsl(${hsl.h},${hsl.s}%,${newL}%)` }
    })
    const harmonies = [
      { mode: 'analog', label: 'Analog', hsl: `hsl(${(hsl.h + 30) % 360},${hsl.s}%,${hsl.l}%)` },
      { mode: 'comp',   label: 'Comp',   hsl: `hsl(${(hsl.h + 180) % 360},${hsl.s}%,${hsl.l}%)` },
      { mode: 'triad',  label: 'Triad',  hsl: `hsl(${(hsl.h + 120) % 360},${hsl.s}%,${hsl.l}%)` },
    ]
    return [...shades, ...harmonies]
  }, [hsl.h, hsl.s, hsl.l])

  return (
    <div className="space-y-3 mt-3">
      <div className="flex items-center gap-3">
        <input type="color" value={color} onChange={e => setColor(e.target.value)}
          className="w-16 h-16 rounded-xl border-2 border-white/10 cursor-pointer bg-transparent" />
        <div className="flex-1 grid grid-cols-3 gap-2 text-xs">
          <button onClick={() => copyText(color, toast)}
            className="px-2.5 py-2 rounded-lg text-left transition-all hover:bg-white/[0.06]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] text-white/40 uppercase">HEX</p>
            <p className="text-white/85 font-mono">{color.toUpperCase()}</p>
          </button>
          <button onClick={() => copyText(`rgb(${rgb.r},${rgb.g},${rgb.b})`, toast)}
            className="px-2.5 py-2 rounded-lg text-left transition-all hover:bg-white/[0.06]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] text-white/40 uppercase">RGB</p>
            <p className="text-white/85 font-mono text-[11px]">{rgb.r},{rgb.g},{rgb.b}</p>
          </button>
          <button onClick={() => copyText(`hsl(${hsl.h},${hsl.s}%,${hsl.l}%)`, toast)}
            className="px-2.5 py-2 rounded-lg text-left transition-all hover:bg-white/[0.06]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] text-white/40 uppercase">HSL</p>
            <p className="text-white/85 font-mono text-[11px]">{hsl.h},{hsl.s}%,{hsl.l}%</p>
          </button>
        </div>
      </div>
      <div>
        <p className="text-[11px] text-white/40 mb-2">Bảng màu hài hòa (click để copy):</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {palette.map((p, i) => (
            <button key={i}
              onClick={() => copyText(p.hsl, toast)}
              title={p.label}
              className="aspect-square rounded-lg transition-transform hover:scale-110 relative group"
              style={{ background: p.hsl, border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="absolute inset-x-0 bottom-0 text-[8px] text-white/0 group-hover:text-white/90 bg-black/50 backdrop-blur-sm rounded-b-lg py-0.5 transition-all">
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── 2. Gradient Generator ─────────────────────────────── */
function GradientTool({ toast }) {
  const [c1, setC1] = useState('#6e4bff')
  const [c2, setC2] = useState('#4dd0ff')
  const [c3, setC3] = useState('#2bf2c0')
  const [angle, setAngle] = useState(135)
  const [useThird, setUseThird] = useState(true)

  const gradient = useThird
    ? `linear-gradient(${angle}deg, ${c1}, ${c2}, ${c3})`
    : `linear-gradient(${angle}deg, ${c1}, ${c2})`

  const css = `background: ${gradient};`

  const presets = [
    ['#ff2e63', '#7c5cff', '#08d9d6'],
    ['#0f2027', '#2c5364', '#00d9f5'],
    ['#ff5e62', '#ff9966', null],
    ['#2bf2c0', '#4dd0ff', '#7c5cff'],
    ['#ec4899', '#8b5cf6', null],
    ['#f59e0b', '#ef4444', null],
  ]

  const randomize = () => {
    const rnd = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    setC1(rnd()); setC2(rnd())
    if (useThird) setC3(rnd())
    setAngle(Math.floor(Math.random() * 360))
  }

  return (
    <div className="space-y-3 mt-3">
      <div className="h-32 rounded-xl border border-white/10" style={{ background: gradient }} />
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-[10px] text-white/40 mb-1">Màu 1</p>
          <input type="color" value={c1} onChange={e => setC1(e.target.value)}
            className="w-full h-9 rounded-lg cursor-pointer bg-transparent border border-white/10" />
        </div>
        <div>
          <p className="text-[10px] text-white/40 mb-1">Màu 2</p>
          <input type="color" value={c2} onChange={e => setC2(e.target.value)}
            className="w-full h-9 rounded-lg cursor-pointer bg-transparent border border-white/10" />
        </div>
        <div className={!useThird ? 'opacity-40 pointer-events-none' : ''}>
          <p className="text-[10px] text-white/40 mb-1">Màu 3</p>
          <input type="color" value={c3} onChange={e => setC3(e.target.value)}
            className="w-full h-9 rounded-lg cursor-pointer bg-transparent border border-white/10" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
          <input type="checkbox" checked={useThird} onChange={e => setUseThird(e.target.checked)} />
          3 màu
        </label>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-white/40">Góc:</span>
          <input type="range" min="0" max="360" value={angle}
            onChange={e => setAngle(parseInt(e.target.value))}
            className="flex-1" />
          <span className="text-xs text-white/70 w-10 text-right font-mono">{angle}°</span>
        </div>
      </div>
      <div>
        <p className="text-[10px] text-white/40 mb-1.5">Preset:</p>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p, i) => (
            <button key={i}
              onClick={() => { setC1(p[0]); setC2(p[1]); if (p[2]) { setC3(p[2]); setUseThird(true) } else setUseThird(false) }}
              className="w-12 h-8 rounded-lg border border-white/10 hover:scale-110 transition-transform"
              style={{ background: `linear-gradient(135deg, ${p.filter(Boolean).join(',')})` }} />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={randomize}
          className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-white/70 transition-all flex items-center justify-center gap-1.5"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Shuffle size={12} /> Ngẫu nhiên
        </button>
        <button onClick={() => copyText(css, toast)}
          className="flex-1 btn-neon px-3 py-2 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5">
          <Copy size={12} /> Copy CSS
        </button>
      </div>
      <pre className="p-2.5 rounded-lg text-[11px] text-white/60 font-mono overflow-x-auto"
        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {css}
      </pre>
    </div>
  )
}

/* ─── 3. Image Resizer ──────────────────────────────────── */
function ImageResizerTool({ toast }) {
  const [src, setSrc] = useState(null)
  const [origSize, setOrigSize] = useState({ w: 0, h: 0 })
  const [target, setTarget] = useState({ w: 800, h: 600 })
  const [keepRatio, setKeepRatio] = useState(true)
  const [quality, setQuality] = useState(85)
  const [format, setFormat] = useState('image/jpeg')
  const [outUrl, setOutUrl] = useState(null)
  const [outSize, setOutSize] = useState(0)
  const fileRef = useRef(null)

  const onFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { toast?.('Vui lòng chọn file ảnh', 'error'); return }
    const url = URL.createObjectURL(file)
    setSrc(url)
    setOutUrl(null)
    const img = new Image()
    img.onload = () => {
      setOrigSize({ w: img.width, h: img.height })
      setTarget({ w: img.width, h: img.height })
    }
    img.src = url
  }

  const updateW = (w) => {
    if (keepRatio && origSize.w) {
      const h = Math.round(w * (origSize.h / origSize.w))
      setTarget({ w, h })
    } else setTarget(t => ({ ...t, w }))
  }
  const updateH = (h) => {
    if (keepRatio && origSize.h) {
      const w = Math.round(h * (origSize.w / origSize.h))
      setTarget({ w, h })
    } else setTarget(t => ({ ...t, h }))
  }

  const process = () => {
    if (!src) return
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = target.w
      canvas.height = target.h
      const ctx = canvas.getContext('2d')
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, target.w, target.h)
      }
      ctx.drawImage(img, 0, 0, target.w, target.h)
      canvas.toBlob(blob => {
        if (!blob) return
        if (outUrl) URL.revokeObjectURL(outUrl)
        setOutUrl(URL.createObjectURL(blob))
        setOutSize(blob.size)
        toast?.('Đã xử lý ảnh', 'success')
      }, format, quality / 100)
    }
    img.src = src
  }

  const download = () => {
    if (!outUrl) return
    const a = document.createElement('a')
    a.href = outUrl
    a.download = `nova-resized-${Date.now()}.${format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png'}`
    a.click()
  }

  return (
    <div className="space-y-3 mt-3">
      <input ref={fileRef} type="file" accept="image/*" hidden
        onChange={e => onFile(e.target.files?.[0])} />
      {!src ? (
        <button onClick={() => fileRef.current?.click()}
          className="w-full py-8 rounded-xl border-2 border-dashed border-white/15 hover:border-brand-400/50 transition-all flex flex-col items-center gap-2 text-white/50 hover:text-white">
          <Upload size={20} className="icon-float" />
          <span className="text-sm font-medium">Chọn ảnh để bắt đầu</span>
          <span className="text-[11px] text-white/35">Hỗ trợ JPG, PNG, WebP</span>
        </button>
      ) : (
        <>
          <div className="rounded-xl overflow-hidden border border-white/10"
            style={{ background: 'rgba(0,0,0,0.3)' }}>
            <img src={outUrl || src} alt="preview"
              className="max-h-44 mx-auto block" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] text-white/40 mb-1">Rộng (px)</p>
              <input type="number" value={target.w}
                onChange={e => updateW(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 rounded-lg text-xs text-white/80 outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
            <div>
              <p className="text-[10px] text-white/40 mb-1">Cao (px)</p>
              <input type="number" value={target.h}
                onChange={e => updateH(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 rounded-lg text-xs text-white/80 outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
            <input type="checkbox" checked={keepRatio} onChange={e => setKeepRatio(e.target.checked)} />
            Giữ tỉ lệ ({origSize.w}×{origSize.h})
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] text-white/40 mb-1">Định dạng</p>
              <select value={format} onChange={e => setFormat(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg text-xs text-white/80 outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <option value="image/jpeg" style={{ background: '#0c0c14' }}>JPEG</option>
                <option value="image/png" style={{ background: '#0c0c14' }}>PNG</option>
                <option value="image/webp" style={{ background: '#0c0c14' }}>WebP</option>
              </select>
            </div>
            <div>
              <p className="text-[10px] text-white/40 mb-1">Chất lượng: {quality}%</p>
              <input type="range" min="10" max="100" value={quality}
                onChange={e => setQuality(parseInt(e.target.value))} className="w-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setSrc(null); setOutUrl(null) }}
              className="px-3 py-2 rounded-lg text-xs text-white/55 transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <X size={12} />
            </button>
            <button onClick={process}
              className="flex-1 btn-neon px-3 py-2 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5">
              <RotateCw size={12} /> Xử lý
            </button>
            {outUrl && (
              <button onClick={download}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5"
                style={{ background: 'linear-gradient(135deg,#10b981,#2bf2c0)' }}>
                <Download size={12} /> Tải xuống
              </button>
            )}
          </div>
          {outUrl && (
            <p className="text-[11px] text-emerald-400/80 text-center">
              Output: {(outSize / 1024).toFixed(1)} KB ({target.w}×{target.h})
            </p>
          )}
        </>
      )}
    </div>
  )
}

/* ─── 4. QR Code Generator ──────────────────────────────── */
function QrCodeTool({ toast }) {
  const [text, setText] = useState('https://nova-ai-studio.com')
  const [size, setSize] = useState(300)
  const [color, setColor] = useState('6e4bff')
  const [bg, setBg] = useState('ffffff')

  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${color}&bgcolor=${bg}&qzone=2`

  const download = async () => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `nova-qr-${Date.now()}.png`
      a.click()
      toast?.('Đã tải QR code', 'success')
    } catch {
      toast?.('Không thể tải QR', 'error')
    }
  }

  return (
    <div className="space-y-3 mt-3">
      <textarea value={text} onChange={e => setText(e.target.value)}
        rows={2}
        placeholder="Nhập URL hoặc text..."
        className="w-full px-3 py-2 rounded-lg text-xs text-white/80 outline-none resize-none"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-[10px] text-white/40 mb-1">Màu QR</p>
          <input type="color" value={`#${color}`} onChange={e => setColor(e.target.value.replace('#', ''))}
            className="w-full h-9 rounded-lg cursor-pointer bg-transparent border border-white/10" />
        </div>
        <div>
          <p className="text-[10px] text-white/40 mb-1">Màu nền</p>
          <input type="color" value={`#${bg}`} onChange={e => setBg(e.target.value.replace('#', ''))}
            className="w-full h-9 rounded-lg cursor-pointer bg-transparent border border-white/10" />
        </div>
        <div>
          <p className="text-[10px] text-white/40 mb-1">Size: {size}px</p>
          <input type="range" min="100" max="600" step="50" value={size}
            onChange={e => setSize(parseInt(e.target.value))} className="w-full mt-2" />
        </div>
      </div>
      {text && (
        <div className="flex justify-center p-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <img src={url} alt="QR" className="max-w-[180px] rounded-lg" />
        </div>
      )}
      <button onClick={download}
        className="w-full btn-neon px-3 py-2 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5">
        <Download size={12} /> Tải QR Code
      </button>
    </div>
  )
}

/* ─── 5. Text Stylizer (Unicode) ────────────────────────── */
function TextStylizerTool({ toast }) {
  const [text, setText] = useState('NOVA Studio')

  const stylize = (str, mode) => {
    const ranges = {
      bold: { A: 0x1D400, a: 0x1D41A, '0': 0x1D7CE },
      italic: { A: 0x1D434, a: 0x1D44E },
      boldItalic: { A: 0x1D468, a: 0x1D482 },
      mono: { A: 0x1D670, a: 0x1D68A, '0': 0x1D7F6 },
      serif: { A: 0x1D504, a: 0x1D51E },
      script: { A: 0x1D49C, a: 0x1D4B6 },
      double: { A: 0x1D538, a: 0x1D552, '0': 0x1D7D8 },
    }
    const r = ranges[mode]
    if (!r) return str
    return str.split('').map(ch => {
      const code = ch.charCodeAt(0)
      if (code >= 65 && code <= 90 && r.A) return String.fromCodePoint(r.A + (code - 65))
      if (code >= 97 && code <= 122 && r.a) return String.fromCodePoint(r.a + (code - 97))
      if (code >= 48 && code <= 57 && r['0']) return String.fromCodePoint(r['0'] + (code - 48))
      return ch
    }).join('')
  }

  const styles = [
    { mode: 'bold',       label: '𝐁𝐨𝐥𝐝' },
    { mode: 'italic',     label: '𝐼𝑡𝑎𝑙𝑖𝑐' },
    { mode: 'boldItalic', label: '𝑩𝒐𝒍𝒅 𝑰𝒕𝒂𝒍𝒊𝒄' },
    { mode: 'mono',       label: '𝙼𝚘𝚗𝚘' },
    { mode: 'serif',      label: '𝔖𝔢𝔯𝔦𝔣' },
    { mode: 'script',     label: '𝒮𝒸𝓇𝒾𝓅𝓉' },
    { mode: 'double',     label: '𝔻𝕠𝕦𝕓𝕝𝕖' },
  ]

  return (
    <div className="space-y-3 mt-3">
      <input type="text" value={text} onChange={e => setText(e.target.value)}
        placeholder="Nhập text..."
        className="w-full px-3 py-2 rounded-lg text-sm text-white/85 outline-none"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
      <div className="space-y-2">
        {styles.map(s => {
          const out = stylize(text, s.mode)
          return (
            <button key={s.mode}
              onClick={() => copyText(out, toast)}
              className="w-full px-3 py-2.5 rounded-lg flex items-center justify-between gap-2 transition-all hover:bg-white/[0.06] group"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-[10px] text-white/40 mb-0.5">{s.label}</p>
                <p className="text-sm text-white/85 truncate">{out}</p>
              </div>
              <Copy size={14} className="text-white/30 group-hover:text-white/70 flex-shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── 6. Base64 Encoder/Decoder ─────────────────────────── */
function Base64Tool({ toast }) {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('encode')

  const output = useMemo(() => {
    try {
      if (!input) return ''
      if (mode === 'encode') return btoa(unescape(encodeURIComponent(input)))
      return decodeURIComponent(escape(atob(input)))
    } catch { return '⚠ Đầu vào không hợp lệ' }
  }, [input, mode])

  return (
    <div className="space-y-3 mt-3">
      <div className="flex gap-1.5">
        {['encode', 'decode'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: mode === m ? 'rgba(110,75,255,0.2)' : 'rgba(255,255,255,0.04)',
              border: mode === m ? '1px solid rgba(110,75,255,0.5)' : '1px solid rgba(255,255,255,0.07)',
              color: mode === m ? 'rgba(167,139,250,1)' : 'rgba(255,255,255,0.5)',
            }}>
            {m === 'encode' ? <><Lock size={11} className="inline mr-1" /> Encode</> : <><Unlock size={11} className="inline mr-1" /> Decode</>}
          </button>
        ))}
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)}
        placeholder={mode === 'encode' ? 'Nhập text cần mã hóa...' : 'Nhập chuỗi base64...'}
        rows={3}
        className="w-full px-3 py-2 rounded-lg text-xs text-white/80 outline-none resize-none font-mono"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
      <div className="relative">
        <textarea value={output} readOnly rows={3}
          placeholder="Kết quả..."
          className="w-full px-3 py-2 rounded-lg text-xs text-white/80 outline-none resize-none font-mono"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }} />
        {output && (
          <button onClick={() => copyText(output, toast)}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 transition-all">
            <Copy size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── 7. Lorem Ipsum Generator ──────────────────────────── */
function LoremTool({ toast }) {
  const [count, setCount] = useState(3)
  const [type, setType] = useState('paragraphs')

  const words = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ')

  const text = useMemo(() => {
    const rand = (n) => Math.floor(Math.random() * n)
    const sentence = (len) => {
      const arr = []
      for (let i = 0; i < len; i++) arr.push(words[rand(words.length)])
      return arr[0][0].toUpperCase() + arr.join(' ').slice(1) + '.'
    }
    if (type === 'words') return Array.from({ length: count }, () => words[rand(words.length)]).join(' ')
    if (type === 'sentences') return Array.from({ length: count }, () => sentence(8 + rand(10))).join(' ')
    return Array.from({ length: count }, () =>
      Array.from({ length: 3 + rand(3) }, () => sentence(8 + rand(10))).join(' ')
    ).join('\n\n')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, type])

  return (
    <div className="space-y-3 mt-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-white/40 mb-1">Loại</p>
          <select value={type} onChange={e => setType(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg text-xs text-white/80 outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <option value="paragraphs" style={{ background: '#0c0c14' }}>Đoạn văn</option>
            <option value="sentences" style={{ background: '#0c0c14' }}>Câu</option>
            <option value="words" style={{ background: '#0c0c14' }}>Từ</option>
          </select>
        </div>
        <div>
          <p className="text-[10px] text-white/40 mb-1">Số lượng: {count}</p>
          <input type="range" min="1" max="20" value={count}
            onChange={e => setCount(parseInt(e.target.value))} className="w-full mt-2" />
        </div>
      </div>
      <textarea value={text} readOnly rows={6}
        className="w-full px-3 py-2 rounded-lg text-xs text-white/80 outline-none resize-none"
        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }} />
      <button onClick={() => copyText(text, toast)}
        className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-white/80 flex items-center justify-center gap-1.5"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Copy size={12} /> Sao chép
      </button>
    </div>
  )
}

/* ─── 8. Hash / Counter ─────────────────────────────────── */
function CounterTool() {
  const [text, setText] = useState('')
  const stats = useMemo(() => ({
    chars: text.length,
    charsNoSpace: text.replace(/\s/g, '').length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text.split('\n').length,
    sentences: text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0,
  }), [text])

  return (
    <div className="space-y-3 mt-3">
      <textarea value={text} onChange={e => setText(e.target.value)}
        placeholder="Dán hoặc gõ text vào đây..."
        rows={4}
        className="w-full px-3 py-2 rounded-lg text-xs text-white/80 outline-none resize-none"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
      <div className="grid grid-cols-5 gap-2">
        {[
          { l: 'Ký tự', v: stats.chars, c: '#6e4bff' },
          { l: 'Không space', v: stats.charsNoSpace, c: '#0ea5e9' },
          { l: 'Từ', v: stats.words, c: '#10b981' },
          { l: 'Câu', v: stats.sentences, c: '#f59e0b' },
          { l: 'Dòng', v: stats.lines, c: '#ec4899' },
        ].map(s => (
          <div key={s.l} className="rounded-lg p-2 text-center"
            style={{ background: `${s.c}15`, border: `1px solid ${s.c}30` }}>
            <p className="text-base font-display font-bold text-white">{s.v}</p>
            <p className="text-[9px] text-white/45 mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Main Tools Page ───────────────────────────────────── */
export default function ToolsPage() {
  const { toast } = useAppStore()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageGuide
        id="tools"
        title="Bộ công cụ tiện ích miễn phí"
        subtitle="Các công cụ nhỏ chạy trực tiếp trên trình duyệt — không upload server, dữ liệu của bạn an toàn 100%."
        tone="cyan"
        steps={[
          { icon: '🛠️', title: 'Chọn công cụ',  desc: 'Click vào bất kỳ công cụ nào để mở rộng và sử dụng.' },
          { icon: '⚡', title: 'Xử lý nhanh',     desc: 'Tất cả tools chạy trên máy bạn, không cần upload.' },
          { icon: '📋', title: 'Sao chép kết quả', desc: 'Bấm nút copy hoặc click trực tiếp vào kết quả để sao chép.' },
          { icon: '⬇️', title: 'Tải xuống',       desc: 'Một số tool hỗ trợ tải kết quả về máy (ảnh, QR...).' },
        ]}
      />

      <AnimatedTitle
        icon={Wrench}
        title="Tools — Bộ công cụ"
        subtitle="8 công cụ tiện lợi cho designer & developer"
        badge={{ label: 'NEW' }}
        tone="cyan"
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <ToolCard icon={Palette} title="Color Picker & Palette"
          desc="Chọn màu, lấy mã HEX/RGB/HSL, gen palette hài hòa"
          color="#ec4899" defaultOpen>
          <ColorPickerTool toast={toast} />
        </ToolCard>

        <ToolCard icon={Sparkles} title="Gradient Generator"
          desc="Tạo gradient CSS đẹp mắt, copy code nhanh"
          color="#8b5cf6" defaultOpen>
          <GradientTool toast={toast} />
        </ToolCard>

        <ToolCard icon={ImageIcon} title="Image Resizer & Compressor"
          desc="Đổi kích thước, nén ảnh JPG/PNG/WebP"
          color="#0ea5e9">
          <ImageResizerTool toast={toast} />
        </ToolCard>

        <ToolCard icon={QrCode} title="QR Code Generator"
          desc="Tạo QR code cho URL, text, custom màu"
          color="#10b981">
          <QrCodeTool toast={toast} />
        </ToolCard>

        <ToolCard icon={Type} title="Text Stylizer"
          desc="Tạo chữ Unicode đẹp: bold, italic, script, double..."
          color="#f59e0b">
          <TextStylizerTool toast={toast} />
        </ToolCard>

        <ToolCard icon={Code2} title="Base64 Encoder/Decoder"
          desc="Mã hóa & giải mã chuỗi Base64 trên trình duyệt"
          color="#06b6d4">
          <Base64Tool toast={toast} />
        </ToolCard>

        <ToolCard icon={FileText} title="Lorem Ipsum Generator"
          desc="Sinh text mẫu nhanh để fill design"
          color="#a855f7">
          <LoremTool toast={toast} />
        </ToolCard>

        <ToolCard icon={Hash} title="Word & Character Counter"
          desc="Đếm ký tự, từ, dòng, câu trong văn bản"
          color="#ef4444">
          <CounterTool />
        </ToolCard>
      </div>
    </div>
  )
}
