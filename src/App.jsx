import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase.js";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

// ── utils ──────────────────────────────────────────────────────────────────
const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtDate = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";
const todayStr = new Date().toISOString().split("T")[0];
const currentMes = todayStr.slice(0, 7);
const mesLabels = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const mesLabel = (m) => m ? `${mesLabels[parseInt(m.split("-")[1]) - 1]}/${m.split("-")[0]}` : "—";
const diasAtraso = (venc) => { if (!venc) return 0; const d = Math.floor((new Date() - new Date(venc + "T00:00:00")) / 86400000); return d > 0 ? d : 0; };
const uid = () => crypto.randomUUID();

// ── icons ───────────────────────────────────────────────────────────────────
const I = ({ n, s = 18, c = "currentColor" }) => {
  const p = {
    dashboard: "M3 3h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zM3 14h7v7H3z",
    users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    card: "M1 4h22v16H1zM1 10h22",
    alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
    dollar: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
    wave: "M22 12h-4l-3 9L9 3l-3 9H2",
    file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
    cal: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18",
    gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2",
    moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
    sun: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42",
    menu: "M3 12h18M3 6h18M3 18h18",
    plus: "M12 5v14M5 12h14",
    check: "M20 6L9 17l-5-5",
    x: "M18 6L6 18M6 6l12 12",
    trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
    edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z",
    search: "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
    down: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
    wa: null,
    bus: "M8 6v6M16 6v6M2 12h19.6M18 18h3s.5-1.7.8-4.3c.3-2.7.2-3.7.2-3.7H2s-.2 1-.2 3.7C2.1 16.3 2.5 18 2.5 18H6M8 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM16 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 6h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z",
    up: "M23 6L13.5 15.5 8.5 10.5 1 18M17 6h6v6",
    loader: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
  };
  if (n === "wa") return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={p[n] || ""} />
    </svg>
  );
};

// ── theme ───────────────────────────────────────────────────────────────────
const theme = (dark) => ({
  bg: dark ? "#0f172a" : "#f1f5f9",
  sidebar: dark ? "#1e293b" : "#ffffff",
  card: dark ? "#1e293b" : "#ffffff",
  border: dark ? "#334155" : "#e2e8f0",
  text: dark ? "#f1f5f9" : "#0f172a",
  sub: dark ? "#94a3b8" : "#64748b",
  input: dark ? "#0f172a" : "#f8fafc",
  accent: "#6366f1",
  accentBg: dark ? "#312e81" : "#eef2ff",
  green: "#10b981",
  red: "#ef4444",
  yellow: "#f59e0b",
  blue: "#3b82f6",
});

