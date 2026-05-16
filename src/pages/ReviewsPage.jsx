import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Star, Filter, ArrowUpDown, Search, ThumbsUp,
  Heart, Send, Sparkles, TrendingUp, Users, Award, ShieldCheck,
  Trash2, X,
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useAppStore } from '../store/useAppStore'
import PageGuide from '../components/ui/PageGuide'
import AnimatedTitle from '../components/ui/AnimatedTitle'

const SEED_REVIEWS = [
  { id:'s-1',  name:'Nguyễn Minh Khoa', avatar:'K', color:'#6e4bff', rating:5, text:'PSD Editor cực kỳ mượt, tôi đã dùng để tạo thumbnail YouTube và kết quả vượt mong đợi! Layer system chuẩn, font đẹp.', time:'2 ngày trước', product:'PSD Editor', likes:42, verified:true },
  { id:'s-2',  name:'Trần Thu Hà', avatar:'H', color:'#0ea5e9', rating:5, text:'Ghép ảnh nhanh và đẹp, tính năng collage rất tiện lợi. Giao diện tối modern rất thích, hiệu ứng mượt.', time:'5 ngày trước', product:'Ghép ảnh', likes:28, verified:true },
  { id:'s-3',  name:'Lê Văn Dũng', avatar:'D', color:'#10b981', rating:4, text:'Kho tài nguyên phong phú, tải về dễ dàng. Sẽ ủng hộ lâu dài! Mong có thêm icon flat 3D nhiều hơn.', time:'1 tuần trước', product:'Tài nguyên', likes:18, verified:false },
  { id:'s-4',  name:'Phạm Bảo Châu', avatar:'C', color:'#f59e0b', rating:5, text:'Xóa nền AI siêu nhanh chỉ 1 giây, chất lượng cao hơn nhiều tool miễn phí khác. Edge tóc rất sạch.', time:'2 tuần trước', product:'Xóa nền AI', likes:67, verified:true },
  { id:'s-5',  name:'Đỗ Quỳnh Anh', avatar:'Q', color:'#ec4899', rating:5, text:'Mua banner Shopee rất xịn, giá hợp lý. Editor cho phép sửa text và màu sắc trực tiếp tiện kinh khủng.', time:'3 tuần trước', product:'Cửa hàng', likes:35, verified:true },
  { id:'s-6',  name:'Vũ Thanh Tùng', avatar:'T', color:'#8b5cf6', rating:4, text:'Hộp quà có nhiều voucher hay, tiết kiệm được kha khá. Giao diện nhận thưởng vui như game vậy haha.', time:'1 tháng trước', product:'Hộp quà', likes:22, verified:false },
  { id:'s-7',  name:'Bùi Hải Yến', avatar:'Y', color:'#06b6d4', rating:5, text:'Là designer freelance mình rất thích NOVA. PSD chất lượng, file gọn nhẹ, layer được đặt tên cẩn thận.', time:'1 tháng trước', product:'Cửa hàng', likes:54, verified:true },
  { id:'s-8',  name:'Hoàng Tuấn Việt', avatar:'V', color:'#ef4444', rating:5, text:'Nạp tiền nhanh chóng, dùng MoMo nhận liền 5 phút. Tốc độ phản hồi support rất tốt, 5 sao!', time:'1 tháng trước', product:'Nạp tiền', likes:19, verified:true },
  { id:'s-9',  name:'Lý Phương Linh', avatar:'L', color:'#14b8a6', rating:4, text:'Cộng đồng support nhiệt tình. Có vài bug nhỏ ở mobile nhưng đã được fix nhanh chóng.', time:'2 tháng trước', product:'Chung', likes:14, verified:false },
  { id:'s-10', name:'Trương Nhật Minh', avatar:'M', color:'#f97316', rating:5, text:'Đầu tư thumbnail cinema mua ở đây, kênh YouTube tăng view rõ rệt. Recommend cực mạnh!', time:'2 tháng trước', product:'Cửa hàng', likes:88, verified:true },
  { id:'s-11', name:'Đinh Khánh Vy', avatar:'V', color:'#a855f7', rating:5, text:'AI tách nền cho ảnh sản phẩm shop của mình quá tuyệt. Tiết kiệm 90% thời gian so với Photoshop.', time:'2 tháng trước', product:'Xóa nền AI', likes:73, verified:true },
  { id:'s-12', name:'Nguyễn Hoàng Phúc', avatar:'P', color:'#22c55e', rating:5, text:'Đáng đồng tiền bát gạo. Nhiều resource tiện cho các bạn mới học design.', time:'3 tháng trước', product:'Tài nguyên', likes:41, verified:true },
]

