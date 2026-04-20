import { useState, useEffect } from "react";

// --- ESTILOS GLOBAIS ---
const styles = {
  container: { background: "#080810", minHeight: "100vh", color: "#f1f1f1", fontFamily: "'Sora', sans-serif", padding: "15px" },
  card: { background: "linear-gradient(145deg, #0f0f1e, #131326)", border: "1px solid #1a1a35", borderRadius: "16px", padding: "20px", marginBottom: "15px" },
  badgeOnline: { background: "#065f46", color: "#34d399", fontSize: "10px", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold" },
  badgeOffline: { background: "#7f1d1d", color: "#f87171", fontSize: "10px", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold" },
  btnPro: { background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "900", cursor: "pointer", width: "100%" },
  input: { background: "#131320", border: "1px solid #1e1e35", color: "#fff", padding: "12px", borderRadius: "8px", width: "100%", marginBottom: "10px" }
};

export default function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedChan, setSelectedChan] = useState(null);

  // Carregar dados salvos
  useEffect(() => {
    const saved = localStorage.getItem("eletrovision_pro_data");
    if (saved) setCategories(JSON.parse(saved));
  }, []);

  const saveAll = (newData) => {
    const data = newData || categories;
    setCategories(data);
    localStorage.setItem("eletrovision_pro_data", JSON.stringify(data));
  };

  // Funções de Gestão
  const addCategory = () => {
    const name = prompt("Nome da Categoria:");
    if (name) saveAll([...categories, { id: Date.now(), name, icon: "📂", channels: [] }]);
  };

  const addChannel = (catId) => {
    const name = prompt("Nome do Canal:");
    if (!name) return;
    const newCats = categories.map(cat => cat.id === catId ? { ...cat, channels: [...cat.channels, { id: Date.now(), name, sources: [] }] } : cat);
    saveAll(newCats);
  };

  const addSource = (catId, chanId) => {
    const ip = prompt("IP do Servidor:");
    const port = prompt("Porta:");
    if (!ip || !port) return;
    const newCats = categories.map(cat => {
      if (cat.id !== catId) return cat;
      return { ...cat, channels: cat.channels.map(ch => ch.id === chanId ? { ...ch, sources: [...ch.sources, { id: Date.now(), ip, port, status: "online" }] } : ch) };
    });
    saveAll(newCats);
  };

  // --- TELAS ---

  // 1. Home (Categorias)
  if (!selectedCat) return (
    <div style={styles.container}>
      <header style={{ textAlign: "center", padding: "20px 0" }}>
        <h1 style={{ color: "#f59e0b", fontSize: "24px", fontWeight: "900" }}>ELETROVISION PRO</h1>
        <p style={{ color: "#666", fontSize: "12px" }}>GERENCIADOR DE FAILOVER</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {categories.map(cat => (
          <div key={cat.id} onClick={() => setSelectedCat(cat)} style={styles.card}>
            <div style={{ fontSize: "30px", marginBottom: "10px" }}>{cat.icon}</div>
            <div style={{ fontWeight: "bold" }}>{cat.name}</div>
            <div style={{ fontSize: "10px", color: "#555" }}>{cat.channels.length} Canais</div>
          </div>
        ))}
        <div onClick={addCategory} style={{ ...styles.card, border: "1px dashed #f59e0b", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
          + Nova Categoria
        </div>
      </div>
    </div>
  );

  // 2. Canais da Categoria
  if (selectedCat && !selectedChan) return (
    <div style={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button onClick={() => setSelectedCat(null)} style={{ color: "#f59e0b", background: "none", border: "none" }}>← Voltar</button>
        <button style={{ background: "#f59e0b", color: "#000", border: "none", padding: "5px 12px", borderRadius: "5px", fontWeight: "bold" }}>↓ M3U</button>
      </div>
      <h2 style={{ marginBottom: "20px" }}>{selectedCat.name}</h2>
      {selectedCat.channels.map(chan => (
        <div key={chan.id} onClick={() => setSelectedChan(chan)} style={{ ...styles.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: "bold" }}>{chan.name}</div>
            <div style={{ fontSize: "10px", color: "#4ade80" }}>{chan.sources.length} IPs configurados</div>
          </div>
          <span>➜</span>
        </div>
      ))}
      <button onClick={() => addChannel(selectedCat.id)} style={styles.btnPro}>+ ADICIONAR CANAL</button>
    </div>
  );

  // 3. Detalhe do Canal (Failover e IPs)
  return (
    <div style={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button onClick={() => setSelectedChan(null)} style={{ color: "#f59e0b", background: "none", border: "none" }}>← Voltar</button>
        <div style={styles.badgeOnline}>⚡ FAILOVER ATIVO</div>
      </div>
      
      <h2 style={{ marginBottom: "5px" }}>{selectedChan.name}</h2>
      <p style={{ color: "#666", fontSize: "12px", marginBottom: "20px" }}>Primeiro IP online é usado, se cair o próximo assume.</p>

      {selectedChan.sources.map((src, index) => (
        <div key={src.id} style={{ ...styles.card, borderLeft: index === 0 ? "4px solid #f59e0b" : "1px solid #1a1a35" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", color: "#f59e0b", fontWeight: "bold" }}>IP {index + 1}</span>
            <span style={src.status === "online" ? styles.badgeOnline : styles.badgeOffline}>● {src.status.toUpperCase()}</span>
          </div>
          <div style={{ background: "#080810", padding: "10px", borderRadius: "6px", fontSize: "13px", marginBottom: "15px", color: "#7dd3fc" }}>
            http://{src.ip}:{src.port}/live/user/pass/id.ts
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={{ flex: 1, background: "#1a1a2e", color: "#fff", border: "1px solid #333", padding: "8px", borderRadius: "6px", fontSize: "12px" }}>Copiar URL</button>
            <button style={{ flex: 1, background: "#f59e0b", color: "#000", border: "none", padding: "8px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" }}>▶ Player</button>
          </div>
        </div>
      ))}

      <button onClick={() => addSource(selectedCat.id, selectedChan.id)} style={styles.btnPro}>+ ADICIONAR NOVO IP</button>
    </div>
  );
}
