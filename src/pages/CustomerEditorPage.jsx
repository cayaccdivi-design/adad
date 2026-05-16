import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Group, Rect } from 'react-konva'
import {
  Download, ArrowLeft, Type, Image as ImageIcon, Upload, User, Star, AlertCircle,
  Undo2, Redo2, Eye, EyeOff, Copy, Trash2, AlignLeft, AlignCenter, AlignRight,
  AlignVerticalJustifyCenter, ZoomIn, ZoomOut, Maximize2, Bold, Italic, Underline,
  Layers as LayersIcon, RotateCw, Sliders, ChevronUp, ChevronDown, Lock, Unlock,
  Save, RefreshCw, Grid3x3, MoveUp, MoveDown, Sparkles,
} from 'lucide-react'
import { useShopStore } from '../store/useShopStore'
import { useAppStore } from '../store/useAppStore'
import { useAuthStore } from '../store/useAuthStore'
import PageGuide from '../components/ui/PageGuide'

// ── useKonvaImage hook ──────────────────────────────────────
function useKonvaImage(dataUrl) {
  const [img, setImg] = useState(null)
  useEffect(() => {
    if (!dataUrl) { setImg(null); return }
    const image = new window.Image()
    if (!dataUrl.startsWith('data:')) image.crossOrigin = 'anonymous'
    image.src = dataUrl
    image.onload = () => setImg(image)
  }, [dataUrl])
  return img
}

const FONT_FAMILIES = ['Inter', 'Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Impact', 'Courier New', 'Tahoma']
const EXPORT_COST = 30
const MAX_HISTORY = 50

/* ─── History hook for undo/redo ─────────────────────── */
function useHistory(initial) {
  const [history, setHistory] = useState([initial])
  const [index, setIndex] = useState(0)

  const present = history[index]
  const canUndo = index > 0
  const canRedo = index < history.length - 1

  const push = useCallback((next) => {
    setHistory(h => {
      const trimmed = h.slice(0, index + 1)
      const newHist = [...trimmed, next]
      return newHist.length > MAX_HISTORY ? newHist.slice(-MAX_HISTORY) : newHist
    })
    setIndex(i => Math.min(i + 1, MAX_HISTORY - 1))
  }, [index])

  const undo = useCallback(() => { if (canUndo) setIndex(i => i - 1) }, [canUndo])
  const redo = useCallback(() => { if (canRedo) setIndex(i => i + 1) }, [canRedo])
  const reset = useCallback((value) => { setHistory([value]); setIndex(0) }, [])

  return { present, push, undo, redo, canUndo, canRedo, reset }
}