const PRODUCT_OPTIONS = ['Tất cả','Chung','Cửa hàng','PSD Editor','Ghép ảnh','Xóa nền AI','Tài nguyên','Hộp quà','Nạp tiền']

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Mới nhất' },
  { value: 'oldest',  label: 'Cũ nhất' },
  { value: 'rating',  label: 'Sao cao nhất' },
  { value: 'likes',   label: 'Nhiều like nhất' },
]

const STORAGE_KEY = 'nova_reviews_v1'
const LIKES_KEY   = 'nova_review_likes_v1'

function loadUserReviews() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}
function loadLikedIds() {
  try { return JSON.parse(localStorage.getItem(LIKES_KEY)) || [] } catch { return [] }
}

/* ─── Stat card ─────────────────────────────────────────── */
function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="relative flex items-center gap-3 p-4 rounded-2xl overflow-hidden tilt-3d"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)',
      }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}22`, border: `1px solid ${color}44`, color }}>
        <Icon size={18} className="icon-glow" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-display font-bold text-white leading-tight">{value}</p>
        <p className="text-[11px] text-white/45">{label}</p>
      </div>
    </div>
  )
}

/* ─── Review card ───────────────────────────────────────── */
function ReviewCard({ review, liked, onLike, onDelete, currentUserId, delay }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: [0.22, 0.8, 0.22, 1] }}
      className="relative rounded-2xl p-5 flex flex-col gap-3 group hover:-translate-y-1 transition-all duration-300 spotlight"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`)
        e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`)
      }}>
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${review.color}, transparent)` }} />

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold"
            style={{ background: `${review.color}25`, color: review.color, border: `1px solid ${review.color}50` }}>
            {review.avatar}
          </div>
          {review.verified && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: '#22c55e', boxShadow: '0 0 0 2px #0c0c14' }}>
              <ShieldCheck size={9} className="text-white" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white truncate">{review.name}</p>
            {review.verified && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-emerald-400"
                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
                ĐÃ XÁC THỰC
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/35 mt-0.5">{review.product} · {review.time}</p>
        </div>
        {currentUserId && review.userId === currentUserId && (
          <button onClick={() => onDelete(review.id)} title="Xóa đánh giá"
            className="p-1.5 rounded-lg text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, idx) => (
          <Star key={idx} size={13}
            className={idx < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/15'} />
        ))}
        <span className="text-[11px] text-white/50 ml-1.5 font-medium">{review.rating}.0</span>
      </div>

      {/* Text */}
      <p className="text-sm text-white/70 leading-relaxed flex-1">"{review.text}"</p>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
        <button onClick={() => onLike(review.id)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
          style={{
            background: liked ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.03)',
            border: liked ? '1px solid rgba(236,72,153,0.4)' : '1px solid rgba(255,255,255,0.06)',
            color: liked ? '#f9a8d4' : 'rgba(255,255,255,0.5)',
          }}>
          <Heart size={12} className={liked ? 'fill-current' : ''} />
          <span className="font-medium">{(review.likes || 0) + (liked ? 1 : 0)}</span>
        </button>
      </div>
    </motion.div>
  )
}

