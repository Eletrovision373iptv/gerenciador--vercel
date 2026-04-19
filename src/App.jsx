import { useState, useEffect, useCallback } from "react";

// ─── CONFIGURAÇÃO SUPABASE ──────────────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// ─── UTILS ────────────────────────────────────────────────────────────────────
const buildUrl = s => `http://${s.ip}:${s.port}${s.path||""}`;

function copyText(text, set, key) {
  navigator.clipboard.writeText(text).then(() => {
    set(key);
    setTimeout(() => set(null), 1800);
  });
}

function fakeCheck(url, cb) {
  const ok = url.includes("204.12") ? Math.random() > 0.1 : Math.random() > 0.45;
  setTimeout(() => cb(ok ? "online" : "offline"), 800 + Math.random() * 900);
}

// ─── COMPONENTES VISUAIS ──────────────────────────────────────────────────────

function Hero({ onEnter, stats }) {
  return (
    <div style={{ minHeight: "100vh", background: "#080810", fontFamily: "'Sora',sans-serif", display: "flex", flexDirection: "column", overflowX: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 60% at 50% -10%, #f59e0b18 0%, transparent 70%)" }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "60px 20px 40px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f59e0b14", border: "1px solid #f59e0b44", borderRadius: 100, padding: "6px 16px", marginBottom: 28, fontSize: 12, color: "#f59e0b", fontWeight: 700, letterSpacing: 1 }}>⚡ ELETROVISION PRO · MULTI-IP</div>
        <h1 style={{ fontSize: "clamp(32px, 8vw, 54px)", fontWeight: 900, lineHeight: 1.1, color: "#f8f8f8", letterSpacing: -1.5, marginBottom: 20 }}>Gerenciador de IPs<br /><span style={{ background: "linear-gradient(90deg,#f59e0b,#fcd34d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Failover Automático</span></h1>
        <p style={{ fontSize: "clamp(15px, 3.5vw, 18px)", color: "#888", lineHeight: 1.7, marginBottom: 40 }}>Sistema redundante para garantir seus canais sempre online.</p>
        <button onClick={onEnter} style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", color: "#000", borderRadius: 16, padding: "16px 40px", fontSize: 16, cursor: pointer, fontWeight: 900, width: "100%", maxWidth: 360 }}>▶ Acessar Gerenciador</button>
      </div>
    </div>
  );
}

function SourceRow({ src, status, onCheck, onDelete, onCopy, copied }) {
  const url = buildUrl(src);
  return (
    <div style={{ background: "#0f0f22", border: "1px solid #1a1a35", borderRadius: 10, padding: "11px", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ background: "#0d0d20", fontSize: 11, color: "#7dd3fc", padding: "2px 5px", borderRadius: 4 }}>{src.ip}</span>
        <span style={{ color: "#f59e0b", fontSize: 11, fontWeight: 700 }}>{src.port}</span>
        <span style={{ marginLeft: "auto" }}>
          {status === "checking" && <span style={{ fontSize: 10, color: "#f59e0b" }}>⏳</span>}
          {status === "online" && <span style={{ fontSize: 11, color: "#22c55e" }}>● ON</span>}
          {status === "offline" && <span style={{ fontSize: 11, color: "#ef4444" }}>● OFF</span>}
          {!status && <button onClick={onCheck} style={{ background: "transparent", border: "1px solid #222", color: "#555", fontSize: 10, padding: "2px 5px", cursor: "pointer" }}>Testar</button>}
        </span>
      </div>
      <div style={{ display: "flex", gap: 7 }}>
        <button onClick={() => onCopy(url)} style={{ background: "#1a1a2e", border: "1px solid #252535", color: "#bbb", borderRadius: 7, padding: "5px 11px", fontSize: 11, cursor: "pointer" }}>{copied ? "✓ Copiado" : "Copiar URL"}</button>
        <button onClick={onDelete} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#ef444466", cursor: "pointer" }}>🗑</button>
      </div>
    </div>
  );
}

function ChannelCard({ channel, catId, statuses, onCheckSource, onDeleteSource, onAddSource, onDeleteChannel }) {
  const [expanded, setExpanded] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newIp, setNewIp] = useState("");
  const [newPort, setNewPort] = useState("");
  const [copied, setCopied] = useState(null);

  const handleAdd = () => {
    if (!newIp || !newPort) return;
    onAddSource(catId, channel.id, { id: Date.now(), ip: newIp.trim(), port: newPort.trim(), path: "/live", label: `IP ${channel.sources.length + 1}` });
    setNewIp(""); setNewPort(""); setAddOpen(false);
  };

  return (
    <div style={{ background: "#0f0f1e", border: "1.5px solid #1a1a35", borderRadius: 14, marginBottom: 10, overflow: "hidden" }}>
      <div onClick={() => setExpanded(!expanded)} style={{ padding: "12px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#f1f1f1", fontWeight: 700 }}>{channel.name} <small style={{ color: "#444" }}>({channel.sources.length} IPs)</small></span>
        <span style={{ color: "#f59e0b" }}>{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && (
        <div style={{ padding: "14px", borderTop: "1px solid #1a1a35" }}>
          {channel.sources.map(src => (
            <SourceRow key={src.id} src={src} status={statuses[`${channel.id}-${src.id}`]} onCheck={() => onCheckSource(channel.id, src.id, buildUrl(src))} onDelete={() => onDeleteSource(catId, channel.id, src.id)} onCopy={(url) => copyText(url, setCopied, src.id)} copied={copied === src.id} />
          ))}
          {addOpen ? (
            <div style={{ marginTop: 10, display: "flex", gap: 5, flexWrap: "wrap" }}>
              <input placeholder="IP" value={newIp} onChange={e => setNewIp(e.target.value)} style={{ flex: 2, background: "#080818", color: "#fff", border: "1px solid #252535", padding: 8, borderRadius: 5 }} />
              <input placeholder="Porta" value={newPort} onChange={e => setNewPort(e.target.value)} style={{ flex: 1, background: "#080818", color: "#fff", border: "1px solid #252535", padding: 8, borderRadius: 5 }} />
              <button onClick={handleAdd} style={{ width: "100%", background: "#f59e0b", border: "none", padding: 10, borderRadius: 5, fontWeight: "bold", marginTop: 5 }}>Adicionar IP</button>
              <button onClick={() => setAddOpen(false)} style={{ width: "100%", background: "transparent", color: "#555", border: "none", padding: 5 }}>Cancelar</button>
            </div>
          ) : (
            <button onClick={() => setAddOpen(true)} style={{ width: "100%", background: "transparent", border: "1px dashed #1e1e35", color: "#f59e0b", padding: 10, borderRadius: 8, cursor: "pointer" }}>+ Adicionar Novo IP</button>
          )}
          <button onClick={() => onDeleteChannel(catId, channel.id)} style={{ marginTop: 15, color: "#ef444499", background: "none", border: "none", fontSize: 11, cursor: "pointer" }}>🗑 Remover este canal</button>
        </div>
      )}
    </div>
  );
}

function CategoryDetail({ category, onBack, statuses, onCheckSource, onDeleteSource, onAddSource, onDeleteChannel, onUpdateCategory }) {
  const [newName, setNewName] = useState("");
  const addChannel = () => {
    if (!newName) return;
    onUpdateCategory(category.id, { channels: [...category.channels, { id: Date.now(), name: newName.trim(), sources: [] }] });
    setNewName("");
  };

  return (
    <div style={{ padding: 15 }}>
      <button onClick={onBack} style={{ color: "#f59e0b", background: "none", border: "none", marginBottom: 20, cursor: "pointer", fontWeight: "bold" }}>← Voltar para Categorias</button>
      <h2 style={{ color: "#fff", marginBottom: 20 }}>{category.icon} {category.name}</h2>
      <div style={{ marginBottom: 25, display: "flex", gap: 10 }}>
        <input placeholder="Nome do canal (ex: HBO)" value={newName} onChange={e => setNewName(e.target.value)} style={{ flex: 1, padding: 12, background: "#131320", border: "1px solid #1e1e35", color: "#fff", borderRadius: 10 }} />
        <button onClick={addChannel} style={{ padding: "0 20px", background: "#f59e0b", border: "none", borderRadius: 10, fontWeight: "bold" }}>+ Criar</button>
      </div>
      {category.channels.map(ch => (
        <ChannelCard key={ch.id} channel={ch} catId={category.id} statuses={statuses} onCheckSource={onCheckSource} onDeleteSource={onDeleteSource} onAddSource={onAddSource} onDeleteChannel={onDeleteChannel} />
      ))}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("hero");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [statuses, setStatuses] = useState({});

  // Carregar do Supabase
  useEffect(() => {
    async function load() {
      try {
        if (!window.supabase) return;
        const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.from('gerenciador').select('data').eq('id', 1).single();
        if (!error && data) setCategories(data.data || []);
      } catch (e) { console.error("Erro ao carregar:", e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  // Salvar no Supabase (Versão Corrigida com Upsert)
  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase
        .from('gerenciador')
        .upsert({ id: 1, data: categories });

      if (error) throw error;
      alert("✅ Banco de Dados Atualizado!");
    } catch (e) { 
      alert("Erro ao salvar: " + (e.message || "Verifique o console")); 
      console.error(e);
    }
    finally { setSaving(false); }
  };

  const checkSource = (channelId, sourceId, url) => {
    const key = `${channelId}-${sourceId}`;
    setStatuses(p => ({ ...p, [key]: "checking" }));
    fakeCheck(url, res => setStatuses(p => ({ ...p, [key]: res })));
  };

  const updateCat = (id, updates) => setCategories(p => p.map(c => c.id === id ? { ...c, ...updates } : c));
  
  const addSource = (catId, chId, src) => setCategories(p => p.map(cat => cat.id !== catId ? cat : { ...cat, channels: cat.channels.map(ch => ch.id !== chId ? ch : { ...ch, sources: [...ch.sources, src] }) }));

  const deleteSource = (catId, chId, sId) => setCategories(p => p.map(cat => cat.id !== catId ? cat : { ...cat, channels: cat.channels.map(ch => ch.id !== chId ? ch : { ...ch, sources: ch.sources.filter(s => s.id !== sId) }) }));

  const deleteChannel = (catId, chId) => setCategories(p => p.map(cat => cat.id !== catId ? cat : { ...cat, channels: cat.channels.filter(ch => ch.id !== chId) }));

  const deleteCategory = (id) => {
    if(window.confirm("Remover categoria inteira?")) {
      setCategories(p => p.filter(c => c.id !== id));
    }
  };

  if (loading) return <div style={{ background: "#080810", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", fontFamily: "sans-serif" }}>Conectando à Eletrovision...</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #080810; color: #f1f1f1; font-family: 'Sora', sans-serif; }
        .save-float { position: fixed; bottom: 20px; right: 20px; z-index: 999; background: #22c55e; color: #000; border: none; padding: 15px 30px; borderRadius: 50px; fontWeight: 900; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.4); transition: transform 0.2s; }
        .save-float:active { transform: scale(0.95); }
      `}</style>

      {page === "hero" ? (
        <Hero onEnter={() => setPage("manager")} stats={{ cats: categories.length }} />
      ) : (
        <div style={{ minHeight: "100vh", paddingBottom: 100 }}>
          <button className="save-float" onClick={handleSave}>{saving ? "Salvando..." : "💾 SALVAR TUDO"}</button>
          
          {selected ? (
            <CategoryDetail 
              category={categories.find(c => c.id === selected)} 
              onBack={() => setSelected(null)}
              statuses={statuses} onCheckSource={checkSource} onDeleteSource={deleteSource} onAddSource={addSource} onDeleteChannel={deleteChannel} onUpdateCategory={updateCat}
            />
          ) : (
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                <h2 style={{ color: "#f59e0b" }}>Categorias</h2>
                <button onClick={() => setPage("hero")} style={{ background: "none", border: "none", color: "#444", fontSize: 12 }}>Sair</button>
              </div>
              
              <button onClick={() => setCategories([...categories, { id: Date.now(), name: "Nova Categoria", icon: "📂", channels: [] }])} style={{ width: "100%", padding: 20, background: "#1a1a2e", border: "1px dashed #f59e0b", color: "#f59e0b", borderRadius: 15, marginBottom: 25, cursor: "pointer", fontWeight: "bold" }}>+ Adicionar Categoria</button>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                {categories.map(cat => (
                  <div key={cat.id} style={{ position: "relative" }}>
                    <div onClick={() => setSelected(cat.id)} style={{ background: "#0f0f1e", padding: 25, borderRadius: 20, border: "1px solid #1a1a35", textAlign: "center", cursor: "pointer" }}>
                      <div style={{ fontSize: 35, marginBottom: 10 }}>{cat.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{cat.name}</div>
                      <div style={{ fontSize: 11, color: "#444", marginTop: 5 }}>{cat.channels.length} canais</div>
                    </div>
                    <button onClick={() => deleteCategory(cat.id)} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: "#333", cursor: "pointer" }}>✕</button>
                  </div>
                ))}
              </div>
              {categories.length === 0 && <p style={{ textAlign: "center", color: "#333", marginTop: 50 }}>Nenhuma categoria criada.</p>}
            </div>
          )}
        </div>
      )}
    </>
  );
}
