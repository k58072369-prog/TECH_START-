import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, User, KeyRound, LogOut, Loader2, AlertCircle,
  FileText, FolderOpen, Wrench, Settings, LayoutDashboard,
  Plus, Pencil, Trash2, Save, X, Upload, Eye, Star,
  TrendingUp, BarChart3, CheckCircle2, ExternalLink, RefreshCw,
  Music, ImageIcon, Link as LinkIcon, ChevronRight
} from 'lucide-react';
import { Article, Category, AiTool } from '../types';
import {
  getArticles, getCategories, saveArticle, deleteArticle,
  saveCategory, deleteCategory, uploadArticleImage
} from '../lib/supabase';
import { AI_TOOLS } from '../data/aiTools';

// ─── helpers ─────────────────────────────────────────────────────────────────
const slugify = (t: string) =>
  t.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').substring(0, 80);

const loadTools = (): AiTool[] => {
  try {
    const s = localStorage.getItem('tech_start_custom_links');
    if (s) return JSON.parse(s);
  } catch {}
  return AI_TOOLS;
};

const saveTools = (tools: AiTool[]) =>
  localStorage.setItem('tech_start_custom_links', JSON.stringify(tools));

// ─── empty shapes ─────────────────────────────────────────────────────────────
const emptyArticle = (): Partial<Article> => ({
  title: '', slug: '', excerpt: '', content: '',
  cover_image: '', youtube_url: '', external_url: '',
  category_id: '', featured: false
});

const emptyCategory = (): Partial<Category> => ({ name: '', image: '' });

const emptyTool = (): Partial<AiTool> => ({
  name: '', description: '', fullDescription: '',
  url: '', image: '', category: 'أدوات متنوعة', badge: '',
  features: [], uses: [], featured: false, hidden: false
});

// ─── types ───────────────────────────────────────────────────────────────────
type Tab = 'dashboard' | 'articles' | 'categories' | 'tools' | 'settings';

