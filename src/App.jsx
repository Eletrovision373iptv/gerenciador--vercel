import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── INICIALIZAÇÃO DO SUPABASE ──────────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ─── UTILITÁRIOS ────────────────────────────────────────────────────────────
const buildUrl = s => `http://${s.ip}:${s.port}${s.path || ""}`;

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

// ─── COMPONENTES VISUAIS ────────────────────────────────────────────────────

function Hero({ onEnter }) {
  return (
    <div style={{ minHeight: "100vh", background: "#080810", fontFamily: "'Sora',sans-serif", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% -10%, #f59e0b18 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto", padding: "20px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#f59e0b14", border: "1px solid #f59e0b44", borderRadius: 100, padding: "6px 16px", marginBottom: 20, fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>⚡ ELETROVISION PRO</div>
        <h1 style={{ fontSize: "42px", fontWeight: 900, color: "#f8f8f8", marginBottom: 20, lineHeight: 1.1 }}>Gerenciador de IPs<br /><span style={{ color: "#f59e0b" }}>Failover Ativo</span></h1>
        <button onClick={onEnter} style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", color: "#000", borderRadius: 12, padding: "18px 40px", fontSize: 16, cursor: "pointer", fontWeight: 900, width: "100%" }}>ABRIR PAINEL</button>
      </div>
    </div>
  );
}

function SourceRow({ src, status, onCheck, onDelete, onCopy, copied }) {
  const url = buildUrl(src);
  return (
    <div style={{ background: "#0f0f22", border: "1px solid #1a1a35", borderRadius: 10, padding: "12px", marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <code style={{ color: "#7dd3fc", fontSize: 12 }}>{src.ip}:{src.port}</code>
        <span style={{ fontSize: 11 }}>
          {status === "checking" ? "⏳" : status === "online" ? "🟢 ON" : status === "offline" ? "🔴 OFF" : <button onClick={onCheck} style={{ color: "#555", background: "none", border: "none", cursor: "pointer" }}>Testar</button>}
        </span>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => onCopy(url)} style={{ flex: 1, background: "#1a1a2e", border: "1px solid #252535", color: "#bbb", borderRadius: 6, padding: "6px", fontSize: 11 }}>{copied ? "✓ Copiado" : "Copiar"}</button>
        <button onClick={onDelete} style={{ color: "#ef4444", background: "none", border: "none" }}>🗑</button>
      </div>
    </div>
  );
}

function CategoryDetail({ category, onBack, statuses, onCheckSource, onDeleteSource, onAddSource, onDeleteChannel, onUpdateCategory }) {
  const [newName, setNewName] = useState("");
  const addChannel = () => {
    if (!newName) return;
    onUpdateCategory(category.id, { channels: [...category.channels, { id: Date.now(), name: newName, sources: [] }] });
    setNewName("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={onBack} style={{ color: "#f59e0b", background: "none", border: "none", marginBottom: 20 }}>← Voltar</button>
      <h2 style={{ marginBottom: 20 }}>{category.icon} {category.name}</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input placeholder="Nome do canal" value={newName} onChange={e => setNewName(e.target.value)} style={{ flex: 1, padding: "12px", background: "#131320", border: "1px solid #1e1e35", color: "#fff", borderRadius: 8 }} />
        <button onClick={addChannel} style={{ background: "#f59e0b", border: "none", padding: "0 15px", borderRadius: 8, fontWeight: "bold" }}>+</button>
      </div>
      {category.channels.map(ch => (
        <div key={ch.id} style={{ background: "#0f0f1e", borderRadius: 12, marginBottom: 10, padding: "10px", border: "1px solid #1a1a35" }}>
          <div style={{ fontWeight: "bold", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
            {ch.name}
            <button onClick={() => onDeleteChannel(category.id, ch.id)} style={{ color: "#ef4444", background: "none", border: "none", fontSize: 10 }}>Remover</button>
          </div>
          {ch.sources.map(src => (
            <SourceRow key={src.id} src={src} status={statuses[`${ch.id}-${src.id}`]} onCheck={() => onCheckSource(ch.id, src.id, buildUrl(src))} onDelete={() => onDeleteSource(category.id, ch.id, src.id)} onCopy={(url) => copyText(url, () => {}, src.id)} />
          ))}
          <button onClick={() => {
            const ip = prompt("Digite o IP:");
            const port = prompt("Digite a Porta:");
            if(ip && port) onAddSource(category.id, ch.id, { id: Date.now(), ip, port, label: "Novo IP" });
          }} style={{ width: "100%", background: "none", border: "1px dashed #333", color: "#666", padding: "8px", borderRadius: 8, marginTop: 5 }}>+ Add IP</button>
        </div>
      ))}
    </div>
  );
}

// ─── APP PRINCIPAL ───────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("hero");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase.from('gerenciador').select('data').eq('id', 1).single();
        if (!error && data) setCategories(data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('gerenciador').upsert({ id: 1, data: categories });
      if (error) throw error;
      alert("✅ Salvo com sucesso!");
    } catch (e) { alert("Erro ao salvar: " + e.message); }
    finally { setSaving(false); }
  };

  const updateCat = (id, updates) => setCategories(p => p.map(c => c.id === id ? { ...c, ...updates } : c));
  const addSource = (catId, chId, src) => setCategories(p => p.map(cat => cat.id !== catId ? cat : { ...cat, channels: cat.channels.map(ch => ch.id !== chId ? ch : { ...ch, sources: [...ch.sources, src] }) }));
  const deleteSource = (catId, chId, sId) => setCategories(p => p.map(cat => cat.id !== catId ? cat : { ...cat, channels: cat.channels.map(ch => ch.id !== chId ? ch : { ...ch, sources: ch.sources.filter(s => s.id !== sId) }) }));
  const deleteChannel = (catId, chId) => setCategories(p => p.map(cat => cat.id !== catId ? cat : { ...cat, channels: cat.channels.filter(ch => ch.id !== chId) }));

  if (loading) return <div style={{ background: "#080810", height: "100vh", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>Carregando Eletrovision...</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #080810; color: #f1f1f1; font-family: 'Sora', sans-serif; }
      `}</style>

      {page === "hero" ? (
        <Hero onEnter={() => setPage("manager")} />
      ) : (
        <div style={{ minHeight: "100vh", paddingBottom: "100px" }}>
          {selected ? (
            <CategoryDetail 
              category={categories.find(c => c.id === selected)} onBack={() => setSelected(null)}
              statuses={statuses} onCheckSource={(chId, sId, url) => {
                setStatuses(p => ({ ...p, [`${chId}-${sId}`]: "checking" }));
                fakeCheck(url, res => setStatuses(p => ({ ...p, [`${chId}-${sId}`]: res })));
              }}
              onDeleteSource={deleteSource} onAddSource={addSource} onDeleteChannel={deleteChannel} onUpdateCategory={updateCat}
            />
          ) : (
            <div style={{ padding: "20px" }}>
              <h2 style={{ color: "#f59e0b", marginBottom: 20 }}>Categorias</h2>
              <button onClick={() => setCategories([...categories, { id: Date.now(), name: "Nova Categoria", icon: "📂", channels: [] }])} style={{ width: "100%", padding: "15px", background: "#1a1a2e", border: "1px dashed #f59e0b", color: "#f59e0b", borderRadius: 12, marginBottom: 20 }}>+ Nova Categoria</button>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {categories.map(cat => (
                  <div key={cat.id} onClick={() => setSelected(cat.id)} style={{ background: "#0f0f1e", padding: "20px", borderRadius: 15, border: "1px solid #1a1a35", textAlign: "center" }}>
                    <div style={{ fontSize: "30px" }}>{cat.icon}</div>
                    <div style={{ fontWeight: "bold", fontSize: "14px" }}>{cat.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button onClick={handleSave} style={{ position: "fixed", bottom: "20px", right: "20px", background: "#22c55e", color: "#000", border: "none", padding: "15px 25px", borderRadius: "50px", fontWeight: "900", boxShadow: "0 10px 20px rgba(0,0,0,0.5)" }}>
            {saving ? "Salvando..." : "💾 SALVAR TUDO"}
          </button>
        </div>
      )}
    </>
  );
}
