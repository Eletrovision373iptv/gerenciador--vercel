import { useState, useEffect } from "react";

// ─── CONFIGURAÇÃO ──────────────────────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "";

// Função auxiliar para evitar erro de tela preta se o supabase não carregar
const getSupabase = () => {
  if (window.supabase) {
    return window.supabase.createClient(supabaseUrl, supabaseKey);
  }
  return null;
};

const buildUrl = s => `http://${s.ip}:${s.port}${s.path || ""}`;

// ─── COMPONENTES VISUAIS ───────────────────────────────────────────────────

function Hero({ onEnter }) {
  return (
    <div style={{ minHeight: "100vh", background: "#080810", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20 }}>
      <h1 style={{ fontSize: "42px", fontWeight: 900, color: "#f8f8f8", marginBottom: 10 }}>ELETROVISION <span style={{ color: "#f59e0b" }}>PRO</span></h1>
      <p style={{ color: "#888", marginBottom: 30 }}>Gerenciador de IPs com Failover Automático</p>
      <button onClick={onEnter} style={{ background: "#f59e0b", border: "none", color: "#000", borderRadius: 12, padding: "16px 40px", fontSize: "16px", cursor: "pointer", fontWeight: "bold" }}>Acessar Painel</button>
    </div>
  );
}

function SourceRow({ src, status, onCheck, onDelete, onCopy, copied }) {
  const url = buildUrl(src);
  return (
    <div style={{ background: "#0f0f22", border: "1px solid #1a1a35", borderRadius: 10, padding: "10px", marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ color: "#7dd3fc", fontSize: "12px" }}>{src.ip}:{src.port}</span>
        <span style={{ fontSize: "11px" }}>
          {status === "online" ? <span style={{ color: "#22c55e" }}>● ON</span> : status === "offline" ? <span style={{ color: "#ef4444" }}>● OFF</span> : <button onClick={onCheck} style={{ background: "none", border: "none", color: "#555", cursor: "pointer" }}>Testar</button>}
        </span>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => onCopy(url)} style={{ flex: 1, background: "#1a1a2e", border: "1px solid #252535", color: "#bbb", borderRadius: 5, padding: "5px", fontSize: "11px" }}>{copied ? "Copiado!" : "Copiar"}</button>
        <button onClick={onDelete} style={{ background: "none", border: "none", color: "#ef444466" }}>🗑</button>
      </div>
    </div>
  );
}

function ChannelCard({ channel, catId, statuses, onCheckSource, onDeleteSource, onAddSource, onDeleteChannel }) {
  const [expanded, setExpanded] = useState(false);
  const [newIp, setNewIp] = useState("");
  const [newPort, setNewPort] = useState("");

  return (
    <div style={{ background: "#0f0f1e", border: "1px solid #1a1a35", borderRadius: 12, marginBottom: 10 }}>
      <div onClick={() => setExpanded(!expanded)} style={{ padding: "15px", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
        <span>{channel.name} ({channel.sources.length})</span>
        <span>{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && (
        <div style={{ padding: "15px", borderTop: "1px solid #1a1a35" }}>
          {channel.sources.map(src => (
            <SourceRow key={src.id} src={src} status={statuses[`${channel.id}-${src.id}`]} onCheck={() => onCheckSource(channel.id, src.id, buildUrl(src))} onDelete={() => onDeleteSource(catId, channel.id, src.id)} onCopy={(url) => { navigator.clipboard.writeText(url); alert("Copiado!"); }} />
          ))}
          <div style={{ marginTop: 10, display: "flex", gap: 5 }}>
            <input placeholder="IP" value={newIp} onChange={e => setNewIp(e.target.value)} style={{ flex: 2, background: "#000", color: "#fff", border: "1px solid #222", padding: "8px" }} />
            <input placeholder="Porta" value={newPort} onChange={e => setNewPort(e.target.value)} style={{ flex: 1, background: "#000", color: "#fff", border: "1px solid #222", padding: "8px" }} />
            <button onClick={() => { onAddSource(catId, channel.id, { id: Date.now(), ip: newIp, port: newPort }); setNewIp(""); setNewPort(""); }} style={{ background: "#f59e0b", border: "none", padding: "8px" }}>+</button>
          </div>
          <button onClick={() => onDeleteChannel(catId, channel.id)} style={{ color: "#ef4444", background: "none", border: "none", marginTop: 15, fontSize: "11px" }}>Remover Canal</button>
        </div>
      )}
    </div>
  );
}

// ─── APP PRINCIPAL ──────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("hero");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      if (supabase) {
        const { data } = await supabase.from('gerenciador').select('data').eq('id', 1).single();
        if (data) setCategories(data.data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    const supabase = getSupabase();
    if (!supabase) return alert("Erro: Supabase não carregado");
    const { error } = await supabase.from('gerenciador').upsert({ id: 1, data: categories });
    if (error) alert("Erro: " + error.message);
    else alert("✅ Salvo com sucesso!");
  };

  if (loading) return <div style={{ background: "#080810", height: "100vh", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>Carregando...</div>;

  return (
    <div style={{ fontFamily: "sans-serif", color: "#fff" }}>
      {page === "hero" ? (
        <Hero onEnter={() => setPage("manager")} />
      ) : (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
          {selected ? (
            <div>
              <button onClick={() => setSelected(null)} style={{ color: "#f59e0b", background: "none", border: "none", marginBottom: 20 }}>← Voltar</button>
              {categories.find(c => c.id === selected).channels.map(ch => (
                <ChannelCard key={ch.id} channel={ch} catId={selected} statuses={statuses} 
                  onAddSource={(catId, chId, src) => setCategories(prev => prev.map(c => c.id === catId ? { ...c, channels: c.channels.map(h => h.id === chId ? { ...h, sources: [...h.sources, src] } : h) } : c))}
                  onDeleteChannel={(catId, chId) => setCategories(prev => prev.map(c => c.id === catId ? { ...c, channels: c.channels.filter(h => h.id !== chId) } : c))}
                />
              ))}
              <button onClick={() => {
                const name = prompt("Nome do canal:");
                if(name) setCategories(prev => prev.map(c => c.id === selected ? { ...c, channels: [...c.channels, { id: Date.now(), name, sources: [] }] } : c));
              }} style={{ width: "100%", padding: "15px", background: "#f59e0b", border: "none", borderRadius: 8, fontWeight: "bold" }}>+ Novo Canal</button>
            </div>
          ) : (
            <div>
              <h2 style={{ marginBottom: 20 }}>Categorias</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {categories.map(cat => (
                  <div key={cat.id} onClick={() => setSelected(cat.id)} style={{ background: "#0f0f1e", padding: "20px", borderRadius: 15, textAlign: "center", border: "1px solid #1a1a35" }}>
                    <div style={{ fontSize: "24px" }}>📂</div>
                    <div style={{ marginTop: "10px" }}>{cat.name}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setCategories([...categories, { id: Date.now(), name: "Nova Categoria", channels: [] }])} style={{ width: "100%", padding: "15px", background: "none", border: "1px dashed #f59e0b", color: "#f59e0b", marginTop: 20, borderRadius: 10 }}>+ Adicionar Categoria</button>
            </div>
          )}
          
          <button onClick={handleSave} style={{ position: "fixed", bottom: 20, right: 20, background: "#22c55e", color: "#000", border: "none", padding: "15px 25px", borderRadius: 50, fontWeight: "bold", boxShadow: "0 4px 15px rgba(0,0,0,0.5)" }}>💾 SALVAR TUDO</button>
        </div>
      )}
    </div>
  );
}