export default function AdminDashboard() {
  // ── auth ──────────────────────────────────────────────────────────────────
  const [token, setToken] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('tech_start_admin_token');
    if (!stored) { setVerifying(false); return; }
    fetch('/api/admin/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${stored}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) setToken(stored);
        else localStorage.removeItem('tech_start_admin_token');
      })
      .catch(() => localStorage.removeItem('tech_start_admin_token'))
      .finally(() => setVerifying(false));
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoggingIn(true); setAuthError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('tech_start_admin_token', data.token);
        setToken(data.token);
      } else {
        setAuthError(data.error || 'بيانات الدخول غير صحيحة.');
      }
    } catch {
      setAuthError('تعذر الاتصال بخادم المصادقة.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tech_start_admin_token');
    setToken(null);
  };

  // ── data ──────────────────────────────────────────────────────────────────
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<AiTool[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const loadData = async () => {
    setDataLoading(true);
    const [arts, cats] = await Promise.all([getArticles(), getCategories()]);
    setArticles(arts);
    setCategories(cats);
    setTools(loadTools());
    setDataLoading(false);
  };

  useEffect(() => { if (token) loadData(); }, [token]);

  // ── navigation ────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── article editor ────────────────────────────────────────────────────────
  const [artForm, setArtForm] = useState<Partial<Article> | null>(null);
  const [artSaving, setArtSaving] = useState(false);
  const [artImgLoading, setArtImgLoading] = useState(false);
  const artImgRef = useRef<HTMLInputElement>(null);

  const openNewArticle = () => setArtForm(emptyArticle());
  const openEditArticle = (a: Article) => setArtForm({ ...a });

  const handleArticleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setArtImgLoading(true);
    const url = await uploadArticleImage(file);
    if (url) setArtForm(p => ({ ...p, cover_image: url }));
    setArtImgLoading(false);
  };

  const handleSaveArticle = async (e: FormEvent) => {
    e.preventDefault();
    if (!artForm?.title) return;
    setArtSaving(true);
    const payload = {
      ...artForm,
      slug: artForm.slug || slugify(artForm.title!),
    } as any;
    const saved = await saveArticle(payload);
    if (saved) {
      await loadData();
      setArtForm(null);
    }
    setArtSaving(false);
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`حذف المقال "${title}"؟`)) return;
    await deleteArticle(id);
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  // ── category editor ───────────────────────────────────────────────────────
  const [catForm, setCatForm] = useState<Partial<Category> | null>(null);
  const [catSaving, setCatSaving] = useState(false);
  const [catImgLoading, setCatImgLoading] = useState(false);
  const catImgRef = useRef<HTMLInputElement>(null);

  const handleCategoryImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setCatImgLoading(true);
    const url = await uploadArticleImage(file);
    if (url) setCatForm(p => ({ ...p, image: url }));
    setCatImgLoading(false);
  };

  const handleSaveCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!catForm?.name) return;
    setCatSaving(true);
    const saved = await saveCategory({ id: catForm.id, name: catForm.name!, image: catForm.image });
    if (saved) { await loadData(); setCatForm(null); }
    setCatSaving(false);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`حذف القسم "${name}"؟`)) return;
    await deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // ── tool editor ───────────────────────────────────────────────────────────
  const [toolForm, setToolForm] = useState<Partial<AiTool> | null>(null);
  const [toolSaving, setToolSaving] = useState(false);
  const [toolImgLoading, setToolImgLoading] = useState(false);
  const toolImgRef = useRef<HTMLInputElement>(null);

  const handleToolImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setToolImgLoading(true);
    const url = await uploadArticleImage(file);
    if (url) setToolForm(p => ({ ...p, image: url }));
    setToolImgLoading(false);
  };

  const handleSaveTool = (e: FormEvent) => {
    e.preventDefault();
    if (!toolForm?.name || !toolForm?.url) return;
    setToolSaving(true);
    const current = [...tools];
    const payload: AiTool = {
      id: toolForm.id || 'tool-' + Date.now(),
      name: toolForm.name!,
      description: toolForm.description || '',
      fullDescription: toolForm.fullDescription || '',
      category: toolForm.category || 'أدوات متنوعة',
      image: toolForm.image || '',
      url: toolForm.url!,
      badge: toolForm.badge || '',
      features: Array.isArray(toolForm.features) ? toolForm.features
        : (toolForm.features as any as string || '').split('\n').map((s: string) => s.trim()).filter(Boolean),
      uses: Array.isArray(toolForm.uses) ? toolForm.uses
        : (toolForm.uses as any as string || '').split('\n').map((s: string) => s.trim()).filter(Boolean),
      views: toolForm.views ?? 0,
      featured: !!toolForm.featured,
      hidden: !!toolForm.hidden,
      display_order: toolForm.display_order ?? 0
    };
    if (toolForm.id) {
      const idx = current.findIndex(t => t.id === toolForm.id);
      if (idx !== -1) current[idx] = payload; else current.unshift(payload);
    } else {
      current.unshift(payload);
    }
    saveTools(current);
    setTools(current);
    setToolForm(null);
    setToolSaving(false);
  };

  const handleDeleteTool = (id: string, name: string) => {
    if (!confirm(`حذف الأداة "${name}"؟`)) return;
    const updated = tools.filter(t => t.id !== id);
    saveTools(updated);
    setTools(updated);
  };

  // ── settings ──────────────────────────────────────────────────────────────
  const [prayerAudioSrc, setPrayerAudioSrc] = useState('/audio/salah-reminder.mp3');
  const [prayerAudioUploading, setPrayerAudioUploading] = useState(false);
  const prayerAudioRef = useRef<HTMLInputElement>(null);

  const handlePrayerAudioUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setPrayerAudioUploading(true);
    try {
      const url = await uploadArticleImage(file); // reuse bucket upload
      if (url) {
        setPrayerAudioSrc(url);
        localStorage.setItem('tech_start_prayer_audio_src', url);
        alert('تم رفع الملف الصوتي بنجاح ✓');
      }
    } finally {
      setPrayerAudioUploading(false);
    }
  };

  // read saved prayer audio on mount
  useEffect(() => {
    const saved = localStorage.getItem('tech_start_prayer_audio_src');
    if (saved) setPrayerAudioSrc(saved);
  }, []);

  // ── stats ─────────────────────────────────────────────────────────────────
  const totalViews = articles.reduce((s, a) => s + (a.views || 0), 0);
  const featuredCount = articles.filter(a => a.featured).length;

  // ══════════════════════════════════════════════════════════════════════════
  // LOADING SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (verifying) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 relative">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-xs text-slate-400 font-mono tracking-widest">جاري التحقق من الجلسة...</p>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4" dir="rtl">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 bg-sky-400/8 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
          {/* Logo area */}
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-[0_8px_30px_rgba(29,78,216,0.5)]">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-1">بوابة الإدارة</h2>
            <p className="text-sm text-slate-400">تيك ستارت — لوحة التحكم الاحترافية</p>
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {authError}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">اسم المستخدم</label>
              <div className="relative">
                <input
                  type="text" required placeholder="admin"
                  value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 rounded-xl bg-white/8 border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                />
                <User className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">كلمة المرور</label>
              <div className="relative">
                <input
                  type="password" required placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 rounded-xl bg-white/8 border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                />
                <KeyRound className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <button
              type="submit" disabled={loggingIn}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-[0_4px_20px_rgba(29,78,216,0.4)]"
            >
              {loggingIn ? <><Loader2 className="h-4 w-4 animate-spin" />جاري التحقق...</> : 'دخول لوحة التحكم'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════
  const navItems: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'dashboard', label: 'نظرة عامة', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'articles', label: 'المقالات', icon: <FileText className="h-4 w-4" />, count: articles.length },
    { id: 'categories', label: 'الأقسام', icon: <FolderOpen className="h-4 w-4" />, count: categories.length },
    { id: 'tools', label: 'الأدوات الذكية', icon: <Wrench className="h-4 w-4" />, count: tools.length },
    { id: 'settings', label: 'الإعدادات', icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex" dir="rtl">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={`fixed top-0 right-0 h-full bg-slate-900 z-40 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-60' : 'w-16'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/8">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-white font-extrabold text-sm leading-none">تيك ستارت</p>
              <p className="text-slate-500 text-[10px] mt-0.5">لوحة التحكم</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="mr-auto text-slate-500 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setArtForm(null); setCatForm(null); setToolForm(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                tab === item.id
                  ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(29,78,216,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/6'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <span className="flex-1 text-right">{item.label}</span>
              )}
              {sidebarOpen && item.count !== undefined && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${tab === item.id ? 'bg-white/20 text-white' : 'bg-white/8 text-slate-500'}`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-4 border-t border-white/8 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm font-bold cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span className="text-right">تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────── */}
      <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'mr-60' : 'mr-16'} pt-8 pb-16 px-6`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {navItems.find(n => n.id === tab)?.label}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">TechStart Academy — Admin Panel</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${dataLoading ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >

            {/* ══ DASHBOARD ══════════════════════════════════════ */}
            {tab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'المقالات', value: articles.length, icon: <FileText className="h-5 w-5 text-blue-600" />, sub: `${featuredCount} مميزة`, color: 'blue' },
                    { label: 'الأقسام', value: categories.length, icon: <FolderOpen className="h-5 w-5 text-emerald-600" />, sub: 'مُفعَّلة', color: 'emerald' },
                    { label: 'الأدوات الذكية', value: tools.length, icon: <Wrench className="h-5 w-5 text-violet-600" />, sub: 'في الدليل', color: 'violet' },
                    { label: 'المشاهدات', value: totalViews, icon: <Eye className="h-5 w-5 text-amber-600" />, sub: 'إجمالي', color: 'amber' },
                  ].map(card => (
                    <div key={card.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-xl bg-${card.color}-50`}>{card.icon}</div>
                        <TrendingUp className="h-4 w-4 text-slate-300" />
                      </div>
                      <div className="text-3xl font-extrabold text-slate-900 tabular-nums">{card.value}</div>
                      <div className="text-xs text-slate-400 font-medium mt-1">{card.label} — {card.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 mb-4">إجراءات سريعة</h3>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: 'مقال جديد', icon: <Plus className="h-4 w-4" />, action: () => { setTab('articles'); openNewArticle(); } },
                      { label: 'قسم جديد', icon: <Plus className="h-4 w-4" />, action: () => { setTab('categories'); setCatForm(emptyCategory()); } },
                      { label: 'أداة جديدة', icon: <Plus className="h-4 w-4" />, action: () => { setTab('tools'); setToolForm(emptyTool()); } },
                      { label: 'إعدادات الصوت', icon: <Music className="h-4 w-4" />, action: () => setTab('settings') },
                    ].map(btn => (
                      <button
                        key={btn.label}
                        onClick={btn.action}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
                      >
                        {btn.icon}{btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent articles */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 mb-4">آخر المقالات</h3>
                  {articles.slice(0, 5).map(a => (
                    <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                      {a.cover_image
                        ? <img src={a.cover_image} className="h-9 w-9 rounded-lg object-cover shrink-0" />
                        : <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><FileText className="h-4 w-4 text-slate-400" /></div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{a.title}</p>
                        <p className="text-[11px] text-slate-400">{a.category?.name || '—'} · {a.views} مشاهدة</p>
                      </div>
                      {a.featured && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ ARTICLES ════════════════════════════════════════ */}
            {tab === 'articles' && (
              <div className="space-y-5">
                {/* Article form */}
                <AnimatePresence>
                  {artForm && (
                    <motion.form
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleSaveArticle}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-extrabold text-slate-900 text-base">{artForm.id ? 'تعديل مقال' : 'مقال جديد'}</h3>
                        <button type="button" onClick={() => setArtForm(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="h-5 w-5" /></button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="عنوان المقال *">
                          <input required value={artForm.title || ''} onChange={e => setArtForm(p => ({ ...p, title: e.target.value, slug: slugify(e.target.value) }))}
                            className={inputCls} placeholder="عنوان المقال التقني" />
                        </Field>
                        <Field label="الرابط الدائم (Slug)">
                          <input value={artForm.slug || ''} onChange={e => setArtForm(p => ({ ...p, slug: e.target.value }))}
                            className={inputCls} placeholder="article-slug" dir="ltr" />
                        </Field>
                        <Field label="القسم">
                          <select value={artForm.category_id || ''} onChange={e => setArtForm(p => ({ ...p, category_id: e.target.value }))} className={inputCls}>
                            <option value="">— بدون قسم —</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </Field>
                        <Field label="رابط خارجي (اختياري)">
                          <input value={artForm.external_url || ''} onChange={e => setArtForm(p => ({ ...p, external_url: e.target.value }))}
                            className={inputCls} placeholder="https://..." dir="ltr" />
                        </Field>
                        <Field label="رابط يوتيوب (اختياري)">
                          <input value={artForm.youtube_url || ''} onChange={e => setArtForm(p => ({ ...p, youtube_url: e.target.value }))}
                            className={inputCls} placeholder="https://youtube.com/..." dir="ltr" />
                        </Field>
                        <Field label="صورة الغلاف">
                          <div className="flex gap-2">
                            <input value={artForm.cover_image || ''} onChange={e => setArtForm(p => ({ ...p, cover_image: e.target.value }))}
                              className={`${inputCls} flex-1`} placeholder="https://..." dir="ltr" />
                            <input type="file" accept="image/*" ref={artImgRef} onChange={handleArticleImageUpload} className="hidden" />
                            <button type="button" onClick={() => artImgRef.current?.click()}
                              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0">
                              {artImgLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}رفع
                            </button>
                          </div>
                          {artForm.cover_image && <img src={artForm.cover_image} className="mt-2 h-24 w-full object-cover rounded-xl" />}
                        </Field>
                      </div>

                      <Field label="المقتطف">
                        <textarea value={artForm.excerpt || ''} onChange={e => setArtForm(p => ({ ...p, excerpt: e.target.value }))}
                          className={`${inputCls} min-h-[70px] resize-y`} placeholder="وصف مختصر يظهر في قائمة المقالات..." />
                      </Field>

                      <Field label="محتوى المقال (HTML / Markdown)">
                        <textarea value={artForm.content || ''} onChange={e => setArtForm(p => ({ ...p, content: e.target.value }))}
                          className={`${inputCls} min-h-[220px] resize-y font-mono text-xs`} placeholder="<p>محتوى المقال...</p>" dir="ltr" />
                      </Field>

                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="art-feat" checked={!!artForm.featured} onChange={e => setArtForm(p => ({ ...p, featured: e.target.checked }))}
                          className="accent-blue-600" />
                        <label htmlFor="art-feat" className="text-sm font-bold text-slate-700 cursor-pointer">مقال مميز (يظهر في الصدارة)</label>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setArtForm(null)}
                          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 cursor-pointer">إلغاء</button>
                        <button type="submit" disabled={artSaving}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 cursor-pointer flex items-center gap-2 disabled:opacity-60">
                          {artSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          {artForm.id ? 'حفظ التعديلات' : 'نشر المقال'}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Articles list header */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">{articles.length} مقال</span>
                  <button onClick={openNewArticle}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer">
                    <Plus className="h-4 w-4" />مقال جديد
                  </button>
                </div>

                {/* Articles list */}
                <div className="space-y-3">
                  {articles.map(a => (
                    <div key={a.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                      {a.cover_image
                        ? <img src={a.cover_image} className="h-14 w-20 rounded-xl object-cover shrink-0" />
                        : <div className="h-14 w-20 rounded-xl bg-slate-100 flex items-center justify-center shrink-0"><ImageIcon className="h-5 w-5 text-slate-400" /></div>
                      }
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 truncate text-sm">{a.title}</p>
                          {a.featured && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{a.category?.name || '—'} · {a.views || 0} مشاهدة · {a.slug}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => openEditArticle(a)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-700 transition-all cursor-pointer">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteArticle(a.id, a.title)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {articles.length === 0 && <EmptyState icon={<FileText />} text="لا توجد مقالات حتى الآن" />}
                </div>
              </div>
            )}

            {/* ══ CATEGORIES ══════════════════════════════════════ */}
            {tab === 'categories' && (
              <div className="space-y-5">
                <AnimatePresence>
                  {catForm && (
                    <motion.form
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleSaveCategory}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-extrabold text-slate-900 text-base">{catForm.id ? 'تعديل قسم' : 'قسم جديد'}</h3>
                        <button type="button" onClick={() => setCatForm(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="h-5 w-5" /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="اسم القسم *">
                          <input required value={catForm.name || ''} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))}
                            className={inputCls} placeholder="الذكاء الاصطناعي" />
                        </Field>
                        <Field label="صورة القسم">
                          <div className="flex gap-2">
                            <input value={catForm.image || ''} onChange={e => setCatForm(p => ({ ...p, image: e.target.value }))}
                              className={`${inputCls} flex-1`} placeholder="https://..." dir="ltr" />
                            <input type="file" accept="image/*" ref={catImgRef} onChange={handleCategoryImageUpload} className="hidden" />
                            <button type="button" onClick={() => catImgRef.current?.click()}
                              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0">
                              {catImgLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}رفع
                            </button>
                          </div>
                          {catForm.image && <img src={catForm.image} className="mt-2 h-16 w-full object-cover rounded-xl" />}
                        </Field>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setCatForm(null)}
                          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 cursor-pointer">إلغاء</button>
                        <button type="submit" disabled={catSaving}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 cursor-pointer flex items-center gap-2 disabled:opacity-60">
                          {catSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}حفظ القسم
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">{categories.length} قسم</span>
                  <button onClick={() => setCatForm(emptyCategory())}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer">
                    <Plus className="h-4 w-4" />قسم جديد
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      {c.image
                        ? <img src={c.image} className="w-full h-28 object-cover" />
                        : <div className="w-full h-28 bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center"><FolderOpen className="h-8 w-8 text-slate-300" /></div>
                      }
                      <div className="p-4 flex items-center justify-between">
                        <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                        <div className="flex gap-2">
                          <button onClick={() => setCatForm({ ...c })}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-700 cursor-pointer"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleDeleteCategory(c.id, c.name)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && <div className="col-span-3"><EmptyState icon={<FolderOpen />} text="لا توجد أقسام حتى الآن" /></div>}
                </div>
              </div>
            )}

            {/* ══ TOOLS ═══════════════════════════════════════════ */}
            {tab === 'tools' && (
              <div className="space-y-5">
                <AnimatePresence>
                  {toolForm && (
                    <motion.form
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      onSubmit={handleSaveTool}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-extrabold text-slate-900 text-base">{toolForm.id ? 'تعديل أداة' : 'أداة جديدة'}</h3>
                        <button type="button" onClick={() => setToolForm(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X className="h-5 w-5" /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="اسم الأداة *">
                          <input required value={toolForm.name || ''} onChange={e => setToolForm(p => ({ ...p, name: e.target.value }))}
                            className={inputCls} placeholder="ChatGPT" />
                        </Field>
                        <Field label="رابط الأداة *">
                          <input required value={toolForm.url || ''} onChange={e => setToolForm(p => ({ ...p, url: e.target.value }))}
                            className={inputCls} placeholder="https://..." dir="ltr" />
                        </Field>
                        <Field label="التصنيف">
                          <input value={toolForm.category || ''} onChange={e => setToolForm(p => ({ ...p, category: e.target.value }))}
                            className={inputCls} placeholder="ذكاء اصطناعي" />
                        </Field>
                        <Field label="شارة (اختياري)">
                          <input value={toolForm.badge || ''} onChange={e => setToolForm(p => ({ ...p, badge: e.target.value }))}
                            className={inputCls} placeholder="جديد / مجاني..." />
                        </Field>
                        <Field label="صورة / لوجو الأداة">
                          <div className="flex gap-2">
                            <input value={toolForm.image || ''} onChange={e => setToolForm(p => ({ ...p, image: e.target.value }))}
                              className={`${inputCls} flex-1`} placeholder="https://..." dir="ltr" />
                            <input type="file" accept="image/*" ref={toolImgRef} onChange={handleToolImageUpload} className="hidden" />
                            <button type="button" onClick={() => toolImgRef.current?.click()}
                              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer flex items-center gap-1 shrink-0">
                              {toolImgLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}رفع
                            </button>
                          </div>
                          {toolForm.image && <img src={toolForm.image} className="mt-2 h-14 w-14 object-contain rounded-xl border border-slate-100" />}
                        </Field>
                      </div>

                      <Field label="وصف مختصر">
                        <input value={toolForm.description || ''} onChange={e => setToolForm(p => ({ ...p, description: e.target.value }))}
                          className={inputCls} placeholder="وصف مختصر بسطر واحد" />
                      </Field>
                      <Field label="وصف تفصيلي">
                        <textarea value={toolForm.fullDescription || ''} onChange={e => setToolForm(p => ({ ...p, fullDescription: e.target.value }))}
                          className={`${inputCls} min-h-[80px] resize-y`} placeholder="شرح كامل للأداة..." />
                      </Field>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="الميزات (كل سطر = ميزة)">
                          <textarea
                            value={Array.isArray(toolForm.features) ? toolForm.features.join('\n') : ''}
                            onChange={e => setToolForm(p => ({ ...p, features: e.target.value.split('\n') }))}
                            className={`${inputCls} min-h-[80px] resize-y`} placeholder="ميزة 1&#10;ميزة 2&#10;ميزة 3" />
                        </Field>
                        <Field label="حالات الاستخدام (كل سطر = حالة)">
                          <textarea
                            value={Array.isArray(toolForm.uses) ? toolForm.uses.join('\n') : ''}
                            onChange={e => setToolForm(p => ({ ...p, uses: e.target.value.split('\n') }))}
                            className={`${inputCls} min-h-[80px] resize-y`} placeholder="استخدام 1&#10;استخدام 2" />
                        </Field>
                      </div>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={!!toolForm.featured} onChange={e => setToolForm(p => ({ ...p, featured: e.target.checked }))} className="accent-blue-600" />
                          <span className="text-sm font-bold text-slate-700">أداة مميزة</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={!!toolForm.hidden} onChange={e => setToolForm(p => ({ ...p, hidden: e.target.checked }))} className="accent-slate-600" />
                          <span className="text-sm font-bold text-slate-700">مخفية</span>
                        </label>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setToolForm(null)}
                          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 cursor-pointer">إلغاء</button>
                        <button type="submit" disabled={toolSaving}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 cursor-pointer flex items-center gap-2 disabled:opacity-60">
                          {toolSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          {toolForm.id ? 'حفظ التعديلات' : 'إضافة الأداة'}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">{tools.length} أداة</span>
                  <button onClick={() => setToolForm(emptyTool())}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer">
                    <Plus className="h-4 w-4" />أداة جديدة
                  </button>
                </div>

                <div className="space-y-3">
                  {tools.filter(t => !t.hidden).map(t => (
                    <div key={t.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                      {t.image && !t.image.startsWith('INITIALS:')
                        ? <img src={t.image} className="h-12 w-12 rounded-xl object-contain border border-slate-100 shrink-0" />
                        : <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center text-base font-extrabold shrink-0">
                            {t.image?.startsWith('INITIALS:') ? t.image.replace('INITIALS:', '') : (t.name?.substring(0, 2) || '?').toUpperCase()}
                          </div>
                      }
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm truncate">{t.name}</p>
                          {t.featured && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                          {t.badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 shrink-0">{t.badge}</span>}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{t.category} · <a href={t.url} target="_blank" rel="noreferrer" className="hover:text-blue-600 inline-flex items-center gap-0.5">{t.url}<ExternalLink className="h-2.5 w-2.5" /></a></p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setToolForm({ ...t, features: t.features || [], uses: t.uses || [] })}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-700 cursor-pointer"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteTool(t.id, t.name)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                  {tools.filter(t => !t.hidden).length === 0 && <EmptyState icon={<Wrench />} text="لا توجد أدوات مضافة" />}
                </div>
              </div>
            )}

            {/* ══ SETTINGS ════════════════════════════════════════ */}
            {tab === 'settings' && (
              <div className="space-y-6 max-w-2xl">
                {/* Prayer audio */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 rounded-xl bg-blue-50"><Music className="h-5 w-5 text-blue-600" /></div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">صوت تذكير الصلاة على النبي ﷺ</h3>
                      <p className="text-xs text-slate-400 mt-0.5">يُشغَّل تلقائياً بعد 100 ثانية من دخول الموقع</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
                    <p className="text-xs font-bold text-slate-600">الملف الحالي</p>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <Music className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-xs text-slate-500 font-mono truncate flex-1">{prayerAudioSrc}</p>
                    </div>
                    <audio controls src={prayerAudioSrc} className="w-full h-8" key={prayerAudioSrc} />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700">رفع ملف صوتي جديد</p>
                    <div className="flex items-center gap-3">
                      <input type="file" accept="audio/*" ref={prayerAudioRef} onChange={handlePrayerAudioUpload} className="hidden" />
                      <button
                        onClick={() => prayerAudioRef.current?.click()}
                        disabled={prayerAudioUploading}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 cursor-pointer disabled:opacity-60 transition-all"
                      >
                        {prayerAudioUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {prayerAudioUploading ? 'جاري الرفع...' : 'اختيار ملف صوتي'}
                      </button>
                      <span className="text-xs text-slate-400">MP3, WAV, OGG</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                    <p className="text-xs text-amber-700 font-bold">
                      💡 بعد الرفع يتم حفظ الرابط تلقائياً ويُطبَّق في نافذة التذكير عند الزيارة التالية.
                    </p>
                  </div>
                </div>

                {/* Quran audio info */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50"><Music className="h-5 w-5 text-emerald-600" /></div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">صوت سورة الفاتحة</h3>
                      <p className="text-xs text-slate-400 mt-0.5">يُشغَّل تلقائياً لحظة دخول الموقع</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-xs font-mono text-slate-500">/audio/quran-fatiha.mp3</p>
                    <audio controls src="/audio/quran-fatiha.mp3" className="w-full h-8 mt-2" />
                  </div>
                  <p className="text-xs text-slate-400">لتغيير الملف: استبدل <code className="bg-slate-100 px-1 rounded">public/audio/quran-fatiha.mp3</code> بالملف الجديد.</p>
                </div>

                {/* Clear cache */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
                  <h3 className="font-extrabold text-slate-900 text-sm">بيانات التخزين المؤقت</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => { localStorage.removeItem('tech_start_prayer_shown_session'); sessionStorage.removeItem('tech_start_prayer_shown_session'); alert('تم مسح ذاكرة التذكير — ستظهر النوافذ مجدداً.'); }}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold transition-all cursor-pointer"
                    >
                      إعادة ضبط ذاكرة النوافذ
                    </button>
                    <button
                      onClick={() => { ['tech_start_cached_articles', 'tech_start_cached_categories'].forEach(k => localStorage.removeItem(k)); alert('تم مسح الكاش — سيُعاد التحميل من Supabase.'); }}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      مسح كاش Supabase
                    </button>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─── small helpers ────────────────────────────────────────────────────────────
const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
      <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-300">{icon}</div>
      <p className="text-sm text-slate-400 font-bold">{text}</p>
    </div>
  );
}