/* ─── Main ──────────────────────────────────────────────── */
export default function ReviewsPage() {
  const { user } = useAuthStore()
  const { toast } = useAppStore()

  const [userReviews, setUserReviews] = useState(loadUserReviews)
  const [likedIds, setLikedIds]       = useState(loadLikedIds)

  const [search, setSearch]   = useState('')
  const [productFilter, setProductFilter] = useState('Tất cả')
  const [ratingFilter, setRatingFilter]   = useState(0)        // 0 = all
  const [sortBy, setSortBy]   = useState('newest')

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ rating: 5, text: '', product: 'Chung' })
  const [submitting, setSubmitting] = useState(false)

  // Combine user-submitted + seed
  const allReviews = useMemo(() => {
    const seed = SEED_REVIEWS.map((r, i) => ({
      ...r,
      _ts: Date.now() - (i + 1) * 86400000,
    }))
    const u = userReviews.map(r => ({
      ...r,
      _ts: r._ts ?? parseInt(r.id, 10) ?? Date.now(),
      verified: r.verified ?? false,
      likes: r.likes ?? 0,
    }))
    return [...u, ...seed]
  }, [userReviews])

  const stats = useMemo(() => {
    const total = allReviews.length
    const avg = total > 0
      ? (allReviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
      : '0.0'
    const verified = allReviews.filter(r => r.verified).length
    const fiveStars = allReviews.filter(r => r.rating === 5).length
    const ratio = total > 0 ? Math.round((fiveStars / total) * 100) : 0
    return { total, avg, verified, fiveStars, ratio }
  }, [allReviews])

  // Rating distribution
  const distribution = useMemo(() => {
    const dist = [5, 4, 3, 2, 1].map(stars => {
      const count = allReviews.filter(r => r.rating === stars).length
      const percent = allReviews.length ? Math.round((count / allReviews.length) * 100) : 0
      return { stars, count, percent }
    })
    return dist
  }, [allReviews])

  // Filter + sort
  const filtered = useMemo(() => {
    let arr = [...allReviews]
    if (productFilter !== 'Tất cả') arr = arr.filter(r => r.product === productFilter)
    if (ratingFilter > 0) arr = arr.filter(r => r.rating === ratingFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      arr = arr.filter(r => r.text.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
    }
    switch (sortBy) {
      case 'oldest':  arr.sort((a, b) => a._ts - b._ts); break
      case 'rating':  arr.sort((a, b) => b.rating - a.rating || b._ts - a._ts); break
      case 'likes':   arr.sort((a, b) => (b.likes || 0) - (a.likes || 0)); break
      case 'newest':
      default:        arr.sort((a, b) => b._ts - a._ts); break
    }
    return arr
  }, [allReviews, productFilter, ratingFilter, search, sortBy])

  /* ─── Handlers ─── */
  const submitReview = () => {
    if (!user) { toast('Vui lòng đăng nhập để đánh giá', 'info'); return }
    if (!form.text.trim()) { toast('Vui lòng nhập nội dung đánh giá', 'info'); return }
    setSubmitting(true)
    const colors = ['#6e4bff','#0ea5e9','#10b981','#f59e0b','#ec4899','#8b5cf6','#06b6d4','#ef4444']
    const newReview = {
      id: `u-${Date.now()}`,
      _ts: Date.now(),
      name: user.name,
      avatar: user.name.charAt(0).toUpperCase(),
      color: colors[Math.floor(Math.random() * colors.length)],
      rating: form.rating,
      text: form.text.trim(),
      time: 'Vừa xong',
      product: form.product,
      userId: user.id,
      verified: true,
      likes: 0,
    }
    const updated = [newReview, ...userReviews].slice(0, 100)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch {}
    setUserReviews(updated)
    setForm({ rating: 5, text: '', product: 'Chung' })
    setShowForm(false)
    setSubmitting(false)
    toast('Đã đăng đánh giá. Cảm ơn bạn!', 'success', 'Cộng đồng cảm ơn ❤')
  }

  const toggleLike = (id) => {
    let next
    if (likedIds.includes(id)) next = likedIds.filter(x => x !== id)
    else next = [...likedIds, id]
    setLikedIds(next)
    try { localStorage.setItem(LIKES_KEY, JSON.stringify(next)) } catch {}
  }

  const deleteReview = (id) => {
    const next = userReviews.filter(r => r.id !== id)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
    setUserReviews(next)
    toast('Đã xóa đánh giá', 'info')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageGuide
        id="reviews"
        title="Khám phá đánh giá từ cộng đồng làm đẹp xịn"
        subtitle="Nơi bạn có thể đọc trải nghiệm thật từ designer, KOL, content creator đang dùng NOVA AI Studio."
        tone="pink"
        steps={[
          { icon: '🔍', title: 'Tìm kiếm & lọc', desc: 'Lọc theo sản phẩm, số sao hoặc gõ từ khóa để tìm review phù hợp.' },
          { icon: '⭐', title: 'Đọc đánh giá', desc: 'Xem nhận xét chi tiết. Tài khoản có dấu xanh là đã xác thực.' },
          { icon: '❤️', title: 'Like review', desc: 'Click trái tim để ủng hộ những đánh giá hữu ích cho bạn.' },
          { icon: '✍️', title: 'Viết review', desc: 'Đăng nhập rồi bấm "Viết đánh giá" để chia sẻ trải nghiệm của bạn.' },
        ]}
      />

      <AnimatedTitle
        icon={MessageSquare}
        title="Đánh giá cộng đồng"
        subtitle={`${stats.total} đánh giá thật từ người dùng NOVA AI Studio`}
        badge={{ label: 'COMMUNITY' }}
        tone="pink"
        actions={
          user && (
            <button
              onClick={() => setShowForm(v => !v)}
              className="btn-neon flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white">
              {showForm ? <><X size={13} /> Hủy</> : <><Send size={13} /> Viết đánh giá</>}
            </button>
          )
        }
      />

      {/* Stats overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatPill icon={Award}    label="Điểm trung bình"  value={`${stats.avg}/5`}    color="#facc15" />
        <StatPill icon={Users}    label="Tổng đánh giá"    value={stats.total}         color="#6e4bff" />
        <StatPill icon={Sparkles} label="5 sao"            value={`${stats.ratio}%`}   color="#2bf2c0" />
        <StatPill icon={ShieldCheck} label="Đã xác thực"   value={stats.verified}      color="#0ea5e9" />
      </div>

      {/* Distribution + filters layout */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Distribution card */}
        <motion.div
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl p-5 flex flex-col gap-3"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(16px)',
          }}>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-brand-300" />
            <h3 className="text-sm font-semibold text-white">Phân bổ điểm</h3>
          </div>
          <div className="space-y-2">
            {distribution.map(d => (
              <button key={d.stars}
                onClick={() => setRatingFilter(rf => rf === d.stars ? 0 : d.stars)}
                className="w-full flex items-center gap-2.5 group">
                <span className="flex items-center gap-0.5 w-12 flex-shrink-0">
                  <span className="text-xs text-white/60 font-medium">{d.stars}</span>
                  <Star size={10} className="text-yellow-400 fill-yellow-400" />
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.percent}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: ratingFilter === d.stars
                        ? 'linear-gradient(90deg,#ec4899,#f59e0b)'
                        : 'linear-gradient(90deg,#6e4bff,#4dd0ff)',
                      boxShadow: ratingFilter === d.stars
                        ? '0 0 12px rgba(236,72,153,0.6)' : 'none',
                    }} />
                </div>
                <span className="text-[11px] text-white/50 font-medium w-9 text-right">{d.count}</span>
              </button>
            ))}
          </div>
          {ratingFilter > 0 && (
            <button onClick={() => setRatingFilter(0)}
              className="text-[11px] text-white/40 hover:text-white transition-colors flex items-center gap-1">
              <X size={11} /> Bỏ lọc số sao
            </button>
          )}
        </motion.div>

        {/* Filters + Search */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm đánh giá theo nội dung hoặc tên người dùng..."
              className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-white/80 placeholder-white/25 outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(236,72,153,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {/* Product filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-white/40">
              <Filter size={11} /> Sản phẩm:
            </span>
            {PRODUCT_OPTIONS.map(p => (
              <button key={p}
                onClick={() => setProductFilter(p)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: productFilter === p
                    ? 'linear-gradient(135deg,#ec4899,#8b5cf6)'
                    : 'rgba(255,255,255,0.04)',
                  border: productFilter === p
                    ? '1px solid rgba(236,72,153,0.5)'
                    : '1px solid rgba(255,255,255,0.07)',
                  color: productFilter === p ? '#fff' : 'rgba(255,255,255,0.55)',
                  boxShadow: productFilter === p ? '0 4px 16px rgba(236,72,153,0.35)' : 'none',
                }}>
                {p}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-white/40">
              <ArrowUpDown size={11} /> Sắp xếp:
            </span>
            {SORT_OPTIONS.map(opt => (
              <button key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: sortBy === opt.value ? 'rgba(110,75,255,0.2)' : 'rgba(255,255,255,0.04)',
                  border: sortBy === opt.value ? '1px solid rgba(110,75,255,0.5)' : '1px solid rgba(255,255,255,0.07)',
                  color: sortBy === opt.value ? 'rgba(167,139,250,1)' : 'rgba(255,255,255,0.5)',
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Write review form */}
      <AnimatePresence>
        {showForm && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(139,92,246,0.06))',
                border: '1px solid rgba(236,72,153,0.25)',
                backdropFilter: 'blur(24px)',
              }}>
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.3), transparent 70%)' }} />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: 'rgba(236,72,153,0.2)', color: '#f9a8d4', border: '1px solid rgba(236,72,153,0.4)' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-[11px] text-white/45">Chia sẻ trải nghiệm của bạn</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  <span className="text-xs text-white/50 mr-2">Đánh giá:</span>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm(f => ({ ...f, rating: n }))}
                      className="hover:scale-110 transition-transform">
                      <Star size={20} className={n <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} />
                    </button>
                  ))}
                  <span className="text-xs text-white/50 ml-2">{form.rating}/5</span>
                </div>

                <select
                  value={form.product}
                  onChange={e => setForm(f => ({ ...f, product: e.target.value }))}
                  className="w-full mb-3 px-3 py-2.5 rounded-xl text-sm text-white/80 outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {PRODUCT_OPTIONS.filter(p => p !== 'Tất cả').map(p => (
                    <option key={p} value={p} style={{ background: '#0c0c14' }}>{p}</option>
                  ))}
                </select>

                <textarea
                  value={form.text}
                  onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                  placeholder="Chia sẻ trải nghiệm của bạn (chất lượng, dịch vụ, ý tưởng cải thiện...)"
                  rows={4}
                  className="w-full mb-3 px-3 py-2.5 rounded-xl text-sm text-white/85 outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />

                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-white/35">{form.text.length}/500 ký tự</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowForm(false)}
                      className="px-4 py-2 rounded-xl text-xs text-white/55 transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      Hủy
                    </button>
                    <button onClick={submitReview}
                      disabled={!form.text.trim() || submitting}
                      className="btn-neon px-5 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50 flex items-center gap-1.5">
                      <Send size={12} />
                      {submitting ? 'Đang gửi...' : 'Đăng đánh giá'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews grid */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-white/45">
          Hiển thị <span className="text-white/80 font-medium">{filtered.length}</span> đánh giá
          {productFilter !== 'Tất cả' && <> · sản phẩm <span className="text-white/80">{productFilter}</span></>}
          {ratingFilter > 0 && <> · {ratingFilter} sao</>}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl p-12 text-center"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.1)',
          }}>
          <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'rgba(110,75,255,0.1)', border: '1px solid rgba(110,75,255,0.2)' }}>
            <MessageSquare size={26} className="text-brand-300" />
          </div>
          <p className="text-sm text-white/55">Không có đánh giá nào phù hợp với bộ lọc</p>
          <button onClick={() => { setProductFilter('Tất cả'); setRatingFilter(0); setSearch('') }}
            className="mt-3 text-xs text-brand-300 hover:text-brand-200 transition-colors">
            Xóa tất cả bộ lọc
          </button>
        </div>
      ) : (
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <ReviewCard
              key={r.id}
              review={r}
              liked={likedIds.includes(r.id)}
              onLike={toggleLike}
              onDelete={deleteReview}
              currentUserId={user?.id}
              delay={i * 0.04}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}