/* ─── FieldInput ─────────────────────────────────────── */
function FieldInput({ field, value, onChange, textStyle, onTextStyleChange }) {
  const fileRef = useRef(null)
  const [showStyle, setShowStyle] = useState(false)
  const ts = textStyle || {}

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 12,
    color: 'rgba(255,255,255,0.85)',
    padding: '8px 12px',
    width: '100%',
    outline: 'none',
    fontSize: 13,
    resize: 'vertical',
  }

  const handleImageUpload = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange(ev.target.result)
    reader.readAsDataURL(f)
  }

  if (field.type === 'text') {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] text-white/40 uppercase tracking-wider flex items-center gap-1.5">
            <Type size={11} className="text-brand-400" /> {field.label}
          </label>
          <button onClick={() => setShowStyle(v => !v)}
            className="text-[10px] px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1"
            style={{ background: showStyle ? 'rgba(110,75,255,0.2)' : 'rgba(255,255,255,0.05)', color: showStyle ? '#a78bfa' : 'rgba(255,255,255,0.4)' }}>
            <Sliders size={9} /> {showStyle ? 'Ẩn' : 'Style'}
          </button>
        </div>
        <textarea value={value || ''} onChange={e => onChange(e.target.value)}
          rows={2} style={inputStyle}
          onFocus={e => e.target.style.borderColor = 'rgba(110,75,255,0.55)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'} />

        <AnimatePresence>
          {showStyle && onTextStyleChange && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="space-y-2 pt-1 overflow-hidden">
              {/* Font + size */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-white/30 mb-1">Font</p>
                  <select value={ts.fontFamily || 'Inter'}
                    onChange={e => onTextStyleChange({ fontFamily: e.target.value })}
                    className="w-full text-[11px] rounded-lg px-2 py-1.5 text-white/70 outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
                    {FONT_FAMILIES.map(f => <option key={f} value={f} style={{ background: '#0c0c14' }}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 mb-1">Cỡ chữ</p>
                  <input type="number" min={8} max={200}
                    value={ts.fontSize || 16}
                    onChange={e => onTextStyleChange({ fontSize: Number(e.target.value) })}
                    className="w-full text-[11px] rounded-lg px-2 py-1.5 text-white/70 outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }} />
                </div>
              </div>

              {/* Color + B/I/U */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-[10px] text-white/30 mb-1">Màu chữ</p>
                  <input type="color" value={ts.color || '#ffffff'}
                    onChange={e => onTextStyleChange({ color: e.target.value })}
                    className="w-full h-8 rounded-lg cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }} />
                </div>
                <div>
                  <p className="text-[10px] text-white/30 mb-1">Style</p>
                  <div className="flex gap-1">
                    <StyleBtn active={ts.bold} onClick={() => onTextStyleChange({ bold: !ts.bold })}><Bold size={11} /></StyleBtn>
                    <StyleBtn active={ts.italic} onClick={() => onTextStyleChange({ italic: !ts.italic })}><Italic size={11} /></StyleBtn>
                    <StyleBtn active={ts.underline} onClick={() => onTextStyleChange({ underline: !ts.underline })}><Underline size={11} /></StyleBtn>
                  </div>
                </div>
              </div>

              {/* Alignment */}
              <div>
                <p className="text-[10px] text-white/30 mb-1">Căn chỉnh</p>
                <div className="flex gap-1">
                  {['left', 'center', 'right'].map(a => (
                    <StyleBtn key={a} active={(ts.align || 'left') === a} onClick={() => onTextStyleChange({ align: a })}>
                      {a === 'left' ? <AlignLeft size={11} /> : a === 'center' ? <AlignCenter size={11} /> : <AlignRight size={11} />}
                    </StyleBtn>
                  ))}
                </div>
              </div>

              {/* Line height + Letter spacing */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-white/30 mb-1">Line height: {ts.lineHeight ?? 1.2}</p>
                  <input type="range" min="0.8" max="2.5" step="0.1"
                    value={ts.lineHeight ?? 1.2}
                    onChange={e => onTextStyleChange({ lineHeight: parseFloat(e.target.value) })}
                    className="w-full" />
                </div>
                <div>
                  <p className="text-[10px] text-white/30 mb-1">Khoảng cách: {ts.letterSpacing ?? 0}</p>
                  <input type="range" min="-5" max="20" step="0.5"
                    value={ts.letterSpacing ?? 0}
                    onChange={e => onTextStyleChange({ letterSpacing: parseFloat(e.target.value) })}
                    className="w-full" />
                </div>
              </div>

              {/* Stroke + Shadow */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] text-white/40">Viền chữ</p>
                    <input type="checkbox" checked={!!ts.stroke}
                      onChange={e => onTextStyleChange({ stroke: e.target.checked })} />
                  </div>
                  {ts.stroke && (
                    <div className="space-y-1">
                      <input type="color" value={ts.strokeColor || '#000000'}
                        onChange={e => onTextStyleChange({ strokeColor: e.target.value })}
                        className="w-full h-6 rounded cursor-pointer" />
                      <input type="range" min="0.5" max="10" step="0.5"
                        value={ts.strokeWidth ?? 2}
                        onChange={e => onTextStyleChange({ strokeWidth: parseFloat(e.target.value) })}
                        className="w-full" />
                    </div>
                  )}
                </div>
                <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] text-white/40">Đổ bóng</p>
                    <input type="checkbox" checked={!!ts.shadow}
                      onChange={e => onTextStyleChange({ shadow: e.target.checked })} />
                  </div>
                  {ts.shadow && (
                    <div className="space-y-1">
                      <input type="color" value={ts.shadowColor || '#000000'}
                        onChange={e => onTextStyleChange({ shadowColor: e.target.value })}
                        className="w-full h-6 rounded cursor-pointer" />
                      <input type="range" min="0" max="30" step="1"
                        value={ts.shadowBlur ?? 4}
                        onChange={e => onTextStyleChange({ shadowBlur: parseFloat(e.target.value) })}
                        className="w-full" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Image field
  const isCircle = field.role === 'avt_png'
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] text-white/40 uppercase tracking-wider flex items-center gap-1.5 block">
        {isCircle ? <User size={11} className="text-cyan-400" /> : <ImageIcon size={11} className="text-cyan-400" />}
        {field.label}
        {isCircle && <span className="text-[9px] text-cyan-500 ml-1">• Crop tròn</span>}
      </label>
      <div onClick={() => fileRef.current?.click()}
        className="flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer transition-all"
        style={{ border: '1px dashed rgba(77,208,255,0.3)', background: 'rgba(77,208,255,0.04)' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(77,208,255,0.6)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(77,208,255,0.3)'}>
        {value ? (
          <div className="flex items-center gap-3 w-full">
            <img src={value} alt={field.label}
              className="object-cover flex-shrink-0"
              style={{ width: 56, height: 56, borderRadius: isCircle ? '50%' : 8, border: '2px solid rgba(77,208,255,0.3)' }} />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/60">Ảnh đã tải lên</p>
              <p className="text-[10px] text-white/30 mt-0.5">Click để thay đổi</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onChange('') }}
              className="text-rose-400/60 hover:text-rose-400 p-1 rounded-lg transition-colors">
              <Trash2 size={12} />
            </button>
          </div>
        ) : (
          <>
            <Upload size={18} className="text-cyan-400/60" />
            <p className="text-xs text-white/40">Click để tải ảnh lên</p>
            <p className="text-[10px] text-white/25">PNG, JPG, WebP</p>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      </div>
    </div>
  )
}

function StyleBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className="w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center"
      style={{
        background: active ? 'rgba(110,75,255,0.3)' : 'rgba(255,255,255,0.06)',
        color: active ? '#a78bfa' : 'rgba(255,255,255,0.5)',
        border: '1px solid rgba(255,255,255,0.09)',
      }}>
      {children}
    </button>
  )
}

/* ─── Konva Overlays ─────────────────────────────────── */
function KonvaOverlayText({ field, value, scale, isSelected, onSelect, onDragEnd, textStyle, layerProps }) {
  const fontStyle = [
    (textStyle?.bold ?? field.bold) ? 'bold' : '',
    (textStyle?.italic ?? field.italic) ? 'italic' : ''
  ].filter(Boolean).join(' ') || 'normal'

  if (!value || layerProps?.hidden) return null

  return (
    <KonvaText
      text={value}
      x={(layerProps?.x ?? field.x ?? 0) * scale}
      y={(layerProps?.y ?? field.y ?? 0) * scale}
      width={(field.width || 200) * scale}
      fontFamily={textStyle?.fontFamily || field.fontFamily || 'Inter'}
      fontSize={((textStyle?.fontSize) || field.fontSize || 16) * scale}
      fill={textStyle?.color || field.color || '#ffffff'}
      fontStyle={fontStyle}
      align={textStyle?.align || 'left'}
      lineHeight={textStyle?.lineHeight ?? 1.2}
      letterSpacing={(textStyle?.letterSpacing ?? 0) * scale}
      textDecoration={textStyle?.underline ? 'underline' : ''}
      stroke={textStyle?.stroke ? (textStyle.strokeColor || '#000') : undefined}
      strokeWidth={textStyle?.stroke ? (textStyle.strokeWidth || 2) * scale : 0}
      shadowColor={textStyle?.shadow ? (textStyle.shadowColor || '#000') : undefined}
      shadowBlur={textStyle?.shadow ? (textStyle.shadowBlur || 4) * scale : 0}
      shadowOpacity={textStyle?.shadow ? 0.6 : 0}
      opacity={layerProps?.opacity ?? 1}
      rotation={layerProps?.rotation ?? 0}
      onClick={() => onSelect && onSelect(field.role)}
      onTap={() => onSelect && onSelect(field.role)}
      draggable={!layerProps?.locked}
      onDragEnd={e => onDragEnd && onDragEnd(field.role, e.target.x() / scale, e.target.y() / scale)}
    />
  )
}

function KonvaOverlayImage({ field, value, scale, isSelected, onSelect, onDragEnd, layerProps }) {
  const img = useKonvaImage(value)
  if (!img || layerProps?.hidden) return null

  const isCircle = field.shape === 'circle' || field.role === 'avt_png'
  const x = (layerProps?.x ?? field.x ?? 0) * scale
  const y = (layerProps?.y ?? field.y ?? 0) * scale
  const w = (field.width || 100) * scale
  const h = (field.height || 100) * scale

  return (
    <KonvaImage
      image={img}
      x={x} y={y} width={w} height={h}
      opacity={layerProps?.opacity ?? 1}
      rotation={layerProps?.rotation ?? 0}
      onClick={() => onSelect && onSelect(field.role)}
      onTap={() => onSelect && onSelect(field.role)}
      draggable={!layerProps?.locked}
      onDragEnd={e => onDragEnd && onDragEnd(field.role, e.target.x() / scale, e.target.y() / scale)}
      clipFunc={isCircle ? (ctx) => {
        const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
      } : undefined}
    />
  )
}

/* ─── Empty/Error views ──────────────────────────────── */
function NotFoundView({ onBack }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4" style={{ background: '#0a0a14' }}>
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <AlertCircle size={32} className="text-rose-400" />
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-white mb-2">Sản phẩm không tồn tại</h2>
        <p className="text-sm text-white/40">Sản phẩm này không được tìm thấy trong cửa hàng.</p>
      </div>
      <button onClick={onBack} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
        <ArrowLeft size={16} /> Quay lại cửa hàng
      </button>
    </div>
  )
}

function NotOwnedView({ onBuy }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4" style={{ background: '#0a0a14' }}>
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(110,75,255,0.1)', border: '1px solid rgba(110,75,255,0.2)' }}>
        <Star size={32} className="text-brand-400" />
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-white mb-2">Bạn chưa sở hữu sản phẩm này</h2>
        <p className="text-sm text-white/40">Hãy mua sản phẩm để sử dụng trình chỉnh sửa.</p>
      </div>
      <button onClick={onBuy} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
        <ArrowLeft size={16} /> Xem cửa hàng
      </button>
    </div>
  )
}

/* ─── Main Editor ────────────────────────────────────── */
export default function CustomerEditorPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const product = useShopStore(s => s.getProduct(productId))
  const { isOwned, toast } = useAppStore()
  const { user, deductBalance } = useAuthStore()
  const isAdmin = useAuthStore(s => s.isAdmin())

  const [hasPaid, setHasPaid] = useState(() => {
    try { return sessionStorage.getItem(`nova_paid_${productId}`) === '1' } catch { return false }
  })
  const [showPayModal, setShowPayModal] = useState(false)

  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const [containerSize, setContainerSize] = useState({ w: 800, h: 450 })
  const [selectedRole, setSelectedRole] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(false)
  const [showLayers, setShowLayers] = useState(true)

  // Initial state for history
  const initialState = useMemo(() => {
    const init = { customValues: {}, textStyles: {}, layerProps: {} }
    if (product?.editableFields) {
      for (const f of product.editableFields) {
        init.customValues[f.role] = f.defaultValue || ''
        init.layerProps[f.role] = { hidden: false, locked: false, opacity: 1, rotation: 0 }
      }
    }
    return init
  }, [product?.id])

  const { present, push, undo, redo, canUndo, canRedo, reset } = useHistory(initialState)
  const customValues = present.customValues
  const textStyles = present.textStyles
  const layerProps = present.layerProps

  // Backfill on product load
  useEffect(() => {
    if (!product?.editableFields) return
    const needsInit = product.editableFields.some(f => !(f.role in (customValues || {})))
    if (needsInit) reset(initialState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id])

  const bgImg = useKonvaImage(product?.previewDataUrl || null)

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height })
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo() }
      else if (e.key === 'Delete' && selectedRole) { e.preventDefault(); handleClearField(selectedRole) }
      else if (e.key === '+' || e.key === '=') { setZoom(z => Math.min(z + 0.1, 3)) }
      else if (e.key === '-') { setZoom(z => Math.max(z - 0.1, 0.3)) }
      else if (e.key === '0') { setZoom(1) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRole, undo, redo])

  const handleFieldChange = useCallback((role, value) => {
    push({ ...present, customValues: { ...present.customValues, [role]: value } })
  }, [present, push])

  const handleTextStyleChange = useCallback((role, changes) => {
    push({ ...present, textStyles: { ...present.textStyles, [role]: { ...(present.textStyles[role] || {}), ...changes } } })
  }, [present, push])

  const handleLayerPropChange = useCallback((role, changes) => {
    push({ ...present, layerProps: { ...present.layerProps, [role]: { ...(present.layerProps[role] || {}), ...changes } } })
  }, [present, push])

  const handleOverrideDragEnd = useCallback((role, x, y) => {
    push({ ...present, layerProps: { ...present.layerProps, [role]: { ...(present.layerProps[role] || {}), x, y } } })
  }, [present, push])

  const handleClearField = useCallback((role) => {
    push({ ...present, customValues: { ...present.customValues, [role]: '' } })
  }, [present, push])

  // Alignment helpers
  const handleAlignField = useCallback((role, alignment) => {
    if (!product) return
    const field = product.editableFields?.find(f => f.role === role)
    if (!field) return
    const prodW = product.width || 1920
    const prodH = product.height || 1080
    const fieldW = field.width || 200
    const fieldH = field.height || 50
    const current = present.layerProps[role] || {}
    let x = current.x ?? field.x ?? 0
    let y = current.y ?? field.y ?? 0
    if (alignment === 'left')   x = 20
    if (alignment === 'center') x = (prodW - fieldW) / 2
    if (alignment === 'right')  x = prodW - fieldW - 20
    if (alignment === 'middle') y = (prodH - fieldH) / 2
    push({ ...present, layerProps: { ...present.layerProps, [role]: { ...current, x, y } } })
  }, [product, present, push])

  const resetAll = useCallback(() => {
    if (!window.confirm('Reset toàn bộ thay đổi về mặc định?')) return
    reset(initialState)
    toast('Đã reset về mặc định', 'success')
  }, [initialState, reset, toast])

  const handleDownload = useCallback((force = false) => {
    if (!force && !isAdmin && !hasPaid) { setShowPayModal(true); return }

    const filename = `nova-custom-${product?.title?.replace(/\s+/g, '-') || 'design'}-${Date.now()}`
    const downloadDataUrl = (dataUrl, ext = 'png') => {
      const a = document.createElement('a'); a.href = dataUrl; a.download = `${filename}.${ext}`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
    }

    const downloadOriginal = () => {
      const srcUrl = (product?.images?.length > 0 ? product.images[0] : null) || product?.previewDataUrl
      if (srcUrl) { downloadDataUrl(srcUrl, 'png'); toast('Đã tải ảnh gốc!', 'success', 'Download') }
      else toast('Không có ảnh để tải', 'error', 'Lỗi')
    }

    const hasCustomValues = Object.values(customValues).some(v => v && v !== '')
    if (!product?.editableFields?.length || !hasCustomValues) { downloadOriginal(); return }
    if (!stageRef.current) { downloadOriginal(); return }

    try {
      const dataUrl = stageRef.current.toDataURL({ mimeType: 'image/png', pixelRatio: 2 })
      downloadDataUrl(dataUrl, 'png')
      toast('Đã tải về thành công!', 'success', 'Download')
    } catch { downloadOriginal() }
  }, [product, customValues, toast, isAdmin, hasPaid])

  if (!product) return <NotFoundView onBack={() => navigate('/shop')} />
  if (!isOwned(productId)) return <NotOwnedView onBuy={() => navigate('/shop')} />

  const editableFields = product.editableFields || []
  const prodW = product.width || 1920
  const prodH = product.height || 1080
  const baseScale = Math.min(containerSize.w / prodW, containerSize.h / prodH, 1)
  const scale = baseScale * zoom
  const stageW = prodW * scale
  const stageH = prodH * scale

  const selectedField = editableFields.find(f => f.role === selectedRole)

  return (
    <div className="flex flex-col" style={{ height: '100vh', background: '#0a0a14' }}>
      {/* ── Top toolbar ── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate('/shop')}
          className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors">
          <ArrowLeft size={16} />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-[9px] text-white/30 uppercase tracking-widest leading-none">Trình chỉnh sửa</p>
          <h1 className="text-xs font-semibold text-white truncate leading-tight">{product.title}</h1>
        </div>

        {/* History */}
        <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <ToolbarBtn onClick={undo} disabled={!canUndo} title="Hoàn tác (Ctrl+Z)">
            <Undo2 size={13} />
          </ToolbarBtn>
          <ToolbarBtn onClick={redo} disabled={!canRedo} title="Làm lại (Ctrl+Y)">
            <Redo2 size={13} />
          </ToolbarBtn>
        </div>

        {/* Zoom */}
        <div className="hidden sm:flex items-center gap-1 px-1.5 py-1 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <ToolbarBtn onClick={() => setZoom(z => Math.max(z - 0.1, 0.3))} title="Thu nhỏ (-)">
            <ZoomOut size={13} />
          </ToolbarBtn>
          <span className="text-[10px] text-white/55 font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
          <ToolbarBtn onClick={() => setZoom(z => Math.min(z + 0.1, 3))} title="Phóng to (+)">
            <ZoomIn size={13} />
          </ToolbarBtn>
          <ToolbarBtn onClick={() => setZoom(1)} title="Reset (0)">
            <Maximize2 size={11} />
          </ToolbarBtn>
        </div>

        {/* Grid + Layers panel toggle */}
        <ToolbarBtn onClick={() => setShowGrid(v => !v)} title="Bật/tắt lưới"
          active={showGrid}>
          <Grid3x3 size={13} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => setShowLayers(v => !v)} title="Layers panel"
          active={showLayers} className="hidden lg:flex">
          <LayersIcon size={13} />
        </ToolbarBtn>

        {/* Reset */}
        <ToolbarBtn onClick={resetAll} title="Reset tất cả">
          <RefreshCw size={13} />
        </ToolbarBtn>

        {/* Download */}
        <button onClick={() => handleDownload(false)}
          className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs">
          <Download size={12} /> {isAdmin || hasPaid ? 'Tải về' : `Tải về (${EXPORT_COST}⭐)`}
        </button>
      </motion.div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">
        {/* Left panel — Fields */}
        <motion.div
          initial={{ x: -260, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="flex flex-col overflow-hidden flex-shrink-0"
          style={{
            width: 280,
            background: 'rgba(255,255,255,0.025)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-1.5">
              <Sparkles size={11} className="text-brand-400" />
              <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Tùy chỉnh nội dung</h2>
            </div>
            {editableFields.length > 0 && (
              <p className="text-[10px] text-white/25 mt-0.5">{editableFields.length} trường có thể chỉnh sửa</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <PageGuide
              id="customer-editor"
              title="Hướng dẫn chỉnh sửa"
              subtitle="Mọi thay đổi đều có thể Undo (Ctrl+Z). Click layer trên canvas để chọn và edit."
              tone="purple"
              dismissible={false}
              steps={[
                { icon: '📝', title: 'Sửa text', desc: 'Click "Style" để mở B/I/U, font, màu, viền, bóng.' },
                { icon: '🖼️', title: 'Đổi ảnh', desc: 'Upload PNG/JPG. Avatar tự crop tròn.' },
                { icon: '🎨', title: 'Layers', desc: 'Click icon mắt để ẩn/hiện, khóa di chuyển.' },
                { icon: '⌨️', title: 'Phím tắt', desc: 'Ctrl+Z undo, +/- zoom, 0 reset, Del xóa.' },
              ]}
            />
            {editableFields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-2xl mb-3 flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Type size={18} className="text-white/20" />
                </div>
                <p className="text-xs text-white/30 leading-relaxed">
                  Sản phẩm này chưa có trường chỉnh sửa.<br />
                  Admin cần publish lại với layer chuẩn.
                </p>
              </div>
            ) : (
              editableFields.map(field => (
                <motion.div key={field.role}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={selectedRole === field.role ? 'ring-2 ring-brand-500/40 rounded-xl p-2 -m-2' : ''}>
                  <FieldInput
                    field={field}
                    value={customValues[field.role] ?? field.defaultValue ?? ''}
                    onChange={val => handleFieldChange(field.role, val)}
                    textStyle={textStyles[field.role]}
                    onTextStyleChange={field.type === 'text' ? (changes) => handleTextStyleChange(field.role, changes) : undefined}
                  />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Center — Canvas */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Selection toolbar */}
          {selectedRole && selectedField && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-2 flex-shrink-0 flex-wrap"
              style={{ background: 'rgba(110,75,255,0.06)', borderBottom: '1px solid rgba(110,75,255,0.15)' }}>
              <span className="text-[10px] text-white/45 uppercase tracking-wider">Đang chọn:</span>
              <span className="text-xs font-semibold text-brand-300 truncate max-w-[140px]">{selectedField.label}</span>

              <div className="w-px h-4 bg-white/10" />

              {/* Align horizontal */}
              <ToolbarBtn onClick={() => handleAlignField(selectedRole, 'left')} title="Trái">
                <AlignLeft size={12} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => handleAlignField(selectedRole, 'center')} title="Giữa ngang">
                <AlignCenter size={12} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => handleAlignField(selectedRole, 'right')} title="Phải">
                <AlignRight size={12} />
              </ToolbarBtn>
              <ToolbarBtn onClick={() => handleAlignField(selectedRole, 'middle')} title="Giữa dọc">
                <AlignVerticalJustifyCenter size={12} />
              </ToolbarBtn>

              <div className="w-px h-4 bg-white/10" />

              {/* Rotation */}
              <div className="flex items-center gap-1.5">
                <RotateCw size={11} className="text-white/40" />
                <input type="range" min="-180" max="180" step="1"
                  value={layerProps[selectedRole]?.rotation || 0}
                  onChange={e => handleLayerPropChange(selectedRole, { rotation: parseInt(e.target.value) })}
                  className="w-20 accent-brand-500" />
                <span className="text-[10px] text-white/55 font-mono w-8">{layerProps[selectedRole]?.rotation || 0}°</span>
              </div>

              <div className="w-px h-4 bg-white/10" />

              {/* Opacity */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/40">Mờ</span>
                <input type="range" min="0" max="1" step="0.05"
                  value={layerProps[selectedRole]?.opacity ?? 1}
                  onChange={e => handleLayerPropChange(selectedRole, { opacity: parseFloat(e.target.value) })}
                  className="w-20 accent-brand-500" />
                <span className="text-[10px] text-white/55 font-mono w-9">{Math.round((layerProps[selectedRole]?.opacity ?? 1) * 100)}%</span>
              </div>

              <div className="w-px h-4 bg-white/10" />

              {/* Lock + Hide */}
              <ToolbarBtn onClick={() => handleLayerPropChange(selectedRole, { hidden: !layerProps[selectedRole]?.hidden })}
                active={layerProps[selectedRole]?.hidden}
                title={layerProps[selectedRole]?.hidden ? 'Hiện' : 'Ẩn'}>
                {layerProps[selectedRole]?.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
              </ToolbarBtn>
              <ToolbarBtn onClick={() => handleLayerPropChange(selectedRole, { locked: !layerProps[selectedRole]?.locked })}
                active={layerProps[selectedRole]?.locked}
                title={layerProps[selectedRole]?.locked ? 'Mở khóa' : 'Khóa'}>
                {layerProps[selectedRole]?.locked ? <Lock size={12} /> : <Unlock size={12} />}
              </ToolbarBtn>

              {/* Clear */}
              {selectedField.type === 'image' && customValues[selectedRole] && (
                <ToolbarBtn onClick={() => handleClearField(selectedRole)} title="Xóa ảnh"
                  className="text-rose-400 hover:bg-rose-500/15">
                  <Trash2 size={12} />
                </ToolbarBtn>
              )}

              <button onClick={() => setSelectedRole(null)}
                className="ml-auto text-[10px] text-white/40 hover:text-white px-2 py-1 rounded transition-colors">
                Bỏ chọn
              </button>
            </motion.div>
          )}

          {/* Canvas */}
          <div ref={containerRef}
            className="flex-1 min-w-0 flex items-center justify-center overflow-auto"
            style={{
              background: showGrid
                ? 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 40px), #0a0a10'
                : '#0a0a10',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedRole(null) }}>
            {stageW > 0 && stageH > 0 && (
              <Stage ref={stageRef} width={stageW} height={stageH}>
                <Layer>
                  {bgImg && <KonvaImage image={bgImg} width={stageW} height={stageH} x={0} y={0} />}

                  {/* Selection highlight */}
                  {selectedField && layerProps[selectedRole] && !layerProps[selectedRole].hidden && (
                    <Rect
                      x={(layerProps[selectedRole]?.x ?? selectedField.x ?? 0) * scale - 4}
                      y={(layerProps[selectedRole]?.y ?? selectedField.y ?? 0) * scale - 4}
                      width={(selectedField.width || 200) * scale + 8}
                      height={(selectedField.height || 50) * scale + 8}
                      stroke="#6e4bff"
                      strokeWidth={2}
                      dash={[6, 4]}
                      listening={false}
                    />
                  )}

                  {editableFields.map(field => {
                    if (field.type === 'text') {
                      return (
                        <KonvaOverlayText
                          key={field.role}
                          field={field}
                          value={customValues[field.role] ?? field.defaultValue ?? ''}
                          scale={scale}
                          isSelected={selectedRole === field.role}
                          onSelect={setSelectedRole}
                          onDragEnd={handleOverrideDragEnd}
                          textStyle={textStyles[field.role]}
                          layerProps={layerProps[field.role]}
                        />
                      )
                    }
                    if (field.type === 'image' && customValues[field.role]) {
                      return (
                        <KonvaOverlayImage
                          key={field.role}
                          field={field}
                          value={customValues[field.role]}
                          scale={scale}
                          isSelected={selectedRole === field.role}
                          onSelect={setSelectedRole}
                          onDragEnd={handleOverrideDragEnd}
                          layerProps={layerProps[field.role]}
                        />
                      )
                    }
                    return null
                  })}
                </Layer>
              </Stage>
            )}
          </div>
        </div>

        {/* Right — Layers panel */}
        {showLayers && (
          <motion.div
            initial={{ x: 240, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="hidden lg:flex flex-col flex-shrink-0 overflow-hidden"
            style={{
              width: 240,
              background: 'rgba(255,255,255,0.025)',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
            }}>
            <div className="px-4 py-3 border-b flex items-center gap-2"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <LayersIcon size={12} className="text-cyan-400" />
              <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Layers</h2>
              <span className="ml-auto text-[10px] text-white/30">{editableFields.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {editableFields.map((field) => {
                const isSelected = selectedRole === field.role
                const lp = layerProps[field.role] || {}
                const hasContent = !!customValues[field.role]
                return (
                  <div key={field.role}
                    onClick={() => setSelectedRole(field.role)}
                    className="group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all"
                    style={{
                      background: isSelected ? 'rgba(110,75,255,0.18)' : 'rgba(255,255,255,0.02)',
                      border: isSelected ? '1px solid rgba(110,75,255,0.4)' : '1px solid rgba(255,255,255,0.04)',
                    }}>
                    {/* Type icon */}
                    <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{
                        background: field.type === 'text' ? 'rgba(110,75,255,0.15)' : 'rgba(77,208,255,0.15)',
                        color: field.type === 'text' ? '#a78bfa' : '#67e8f9',
                      }}>
                      {field.type === 'text' ? <Type size={10} /> : <ImageIcon size={10} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-white/85 truncate">{field.label}</p>
                      <p className="text-[9px] text-white/30 truncate">
                        {hasContent ? (field.type === 'text' ? customValues[field.role].slice(0, 20) : 'Đã upload') : 'Trống'}
                      </p>
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center gap-0.5">
                      <button onClick={(e) => { e.stopPropagation(); handleLayerPropChange(field.role, { hidden: !lp.hidden }) }}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                        style={{ color: lp.hidden ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.6)' }}
                        title={lp.hidden ? 'Hiện' : 'Ẩn'}>
                        {lp.hidden ? <EyeOff size={11} /> : <Eye size={11} />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleLayerPropChange(field.role, { locked: !lp.locked }) }}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                        style={{ color: lp.locked ? '#fbbf24' : 'rgba(255,255,255,0.45)' }}
                        title={lp.locked ? 'Mở khóa' : 'Khóa'}>
                        {lp.locked ? <Lock size={10} /> : <Unlock size={10} />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Hint */}
            <div className="p-3 text-[10px] text-white/30 border-t leading-relaxed"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              💡 Click layer để chọn. Toolbar trên cùng để xoay, mờ, căn chỉnh.
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Payment modal ── */}
      <AnimatePresence>
        {showPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowPayModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-6 space-y-4"
              style={{ background: 'rgba(14,14,24,0.98)', border: '1px solid rgba(110,75,255,0.3)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: 'rgba(110,75,255,0.15)', border: '1px solid rgba(110,75,255,0.3)' }}>
                  <Download size={24} className="text-brand-400" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-1">Tải xuống có phí</h3>
                <p className="text-sm text-white/50">Trả {EXPORT_COST} coins để tải ảnh không watermark</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)' }}>
                <span className="text-sm text-white/60">Chi phí tải xuống</span>
                <div className="flex items-center gap-1.5 font-bold text-yellow-400">
                  <Star size={14} className="fill-yellow-400" /> {EXPORT_COST} coins
                </div>
              </div>
              {user && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-white/35">Số dư của bạn</span>
                  <span className={user.balance >= EXPORT_COST ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                    {user?.balance?.toLocaleString('vi-VN') ?? 0} coins
                  </span>
                </div>
              )}
              {!user && <p className="text-xs text-center text-white/40">Vui lòng đăng nhập để thanh toán</p>}
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowPayModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm text-white/50 transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Hủy
                </button>
                <button disabled={!user || (user?.balance ?? 0) < EXPORT_COST}
                  onClick={() => {
                    if (!user || user.balance < EXPORT_COST) return
                    const ok = deductBalance(EXPORT_COST)
                    if (!ok) { toast('Số dư không đủ!', 'error', 'Lỗi'); return }
                    try { sessionStorage.setItem(`nova_paid_${productId}`, '1') } catch {}
                    setHasPaid(true)
                    setShowPayModal(false)
                    toast('Thanh toán thành công! Đang tải...', 'success', 'OK')
                    handleDownload(true)
                  }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg,#6e4bff,#4dd0ff)', color: '#fff' }}>
                  Trả {EXPORT_COST} coins
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── ToolbarBtn helper ─────────────────────────────── */
function ToolbarBtn({ onClick, disabled, active, title, children, className = '' }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${className}`}
      style={{
        background: active ? 'rgba(110,75,255,0.2)' : 'transparent',
        color: disabled ? 'rgba(255,255,255,0.2)' : (active ? '#a78bfa' : 'rgba(255,255,255,0.6)'),
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}>
      {children}
    </button>
  )
}