// ── reusable components ─────────────────────────────────────────────────────
const Badge = ({ s }) => {
  const cfg = { pago: ["#dcfce7","#166534","Pago"], pendente: ["#fef9c3","#854d0e","Pendente"], atrasado: ["#fee2e2","#991b1b","Atrasado"], parcial: ["#dbeafe","#1e40af","Parcial"], ativo: ["#dcfce7","#166534","Ativo"], inativo: ["#f3f4f6","#6b7280","Inativo"] }[s] || ["#f3f4f6","#6b7280",s];
  return <span style={{ background: cfg[0], color: cfg[1], padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{cfg[2]}</span>;
};

const Modal = ({ open, onClose, title, t, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: t.card, borderRadius: 18, padding: 28, width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 32px 80px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: t.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.sub, padding: 4 }}><I n="x" s={20} c={t.sub} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
    {children}
  </div>
);

const inp = (t) => ({ style: { width: "100%", padding: "10px 13px", borderRadius: 9, border: `1.5px solid ${t.border}`, background: t.input, color: t.text, fontSize: 14, outline: "none", transition: "border-color 0.15s", fontFamily: "inherit" } });

const Btn = ({ onClick, children, variant = "primary", t, small }) => {
  const styles = {
    primary: { background: t.accent, color: "#fff", border: "none" },
    ghost: { background: "transparent", color: t.sub, border: `1.5px solid ${t.border}` },
    danger: { background: "#fee2e2", color: t.red, border: "none" },
    success: { background: "#dcfce7", color: "#166534", border: "none" },
    wa: { background: "#dcfce7", color: "#16a34a", border: "none" },
  };
  return (
    <button onClick={onClick} style={{ ...styles[variant], padding: small ? "6px 12px" : "10px 20px", borderRadius: small ? 7 : 10, cursor: "pointer", fontWeight: 600, fontSize: small ? 12 : 14, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit", transition: "opacity 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.85"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
      {children}
    </button>
  );
};

const Spinner = ({ t }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
    <div style={{ width: 32, height: 32, border: `3px solid ${t.border}`, borderTop: `3px solid ${t.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const Card = ({ t, children, style = {} }) => (
  <div style={{ background: t.card, borderRadius: 16, border: `1px solid ${t.border}`, ...style }}>
    {children}
  </div>
);

const StatCard = ({ label, value, icon, color, sub, t }) => (
  <Card t={t} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <I n={icon} s={20} c={color} />
      </div>
      {sub && <span style={{ fontSize: 11, fontWeight: 700, color, background: color + "18", padding: "2px 8px", borderRadius: 20 }}>{sub}</span>}
    </div>
    <div style={{ fontSize: 24, fontWeight: 800, color: t.text, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, color: t.sub }}>{label}</div>
  </Card>
);

// ── nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard",      label: "Dashboard",        icon: "dashboard" },
  { id: "alunos",         label: "Alunos",           icon: "users" },
  { id: "pagamentos",     label: "Pagamentos",        icon: "card" },
  { id: "inadimplencia",  label: "Inadimplência",     icon: "alert" },
  { id: "despesas",       label: "Despesas",          icon: "dollar" },
  { id: "fluxo",          label: "Fluxo de Caixa",    icon: "wave" },
  { id: "relatorios",     label: "Relatórios",        icon: "file" },
  { id: "agenda",         label: "Agenda",            icon: "cal" },
  { id: "configuracoes",  label: "Configurações",      icon: "gear" },
];

// ══════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem("te_dark") === "1");
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const t = theme(dark);

  // ── shared state (loaded once) ─────────────────────────────────────────────
  const [alunos,    setAlunos]    = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [despesas,  setDespesas]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [dbOk,      setDbOk]      = useState(true);

  const notify = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const toggleDark = () => { const v = !dark; setDark(v); localStorage.setItem("te_dark", v ? "1" : "0"); };

  // ── initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      const [ra, rp, rd] = await Promise.all([
        supabase.from("alunos").select("*").order("nome"),
        supabase.from("pagamentos").select("*").order("data_vencimento"),
        supabase.from("despesas").select("*").order("data", { ascending: false }),
      ]);
      if (ra.error) { setDbOk(false); }
      else { setAlunos(ra.data || []); setPagamentos(rp.data || []); setDespesas(rd.data || []); }
      setLoading(false);
    })();
  }, []);

  // ── computed ──────────────────────────────────────────────────────────────
  const pagsMes         = pagamentos.filter(p => p.mes === currentMes);
  const totalRecebido   = pagsMes.filter(p => p.status === "pago").reduce((s, p) => s + Number(p.valor), 0);
  const totalPendente   = pagsMes.filter(p => p.status === "pendente").reduce((s, p) => s + Number(p.valor), 0);
  const totalAtrasado   = pagsMes.filter(p => p.status === "atrasado").reduce((s, p) => s + Number(p.valor), 0);
  const totalDespMes    = despesas.filter(d => d.data?.slice(0,7) === currentMes).reduce((s, d) => s + Number(d.valor), 0);
  const lucroLiquido    = totalRecebido - totalDespMes;
  const alunosAtivos    = alunos.filter(a => a.status === "ativo");
  const inadimplentes   = pagsMes.filter(p => p.status === "atrasado");

  const shared = { t, dark, alunos, setAlunos, pagamentos, setPagamentos, despesas, setDespesas, notify, loading, pagsMes, totalRecebido, totalPendente, totalAtrasado, totalDespMes, lucroLiquido, alunosAtivos, inadimplentes };

  const pages = { dashboard: Dashboard, alunos: Alunos, pagamentos: Pagamentos, inadimplencia: Inadimplencia, despesas: Despesas, fluxo: FluxoCaixa, relatorios: Relatorios, agenda: Agenda, configuracoes: Configuracoes };
  const Page = pages[page] || Dashboard;

  // ── not connected banner ──────────────────────────────────────────────────
  if (!dbOk) return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", padding: 24 }}>
      <div style={{ background: t.card, borderRadius: 20, padding: 40, maxWidth: 500, textAlign: "center", border: `2px solid ${t.red}` }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ color: t.red, marginBottom: 12 }}>Banco de dados não configurado</h2>
        <p style={{ color: t.sub, lineHeight: 1.7, marginBottom: 20 }}>
          Você precisa criar um projeto no <strong>Supabase</strong> e configurar as variáveis de ambiente.<br /><br />
          Veja o arquivo <code>LEIA-ME.md</code> incluído no projeto para instruções passo a passo.
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.bg, fontFamily: "'DM Sans', system-ui, sans-serif", color: t.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
        input,select,textarea{font-family:inherit}
        @keyframes fadein{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes slidein{from{transform:translateX(-100%)}to{transform:none}}
        .page{animation:fadein 0.3s ease}
        .nav-btn:hover{background:${t.accentBg}!important;color:${t.accent}!important}
        @media(max-width:768px){.sidebar{display:none!important}.mobile-trigger{display:flex!important}}
      `}</style>

      {/* SIDEBAR */}
      <aside className="sidebar" style={{ width: collapsed ? 64 : 240, minHeight: "100vh", background: t.sidebar, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflow: "hidden", transition: "width 0.25s", flexShrink: 0 }}>
        <div style={{ padding: collapsed ? "18px 14px" : "18px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${t.border}` }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <I n="bus" s={18} c="#fff" />
          </div>
          {!collapsed && <div style={{ overflow: "hidden" }}><div style={{ fontSize: 13, fontWeight: 800, color: t.text, whiteSpace: "nowrap" }}>TransporteEscolar</div><div style={{ fontSize: 11, color: t.sub }}>Gestão Financeira</div></div>}
        </div>
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} className="nav-btn"
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 14px" : "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: page === item.id ? t.accentBg : "transparent", color: page === item.id ? t.accent : t.sub, fontWeight: page === item.id ? 700 : 400, fontSize: 14, marginBottom: 2, transition: "all 0.15s", whiteSpace: "nowrap", justifyContent: collapsed ? "center" : "flex-start" }}
              title={collapsed ? item.label : ""}>
              <I n={item.icon} s={18} c={page === item.id ? t.accent : t.sub} />
              {!collapsed && item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "10px 8px", borderTop: `1px solid ${t.border}` }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 8, padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: t.sub, fontSize: 13 }}>
            <I n="menu" s={18} c={t.sub} />
            {!collapsed && "Recolher"}
          </button>
        </div>
      </aside>

      {/* MOBILE NAV OVERLAY */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 900 }}>
          <div onClick={() => setMobileOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 240, background: t.sidebar, padding: "18px 8px", display: "flex", flexDirection: "column", animation: "slidein 0.22s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 16px", borderBottom: `1px solid ${t.border}`, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}><I n="bus" s={18} c="#fff" /></div>
              <div><div style={{ fontSize: 13, fontWeight: 800, color: t.text }}>TransporteEscolar</div><div style={{ fontSize: 11, color: t.sub }}>Gestão Financeira</div></div>
            </div>
            {NAV.map(item => (
              <button key={item.id} onClick={() => { setPage(item.id); setMobileOpen(false); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: page === item.id ? t.accentBg : "transparent", color: page === item.id ? t.accent : t.sub, fontWeight: page === item.id ? 700 : 400, fontSize: 14, marginBottom: 2 }}>
                <I n={item.icon} s={18} c={page === item.id ? t.accent : t.sub} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* TOPBAR */}
        <header style={{ height: 60, background: t.sidebar, borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 100, gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="mobile-trigger" onClick={() => setMobileOpen(true)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: t.sub }}><I n="menu" s={22} c={t.sub} /></button>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: t.text }}>{NAV.find(n => n.id === page)?.label}</div>
              <div style={{ fontSize: 11, color: t.sub }}>{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={toggleDark} style={{ width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${t.border}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <I n={dark ? "sun" : "moon"} s={16} c={t.sub} />
            </button>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 15 }}>M</div>
          </div>
        </header>

        <main className="page" style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {loading ? <Spinner t={t} /> : <Page {...shared} />}
        </main>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: toast.type === "ok" ? "#10b981" : "#ef4444", color: "#fff", padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, zIndex: 9999, boxShadow: "0 8px 32px rgba(0,0,0,0.25)", animation: "fadein 0.3s ease" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function Dashboard({ t, alunos, pagamentos, despesas, pagsMes, totalRecebido, totalPendente, totalAtrasado, totalDespMes, lucroLiquido, alunosAtivos, inadimplentes }) {
  // Build last 6 months chart data from real data
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const receita = pagamentos.filter(p => p.mes === m && p.status === "pago").reduce((s, p) => s + Number(p.valor), 0);
    const despesa = despesas.filter(d2 => d2.data?.slice(0, 7) === m).reduce((s, d2) => s + Number(d2.valor), 0);
    return { mes: mesLabels[d.getMonth()], receita, despesa, lucro: receita - despesa };
  });

  const pieData = [
    { name: "Recebido",  value: totalRecebido,  color: t.green  },
    { name: "Pendente",  value: totalPendente,  color: t.yellow },
    { name: "Atrasado",  value: totalAtrasado,  color: t.red    },
  ].filter(d => d.value > 0);

  const proxVenc = pagamentos.filter(p => p.status !== "pago" && p.data_vencimento >= todayStr).sort((a, b) => a.data_vencimento?.localeCompare(b.data_vencimento)).slice(0, 6);

  const tt = { contentStyle: { background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text }, formatter: (v) => fmt(v) };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 14 }}>
        <StatCard t={t} label="Recebido no Mês"   value={fmt(totalRecebido)}  icon="up"      color={t.green}  />
        <StatCard t={t} label="Pendente"            value={fmt(totalPendente)}  icon="cal"     color={t.yellow} />
        <StatCard t={t} label="Em Atraso"           value={fmt(totalAtrasado)}  icon="alert"   color={t.red}    sub={inadimplentes.length ? `${inadimplentes.length} alunos` : null} />
        <StatCard t={t} label="Despesas do Mês"    value={fmt(totalDespMes)}   icon="dollar"  color="#8b5cf6"  />
        <StatCard t={t} label="Lucro Líquido"       value={fmt(lucroLiquido)}   icon="wave"    color={lucroLiquido >= 0 ? t.green : t.red} />
        <StatCard t={t} label="Alunos Ativos"       value={alunosAtivos.length} icon="users"   color={t.accent} />
      </div>

      {/* charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        <Card t={t} style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, color: t.text }}>Receita vs Despesas (6 meses)</div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                <linearGradient id="gr2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: t.sub }} />
              <YAxis tick={{ fontSize: 12, fill: t.sub }} tickFormatter={v => `R$${v}`} />
              <Tooltip {...tt} />
              <Area type="monotone" dataKey="receita" stroke="#6366f1" fill="url(#gr)" strokeWidth={2.5} name="Receita" />
              <Area type="monotone" dataKey="despesa" stroke="#ef4444" fill="url(#gr2)" strokeWidth={2.5} name="Despesa" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card t={t} style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, color: t.text }}>Situação do Mês</div>
          {pieData.length === 0 ? <div style={{ color: t.sub, fontSize: 13, textAlign: "center", paddingTop: 40 }}>Sem dados</div> : <>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={3}>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie><Tooltip {...tt} /></PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
              {pieData.map((p, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 9, height: 9, borderRadius: "50%", background: p.color }} /><span style={{ color: t.sub }}>{p.name}</span></div>
                <span style={{ fontWeight: 700, color: t.text }}>{fmt(p.value)}</span>
              </div>)}
            </div>
          </>}
        </Card>
      </div>

      {/* bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card t={t}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, fontSize: 15, fontWeight: 800, color: t.text }}>Próximos Vencimentos</div>
          {proxVenc.length === 0 ? <div style={{ padding: 24, textAlign: "center", color: t.sub, fontSize: 13 }}>Nenhum vencimento pendente 🎉</div> :
            proxVenc.map(p => {
              const al = alunos.find(a => a.id === p.aluno_id);
              return <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 20px", borderBottom: `1px solid ${t.border}` }}>
                <div><div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{al?.nome}</div><div style={{ fontSize: 11, color: t.sub }}>Venc: {fmtDate(p.data_vencimento)}</div></div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontWeight: 700, color: t.text }}>{fmt(p.valor)}</span><Badge s={p.status} /></div>
              </div>;
            })}
        </Card>
        <Card t={t} style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, color: t.text }}>Lucro Mensal</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: t.sub }} />
              <YAxis tick={{ fontSize: 12, fill: t.sub }} />
              <Tooltip {...tt} />
              <Bar dataKey="lucro" radius={[6, 6, 0, 0]} name="Lucro">
                {chartData.map((e, i) => <Cell key={i} fill={e.lucro >= 0 ? "#6366f1" : "#ef4444"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ALUNOS
// ══════════════════════════════════════════════════════════════════════════════
function Alunos({ t, dark, alunos, setAlunos, notify }) {
  const [search, setSearch] = useState("");
  const [filt, setFilt] = useState("todos");
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const blank = { nome: "", responsavel: "", telefone: "", whatsapp: "", endereco: "", escola: "", periodo: "Manhã", valor_mensal: "", vencimento: 10, rota: "", ordem_rota: 1, status: "ativo", obs: "" };
  const [form, setForm] = useState(blank);
  const f = (k) => ({ value: form[k] ?? "", onChange: e => setForm(p => ({ ...p, [k]: e.target.value })), ...inp(t) });

  const shown = alunos.filter(a => {
    const q = search.toLowerCase();
    return (a.nome?.toLowerCase().includes(q) || a.responsavel?.toLowerCase().includes(q) || a.escola?.toLowerCase().includes(q)) && (filt === "todos" || a.status === filt);
  });

  const openNew = () => { setEditId(null); setForm(blank); setModal(true); };
  const openEdit = al => { setEditId(al.id); setForm({ ...al, valor_mensal: al.valor_mensal ?? "" }); setModal(true); };

  const save = async () => {
    if (!form.nome?.trim() || !form.responsavel?.trim()) { notify("Preencha nome e responsável", "err"); return; }
    setSaving(true);
    const payload = { ...form, valor_mensal: Number(form.valor_mensal) || 0, vencimento: Number(form.vencimento) || 10, ordem_rota: Number(form.ordem_rota) || 1 };
    if (editId) {
      const { error } = await supabase.from("alunos").update(payload).eq("id", editId);
      if (error) { notify("Erro ao salvar", "err"); } else { setAlunos(alunos.map(a => a.id === editId ? { ...a, ...payload } : a)); notify("Aluno atualizado!"); setModal(false); }
    } else {
      const { data, error } = await supabase.from("alunos").insert(payload).select().single();
      if (error) { notify("Erro ao salvar", "err"); } else { setAlunos([...alunos, data]); notify("Aluno cadastrado!"); setModal(false); }
    }
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm("Remover aluno? Seus pagamentos também serão excluídos.")) return;
    const { error } = await supabase.from("alunos").delete().eq("id", id);
    if (error) notify("Erro ao remover", "err"); else { setAlunos(alunos.filter(a => a.id !== id)); notify("Aluno removido"); }
  };

  const waLink = al => { const p = al.whatsapp?.replace(/\D/g, "") || al.telefone?.replace(/\D/g, ""); if (!p) return; window.open(`https://wa.me/55${p}?text=Olá, ${al.responsavel}! Passando para lembrar sobre o transporte escolar de ${al.nome}.`); };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><I n="search" s={15} c={t.sub} /></span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." style={{ ...inp(t).style, paddingLeft: 34, width: 220 }} />
          </div>
          {["todos","ativo","inativo"].map(v => <button key={v} onClick={() => setFilt(v)} style={{ padding: "9px 15px", borderRadius: 9, border: `1.5px solid ${filt === v ? t.accent : t.border}`, background: filt === v ? t.accentBg : t.card, color: filt === v ? t.accent : t.sub, fontWeight: filt === v ? 700 : 400, cursor: "pointer", fontSize: 13 }}>{v === "todos" ? "Todos" : v === "ativo" ? "Ativos" : "Inativos"}</button>)}
        </div>
        <Btn t={t} onClick={openNew}><I n="plus" s={16} c="#fff" /> Novo Aluno</Btn>
      </div>

      <Card t={t} style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr style={{ background: t.bg }}>
              {["Aluno","Responsável","Escola","Período","Rota","Valor","Vencimento","Status",""].map((h, i) => <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {shown.map(al => (
                <tr key={al.id} style={{ borderTop: `1px solid ${t.border}` }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 33, height: 33, borderRadius: "50%", background: `hsl(${al.nome?.charCodeAt(0) * 17 % 360},65%,58%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{al.nome?.[0]}</div>
                      <span style={{ fontWeight: 700, color: t.text }}>{al.nome}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: t.sub }}>{al.responsavel}</td>
                  <td style={{ padding: "12px 16px", color: t.sub }}>{al.escola}</td>
                  <td style={{ padding: "12px 16px", color: t.sub }}>{al.periodo}</td>
                  <td style={{ padding: "12px 16px", color: t.sub }}>{al.rota}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: t.text }}>{fmt(al.valor_mensal)}</td>
                  <td style={{ padding: "12px 16px", color: t.sub }}>Dia {al.vencimento}</td>
                  <td style={{ padding: "12px 16px" }}><Badge s={al.status} /></td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <Btn t={t} variant="ghost" small onClick={() => openEdit(al)}><I n="edit" s={13} c={t.sub} /></Btn>
                      <Btn t={t} variant="wa" small onClick={() => waLink(al)}><I n="wa" s={13} c="#16a34a" /></Btn>
                      <Btn t={t} variant="danger" small onClick={() => del(al.id)}><I n="trash" s={13} c={t.red} /></Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && <div style={{ padding: 32, textAlign: "center", color: t.sub, fontSize: 14 }}>Nenhum aluno encontrado. Clique em "Novo Aluno" para começar.</div>}
        </div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? "Editar Aluno" : "Novo Aluno"} t={t}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
          <div style={{ gridColumn: "1/-1" }}><Field label="Nome do Aluno"><input {...f("nome")} /></Field></div>
          <div style={{ gridColumn: "1/-1" }}><Field label="Responsável Financeiro"><input {...f("responsavel")} /></Field></div>
          <Field label="Telefone"><input {...f("telefone")} /></Field>
          <Field label="WhatsApp"><input {...f("whatsapp")} /></Field>
          <div style={{ gridColumn: "1/-1" }}><Field label="Endereço"><input {...f("endereco")} /></Field></div>
          <Field label="Escola"><input {...f("escola")} /></Field>
          <Field label="Período">
            <select value={form.periodo} onChange={e => setForm(p => ({...p, periodo: e.target.value}))} {...inp(t)}>
              {["Manhã","Tarde","Noite"].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Valor Mensal (R$)"><input type="number" {...f("valor_mensal")} /></Field>
          <Field label="Dia Vencimento"><input type="number" min="1" max="31" {...f("vencimento")} /></Field>
          <Field label="Rota"><input {...f("rota")} /></Field>
          <Field label="Ordem na Rota"><input type="number" min="1" {...f("ordem_rota")} /></Field>
          <Field label="Status">
            <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))} {...inp(t)}>
              <option value="ativo">Ativo</option><option value="inativo">Inativo</option>
            </select>
          </Field>
          <div style={{ gridColumn: "1/-1" }}><Field label="Observações"><textarea {...f("obs")} rows={2} style={{ ...inp(t).style, resize: "vertical" }} /></Field></div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <Btn t={t} variant="ghost" onClick={() => setModal(false)}>Cancelar</Btn>
          <Btn t={t} onClick={save}>{saving ? "Salvando..." : "Salvar"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGAMENTOS
// ══════════════════════════════════════════════════════════════════════════════
function Pagamentos({ t, alunos, pagamentos, setPagamentos, notify }) {
  const [mes, setMes] = useState(currentMes);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const blank = { aluno_id: "", mes: currentMes, valor: "", status: "pendente", data_pagamento: "", data_vencimento: "", observacao: "" };
  const [form, setForm] = useState(blank);

  const shown = pagamentos.filter(p => p.mes === mes);
  const recebido = shown.filter(p => p.status === "pago").reduce((s, p) => s + Number(p.valor), 0);
  const pendente = shown.filter(p => p.status === "pendente").reduce((s, p) => s + Number(p.valor), 0);
  const atrasado = shown.filter(p => p.status === "atrasado").reduce((s, p) => s + Number(p.valor), 0);

  const marcarPago = async id => {
    const today = todayStr;
    const { error } = await supabase.from("pagamentos").update({ status: "pago", data_pagamento: today }).eq("id", id);
    if (error) notify("Erro ao atualizar", "err");
    else { setPagamentos(pagamentos.map(p => p.id === id ? { ...p, status: "pago", data_pagamento: today } : p)); notify("Pagamento registrado!"); }
  };

  const save = async () => {
    if (!form.aluno_id) { notify("Selecione um aluno", "err"); return; }
    setSaving(true);
    const al = alunos.find(a => a.id === form.aluno_id);
    const payload = { ...form, valor: Number(form.valor) || Number(al?.valor_mensal) || 0 };
    const { data, error } = await supabase.from("pagamentos").insert(payload).select().single();
    if (error) notify("Erro ao salvar", "err"); else { setPagamentos([...pagamentos, data]); notify("Registrado!"); setModal(false); setForm(blank); }
    setSaving(false);
  };

  const waMsg = (p) => {
    const al = alunos.find(a => a.id === p.aluno_id);
    if (!al) return;
    const phone = (al.whatsapp || al.telefone || "").replace(/\D/g, "");
    if (!phone) { notify("Aluno sem WhatsApp", "err"); return; }
    const dias = diasAtraso(p.data_vencimento);
    const msg = p.status === "atrasado"
      ? `Olá, ${al.responsavel}! O pagamento do transporte de ${al.nome} está em atraso há ${dias} dias. Valor: ${fmt(p.valor)}. Por favor regularize.`
      : `Olá, ${al.responsavel}! O pagamento do transporte de ${al.nome} referente a ${mesLabel(p.mes)} está pendente. Valor: ${fmt(p.valor)}.`;
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 14, color: t.sub, fontWeight: 600 }}>Mês:</label>
          <input type="month" value={mes} onChange={e => setMes(e.target.value)} style={{ ...inp(t).style, width: "auto" }} />
        </div>
        <Btn t={t} onClick={() => setModal(true)}><I n="plus" s={16} c="#fff" /> Registrar</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 18 }}>
        {[["Recebido", recebido, t.green], ["Pendente", pendente, t.yellow], ["Atrasado", atrasado, t.red]].map(([l, v, c]) => (
          <Card key={l} t={t} style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{fmt(v)}</div>
            <div style={{ fontSize: 12, color: t.sub, marginTop: 4 }}>{l}</div>
          </Card>
        ))}
      </div>

      <Card t={t} style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr style={{ background: t.bg }}>
              {["Aluno","Valor","Vencimento","Pagamento","Status","Atraso",""].map((h, i) => <th key={i} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {shown.sort((a,b) => { const o = {atrasado:0,pendente:1,parcial:2,pago:3}; return (o[a.status]??4)-(o[b.status]??4); }).map(p => {
                const al = alunos.find(a => a.id === p.aluno_id);
                const dias = p.status === "atrasado" ? diasAtraso(p.data_vencimento) : 0;
                return (
                  <tr key={p.id} style={{ borderTop: `1px solid ${t.border}`, background: p.status === "atrasado" ? (t.card === "#1e293b" ? "#3b0f0f" : "#fff5f5") : "" }}>
                    <td style={{ padding: "11px 16px", fontWeight: 700, color: t.text }}>{al?.nome || "—"}</td>
                    <td style={{ padding: "11px 16px", fontWeight: 700, color: t.text }}>{fmt(p.valor)}</td>
                    <td style={{ padding: "11px 16px", color: t.sub }}>{fmtDate(p.data_vencimento)}</td>
                    <td style={{ padding: "11px 16px", color: t.sub }}>{fmtDate(p.data_pagamento)}</td>
                    <td style={{ padding: "11px 16px" }}><Badge s={p.status} /></td>
                    <td style={{ padding: "11px 16px", fontWeight: dias > 0 ? 700 : 400, color: dias > 0 ? t.red : t.sub }}>{dias > 0 ? `${dias}d` : "—"}</td>
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ display: "flex", gap: 5 }}>
                        {p.status !== "pago" && <Btn t={t} variant="success" small onClick={() => marcarPago(p.id)}><I n="check" s={13} c="#166534" /> Receber</Btn>}
                        <Btn t={t} variant="wa" small onClick={() => waMsg(p)}><I n="wa" s={13} c="#16a34a" /></Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {shown.length === 0 && <div style={{ padding: 32, textAlign: "center", color: t.sub }}>Nenhum pagamento em {mesLabel(mes)}</div>}
        </div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Registrar Pagamento" t={t}>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <Field label="Aluno">
            <select value={form.aluno_id} onChange={e => { const al = alunos.find(a => a.id === e.target.value); setForm(p => ({ ...p, aluno_id: e.target.value, valor: al?.valor_mensal || "" })); }} {...inp(t)}>
              <option value="">Selecione...</option>
              {alunos.filter(a => a.status === "ativo").map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </Field>
          <Field label="Mês/Ano"><input type="month" value={form.mes} onChange={e => setForm(p => ({...p, mes: e.target.value}))} {...inp(t)} /></Field>
          <Field label="Valor (R$)"><input type="number" value={form.valor} onChange={e => setForm(p => ({...p, valor: e.target.value}))} {...inp(t)} /></Field>
          <Field label="Data Vencimento"><input type="date" value={form.data_vencimento} onChange={e => setForm(p => ({...p, data_vencimento: e.target.value}))} {...inp(t)} /></Field>
          <Field label="Status">
            <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))} {...inp(t)}>
              {["pago","pendente","atrasado","parcial"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
          </Field>
          {form.status === "pago" && <Field label="Data Pagamento"><input type="date" value={form.data_pagamento} onChange={e => setForm(p => ({...p, data_pagamento: e.target.value}))} {...inp(t)} /></Field>}
          <Field label="Observação"><input value={form.observacao} onChange={e => setForm(p => ({...p, observacao: e.target.value}))} {...inp(t)} /></Field>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <Btn t={t} variant="ghost" onClick={() => setModal(false)}>Cancelar</Btn>
          <Btn t={t} onClick={save}>{saving ? "Salvando..." : "Salvar"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// INADIMPLÊNCIA
// ══════════════════════════════════════════════════════════════════════════════
function Inadimplencia({ t, alunos, pagamentos, setPagamentos, notify }) {
  const lista = pagamentos.filter(p => p.status === "atrasado").map(p => ({ ...p, al: alunos.find(a => a.id === p.aluno_id), dias: diasAtraso(p.data_vencimento) })).sort((a, b) => b.dias - a.dias);
  const total = lista.reduce((s, p) => s + Number(p.valor), 0);

  const marcarPago = async id => {
    const { error } = await supabase.from("pagamentos").update({ status: "pago", data_pagamento: todayStr }).eq("id", id);
    if (error) notify("Erro", "err");
    else { setPagamentos(pagamentos.map(p => p.id === id ? { ...p, status: "pago", data_pagamento: todayStr } : p)); notify("Pago!"); }
  };

  if (lista.length === 0) return (
    <Card t={t} style={{ padding: 64, textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 14 }}>🎉</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: t.text, marginBottom: 8 }}>Sem inadimplentes!</div>
      <div style={{ color: t.sub }}>Todos os pagamentos estão em dia.</div>
    </Card>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard t={t} label="Inadimplentes"   value={new Set(lista.map(p => p.aluno_id)).size} icon="users" color={t.red} />
        <StatCard t={t} label="Total em Atraso" value={fmt(total)} icon="alert" color={t.red} />
        <StatCard t={t} label="Média de Atraso" value={`${Math.round(lista.reduce((s,p)=>s+p.dias,0)/lista.length)} dias`} icon="cal" color={t.yellow} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {lista.map((p, idx) => (
          <Card key={p.id} t={t} style={{ padding: 18, borderLeft: `4px solid ${t.red}`, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.red, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>#{idx+1}</div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontWeight: 800, color: t.text, fontSize: 15 }}>{p.al?.nome || "—"}</div>
              <div style={{ fontSize: 12, color: t.sub }}>{p.al?.responsavel} · {p.al?.whatsapp || p.al?.telefone}</div>
            </div>
            <div style={{ textAlign: "center", minWidth: 50 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: t.red, lineHeight: 1 }}>{p.dias}</div>
              <div style={{ fontSize: 11, color: t.sub }}>dias</div>
            </div>
            <div style={{ textAlign: "right", minWidth: 90 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: t.text }}>{fmt(p.valor)}</div>
              <div style={{ fontSize: 11, color: t.sub }}>Venc. {fmtDate(p.data_vencimento)}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn t={t} variant="success" onClick={() => marcarPago(p.id)}><I n="check" s={15} c="#166534" /> Receber</Btn>
              {p.al && <Btn t={t} variant="wa" onClick={() => { const phone = (p.al.whatsapp||p.al.telefone||"").replace(/\D/g,""); if(!phone) return; window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(`Olá ${p.al.responsavel}! O pagamento de ${p.al.nome} está em atraso há ${p.dias} dias. Valor: ${fmt(p.valor)}.`)}`); }}><I n="wa" s={15} c="#16a34a" /> Cobrar</Btn>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DESPESAS
// ══════════════════════════════════════════════════════════════════════════════
function Despesas({ t, despesas, setDespesas, notify }) {
  const [filt, setFilt] = useState("todas");
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const blank = { descricao: "", categoria: "combustivel", valor: "", data: todayStr, observacao: "" };
  const [form, setForm] = useState(blank);

  const cats = { combustivel: ["🛢️","Combustível","#f59e0b"], manutencao: ["🔧","Manutenção","#8b5cf6"], ipva: ["📄","IPVA","#3b82f6"], salario: ["👷","Salário","#10b981"], outros: ["📦","Outros","#6b7280"] };
  const shown = filt === "todas" ? despesas : despesas.filter(d => d.categoria === filt);
  const totalMes = despesas.filter(d => d.data?.slice(0,7) === currentMes).reduce((s, d) => s + Number(d.valor), 0);

  const save = async () => {
    if (!form.descricao?.trim() || !form.valor) { notify("Preencha todos os campos", "err"); return; }
    setSaving(true);
    const { data, error } = await supabase.from("despesas").insert({ ...form, valor: Number(form.valor) }).select().single();
    if (error) notify("Erro ao salvar", "err"); else { setDespesas([data, ...despesas]); notify("Despesa registrada!"); setModal(false); setForm(blank); }
    setSaving(false);
  };

  const del = async id => {
    if (!confirm("Remover despesa?")) return;
    const { error } = await supabase.from("despesas").delete().eq("id", id);
    if (error) notify("Erro", "err"); else { setDespesas(despesas.filter(d => d.id !== id)); notify("Removida"); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[["todas","Todas"], ...Object.entries(cats).map(([k,v])=>[k,v[1]])].map(([k,l]) => (
            <button key={k} onClick={() => setFilt(k)} style={{ padding: "8px 13px", borderRadius: 8, border: `1.5px solid ${filt===k?t.accent:t.border}`, background: filt===k?t.accentBg:t.card, color: filt===k?t.accent:t.sub, fontWeight: filt===k?700:400, cursor: "pointer", fontSize: 13 }}>{l}</button>
          ))}
        </div>
        <Btn t={t} onClick={() => setModal(true)}><I n="plus" s={16} c="#fff" /> Nova Despesa</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 18 }}>
        <Card t={t} style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: t.sub, marginBottom: 4, fontWeight: 700 }}>TOTAL DO MÊS</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: t.red }}>{fmt(totalMes)}</div>
        </Card>
        {Object.entries(cats).map(([k,[icon,label,color]]) => {
          const total = despesas.filter(d => d.categoria === k).reduce((s,d) => s+Number(d.valor), 0);
          if (!total) return null;
          return <Card key={k} t={t} style={{ padding: 16 }}><div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div><div style={{ fontSize: 18, fontWeight: 800, color: t.text }}>{fmt(total)}</div><div style={{ fontSize: 11, color: t.sub }}>{label}</div></Card>;
        })}
      </div>

      <Card t={t} style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead><tr style={{ background: t.bg }}>
            {["Descrição","Categoria","Data","Valor",""].map((h,i) => <th key={i} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {shown.map(d => { const [icon,,color] = cats[d.categoria] || ["📦","",t.sub]; return (
              <tr key={d.id} style={{ borderTop: `1px solid ${t.border}` }}>
                <td style={{ padding: "11px 16px", color: t.text, fontWeight: 600 }}>{d.descricao}</td>
                <td style={{ padding: "11px 16px" }}><span style={{ background: color+"22", color, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{icon} {cats[d.categoria]?.[1]}</span></td>
                <td style={{ padding: "11px 16px", color: t.sub }}>{fmtDate(d.data)}</td>
                <td style={{ padding: "11px 16px", fontWeight: 800, color: t.red }}>{fmt(d.valor)}</td>
                <td style={{ padding: "11px 16px" }}><Btn t={t} variant="danger" small onClick={() => del(d.id)}><I n="trash" s={13} c={t.red} /></Btn></td>
              </tr>);
            })}
          </tbody>
        </table>
        {shown.length === 0 && <div style={{ padding: 32, textAlign: "center", color: t.sub }}>Nenhuma despesa registrada</div>}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Nova Despesa" t={t}>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <Field label="Descrição"><input value={form.descricao} onChange={e => setForm(p=>({...p,descricao:e.target.value}))} {...inp(t)} /></Field>
          <Field label="Categoria">
            <select value={form.categoria} onChange={e => setForm(p=>({...p,categoria:e.target.value}))} {...inp(t)}>
              {Object.entries(cats).map(([k,[,l]])=><option key={k} value={k}>{l}</option>)}
            </select>
          </Field>
          <Field label="Valor (R$)"><input type="number" value={form.valor} onChange={e => setForm(p=>({...p,valor:e.target.value}))} {...inp(t)} /></Field>
          <Field label="Data"><input type="date" value={form.data} onChange={e => setForm(p=>({...p,data:e.target.value}))} {...inp(t)} /></Field>
          <Field label="Observação"><input value={form.observacao} onChange={e => setForm(p=>({...p,observacao:e.target.value}))} {...inp(t)} /></Field>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <Btn t={t} variant="ghost" onClick={() => setModal(false)}>Cancelar</Btn>
          <Btn t={t} onClick={save}>{saving ? "Salvando..." : "Salvar"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FLUXO DE CAIXA
// ══════════════════════════════════════════════════════════════════════════════
function FluxoCaixa({ t, pagamentos, despesas }) {
  const meses = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - (5-i)); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; });
  const data = meses.map(m => {
    const receita = pagamentos.filter(p => p.mes === m && p.status === "pago").reduce((s,p) => s+Number(p.valor), 0);
    const despesa = despesas.filter(d => d.data?.slice(0,7) === m).reduce((s,d) => s+Number(d.valor), 0);
    return { mes: mesLabel(m), receita, despesa, saldo: receita - despesa };
  });
  const tt = { contentStyle: { background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text }, formatter: v => fmt(v) };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[["Total Entradas", data.reduce((s,d)=>s+d.receita,0), t.green], ["Total Saídas", data.reduce((s,d)=>s+d.despesa,0), t.red], ["Saldo", data.reduce((s,d)=>s+d.saldo,0), data.reduce((s,d)=>s+d.saldo,0)>=0?t.green:t.red]].map(([l,v,c])=>(
          <Card key={l} t={t} style={{ padding: 18, textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 800, color: c }}>{fmt(v)}</div><div style={{ fontSize: 12, color: t.sub, marginTop: 4 }}>{l}</div></Card>
        ))}
      </div>
      <Card t={t} style={{ padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, color: t.text }}>Entradas vs Saídas</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.border} />
            <XAxis dataKey="mes" tick={{ fontSize: 12, fill: t.sub }} />
            <YAxis tick={{ fontSize: 12, fill: t.sub }} tickFormatter={v=>`R$${v}`} />
            <Tooltip {...tt} />
            <Bar dataKey="receita" fill={t.green} radius={[5,5,0,0]} name="Receita" />
            <Bar dataKey="despesa" fill={t.red} radius={[5,5,0,0]} name="Despesa" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card t={t} style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead><tr style={{ background: t.bg }}>
            {["Mês","Entradas","Saídas","Saldo"].map((h,i)=><th key={i} style={{ padding: "11px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {data.map((d,i)=>(
              <tr key={i} style={{ borderTop: `1px solid ${t.border}` }}>
                <td style={{ padding: "11px 20px", fontWeight: 700, color: t.text }}>{d.mes}</td>
                <td style={{ padding: "11px 20px", color: t.green, fontWeight: 700 }}>{fmt(d.receita)}</td>
                <td style={{ padding: "11px 20px", color: t.red, fontWeight: 700 }}>{fmt(d.despesa)}</td>
                <td style={{ padding: "11px 20px", fontWeight: 800, color: d.saldo>=0?t.green:t.red }}>{fmt(d.saldo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RELATÓRIOS
// ══════════════════════════════════════════════════════════════════════════════
function Relatorios({ t, alunos, pagamentos, despesas }) {
  const [mes, setMes] = useState(currentMes);
  const pagsMes = pagamentos.filter(p => p.mes === mes);
  const despMes  = despesas.filter(d => d.data?.slice(0,7) === mes);
  const recebido = pagsMes.filter(p => p.status==="pago").reduce((s,p)=>s+Number(p.valor),0);
  const desp     = despMes.reduce((s,d)=>s+Number(d.valor),0);
  const lucro    = recebido - desp;

  const print = () => {
    const w = window.open("","_blank");
    w.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório ${mes}</title>
    <style>body{font-family:Arial,sans-serif;padding:32px;color:#0f172a;font-size:14px}h1{color:#6366f1;margin-bottom:4px}p.sub{color:#64748b;margin-bottom:24px}h2{font-size:15px;margin:20px 0 8px;color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:4px}table{width:100%;border-collapse:collapse;margin-bottom:8px}th{background:#f8fafc;padding:8px 12px;text-align:left;font-size:12px;color:#64748b;border:1px solid #e2e8f0}td{padding:8px 12px;border:1px solid #e2e8f0}.green{color:#16a34a;font-weight:700}.red{color:#dc2626;font-weight:700}.bold{font-weight:700}footer{margin-top:32px;color:#94a3b8;font-size:11px}</style></head><body>
    <h1>🚌 TransporteEscolar — Relatório Financeiro</h1><p class="sub">Período: ${mesLabel(mes)} | Gerado em ${new Date().toLocaleString("pt-BR")}</p>
    <h2>Resumo Financeiro</h2>
    <table><tr><th>Indicador</th><th>Valor</th></tr>
    <tr><td>Total Recebido</td><td class="green">${fmt(recebido)}</td></tr>
    <tr><td>Total Despesas</td><td class="red">${fmt(desp)}</td></tr>
    <tr><td class="bold">Lucro Líquido</td><td class="${lucro>=0?"green":"red"} bold">${fmt(lucro)}</td></tr>
    <tr><td>Pendente</td><td>${fmt(pagsMes.filter(p=>p.status==="pendente").reduce((s,p)=>s+Number(p.valor),0))}</td></tr>
    <tr><td>Em Atraso</td><td class="red">${fmt(pagsMes.filter(p=>p.status==="atrasado").reduce((s,p)=>s+Number(p.valor),0))}</td></tr>
    <tr><td>Alunos Ativos</td><td>${alunos.filter(a=>a.status==="ativo").length}</td></tr></table>
    <h2>Pagamentos</h2>
    <table><tr><th>Aluno</th><th>Valor</th><th>Status</th><th>Vencimento</th><th>Recebimento</th></tr>
    ${pagsMes.map(p=>{const al=alunos.find(a=>a.id===p.aluno_id);return`<tr><td>${al?.nome||"—"}</td><td>${fmt(p.valor)}</td><td>${p.status}</td><td>${fmtDate(p.data_vencimento)}</td><td>${fmtDate(p.data_pagamento)}</td></tr>`;}).join("")}
    </table>
    <h2>Despesas</h2>
    <table><tr><th>Descrição</th><th>Categoria</th><th>Data</th><th>Valor</th></tr>
    ${despMes.map(d=>`<tr><td>${d.descricao}</td><td>${d.categoria}</td><td>${fmtDate(d.data)}</td><td class="red">${fmt(d.valor)}</td></tr>`).join("")}
    </table><footer>Gerado automaticamente pelo sistema TransporteEscolar</footer></body></html>`);
    w.document.close(); setTimeout(() => w.print(), 300);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 14, color: t.sub, fontWeight: 600 }}>Mês:</label>
          <input type="month" value={mes} onChange={e => setMes(e.target.value)} style={{ ...inp(t).style, width: "auto" }} />
        </div>
        <Btn t={t} onClick={print}><I n="down" s={16} c="#fff" /> Imprimir / Salvar PDF</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 14, marginBottom: 22 }}>
        {[["Recebido", recebido, t.green],["Pendente",pagsMes.filter(p=>p.status==="pendente").reduce((s,p)=>s+Number(p.valor),0),t.yellow],["Atrasado",pagsMes.filter(p=>p.status==="atrasado").reduce((s,p)=>s+Number(p.valor),0),t.red],["Despesas",desp,"#8b5cf6"],["Lucro",lucro,lucro>=0?t.green:t.red],["Alunos Ativos",alunos.filter(a=>a.status==="ativo").length,t.accent]].map(([l,v,c])=>(
          <Card key={l} t={t} style={{ padding: 18 }}><div style={{ fontSize: 22, fontWeight: 800, color: c }}>{typeof v === "number" && l !== "Alunos Ativos" ? fmt(v) : v}</div><div style={{ fontSize: 12, color: t.sub, marginTop: 4 }}>{l}</div></Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card t={t} style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}`, fontWeight: 800, color: t.text }}>Pagamentos do Mês</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ background: t.bg }}>{["Aluno","Valor","Status"].map((h,i)=><th key={i} style={{ padding: "9px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: t.sub }}>{h}</th>)}</tr></thead>
            <tbody>{pagsMes.map(p=>{const al=alunos.find(a=>a.id===p.aluno_id);return<tr key={p.id} style={{borderTop:`1px solid ${t.border}`}}><td style={{padding:"9px 16px",color:t.text}}>{al?.nome}</td><td style={{padding:"9px 16px",fontWeight:700}}>{fmt(p.valor)}</td><td style={{padding:"9px 16px"}}><Badge s={p.status}/></td></tr>;})}</tbody>
          </table>
          {pagsMes.length===0&&<div style={{padding:20,textAlign:"center",color:t.sub,fontSize:13}}>Sem registros</div>}
        </Card>
        <Card t={t} style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${t.border}`, fontWeight: 800, color: t.text }}>Despesas do Mês</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ background: t.bg }}>{["Descrição","Categ.","Valor"].map((h,i)=><th key={i} style={{ padding: "9px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: t.sub }}>{h}</th>)}</tr></thead>
            <tbody>{despMes.map(d=><tr key={d.id} style={{borderTop:`1px solid ${t.border}`}}><td style={{padding:"9px 16px",color:t.text}}>{d.descricao}</td><td style={{padding:"9px 16px",color:t.sub,fontSize:11}}>{d.categoria}</td><td style={{padding:"9px 16px",fontWeight:700,color:t.red}}>{fmt(d.valor)}</td></tr>)}</tbody>
          </table>
          {despMes.length===0&&<div style={{padding:20,textAlign:"center",color:t.sub,fontSize:13}}>Sem registros</div>}
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// AGENDA
// ══════════════════════════════════════════════════════════════════════════════
function Agenda({ t, alunos, pagamentos, despesas }) {
  const now = new Date();
  const [vm, setVm] = useState(now.getMonth());
  const [vy, setVy] = useState(now.getFullYear());
  const dias = new Date(vy, vm+1, 0).getDate();
  const start = new Date(vy, vm, 1).getDay();
  const mesStr = `${vy}-${String(vm+1).padStart(2,"0")}`;

  const eventos = {};
  pagamentos.filter(p => p.mes === mesStr && p.status !== "pago" && p.data_vencimento).forEach(p => {
    const d = parseInt(p.data_vencimento.split("-")[2]);
    if (!eventos[d]) eventos[d] = [];
    const al = alunos.find(a => a.id === p.aluno_id);
    eventos[d].push({ tipo: "pag", label: al?.nome || "Aluno", color: p.status==="atrasado"?"#ef4444":"#f59e0b", valor: p.valor });
  });
  despesas.filter(d => d.data?.slice(0,7) === mesStr).forEach(d => {
    const dia = parseInt(d.data.split("-")[2]);
    if (!eventos[dia]) eventos[dia] = [];
    eventos[dia].push({ tipo: "desp", label: d.descricao, color: "#8b5cf6", valor: d.valor });
  });

  const prev = () => { if (vm===0){setVm(11);setVy(vy-1);}else setVm(vm-1); };
  const next = () => { if (vm===11){setVm(0);setVy(vy+1);}else setVm(vm+1); };
  const isToday = d => d===now.getDate()&&vm===now.getMonth()&&vy===now.getFullYear();

  const proxVenc = pagamentos.filter(p => p.status !== "pago" && p.data_vencimento >= todayStr).sort((a,b)=>a.data_vencimento.localeCompare(b.data_vencimento)).slice(0,8);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card t={t} style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${t.border}` }}>
          <button onClick={prev} style={{ background: "transparent", border: `1.5px solid ${t.border}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: t.text, fontSize: 18 }}>←</button>
          <div style={{ fontSize: 17, fontWeight: 800, color: t.text }}>{mesLabels[vm]} {vy}</div>
          <button onClick={next} style={{ background: "transparent", border: `1.5px solid ${t.border}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: t.text, fontSize: 18 }}>→</button>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
            {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d=><div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:700, color:t.sub, padding:"4px 0" }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
            {Array(start).fill(null).map((_,i)=><div key={"e"+i}/>)}
            {Array(dias).fill(null).map((_,i)=>{
              const d = i+1;
              const ev = eventos[d] || [];
              const td = isToday(d);
              return (
                <div key={d} style={{ minHeight: 58, borderRadius: 8, border: `1.5px solid ${td?t.accent:t.border}`, padding: "4px 5px", background: td?t.accentBg:"transparent" }}>
                  <div style={{ fontSize: 12, fontWeight: td?800:500, color: td?t.accent:t.text, marginBottom: 2 }}>{d}</div>
                  {ev.slice(0,2).map((e,j)=><div key={j} title={e.label+" — "+fmt(e.valor)} style={{ fontSize:9, padding:"1px 4px", borderRadius:3, marginBottom:2, background:e.color+"25", color:e.color, fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{e.label}</div>)}
                  {ev.length>2&&<div style={{fontSize:9,color:t.sub}}>+{ev.length-2}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card t={t}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${t.border}`, fontWeight: 800, color: t.text }}>Próximos Vencimentos Pendentes</div>
        {proxVenc.length === 0 ? <div style={{ padding: 24, textAlign: "center", color: t.sub }}>Nenhum 🎉</div> :
          proxVenc.map(p => { const al = alunos.find(a => a.id === p.aluno_id); return (
            <div key={p.id} style={{ padding: "12px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontWeight: 700, color: t.text, fontSize: 14 }}>{al?.nome}</div><div style={{ fontSize: 12, color: t.sub }}>Venc: {fmtDate(p.data_vencimento)}</div></div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontWeight: 800, color: t.text }}>{fmt(p.valor)}</span><Badge s={p.status} /></div>
            </div>
          );})
        }
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÕES
// ══════════════════════════════════════════════════════════════════════════════
function Configuracoes({ t, notify }) {
  const [cfg, setCfg] = useState({ nome_motorista: "", nome_empresa: "", telefone: "", pix_key: "", msg_cobranca: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("configuracoes").select("chave,valor").then(({ data }) => {
      if (data) { const map = {}; data.forEach(r => { map[r.chave] = r.valor || ""; }); setCfg(c => ({ ...c, ...map })); }
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const updates = Object.entries(cfg).map(([chave, valor]) => supabase.from("configuracoes").upsert({ chave, valor }, { onConflict: "chave" }));
    await Promise.all(updates);
    notify("Configurações salvas!");
    setSaving(false);
  };

  if (loading) return <Spinner t={t} />;

  return (
    <div style={{ maxWidth: 580 }}>
      <Card t={t} style={{ padding: 24, marginBottom: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 20 }}>Dados do Motorista</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[["nome_motorista","Seu Nome"],["nome_empresa","Nome da Empresa"],["telefone","Telefone"],["pix_key","Chave PIX"]].map(([k,l])=>(
            <Field key={k} label={l}><input value={cfg[k]} onChange={e => setCfg(c=>({...c,[k]:e.target.value}))} {...inp(t)} /></Field>
          ))}
        </div>
      </Card>
      <Card t={t} style={{ padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginBottom: 6 }}>Mensagem de Cobrança (WhatsApp)</div>
        <div style={{ fontSize: 12, color: t.sub, marginBottom: 12 }}>Variáveis: <code>{"{responsavel}"}</code>, <code>{"{aluno}"}</code>, <code>{"{mes}"}</code>, <code>{"{valor}"}</code>, <code>{"{dias}"}</code></div>
        <textarea value={cfg.msg_cobranca} onChange={e => setCfg(c=>({...c,msg_cobranca:e.target.value}))} rows={5} style={{ ...inp(t).style, resize: "vertical", lineHeight: 1.6 }} />
        <div style={{ marginTop: 18 }}>
          <Btn t={t} onClick={save}>{saving ? "Salvando..." : "Salvar Configurações"}</Btn>
        </div>
      </Card>
    </div>
  );
}
