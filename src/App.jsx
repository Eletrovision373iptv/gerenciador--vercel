import { useState, useEffect } from "react";

export default function App() {
  const [page, setPage] = useState("manager");
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);

  // Carrega os dados do celular ao abrir
  useEffect(() => {
    const saved = localStorage.getItem("eletrovision_data");
    if (saved) setCategories(JSON.parse(saved));
  }, []);

  // Salva no celular na hora
  const handleSave = () => {
    localStorage.setItem("eletrovision_data", JSON.stringify(categories));
    alert("✅ SALVO NO CELULAR!");
  };

  const addCategory = () => {
    setCategories([...categories, { id: Date.now(), name: "Nova Categoria", icon: "📺", channels: [] }]);
  };

  return (
    <div style={{ background: "#080810", minHeight: "100vh", color: "#f1f1f1", fontFamily: "sans-serif", padding: 20 }}>
      <h2 style={{ color: "#f59e0b", marginBottom: 20 }}>Eletrovision Offline</h2>
      
      {selected ? (
        <div>
          <button onClick={() => setSelected(null)} style={{color: "#f59e0b", background: "none", border: "none", marginBottom: 20}}>← Voltar</button>
          <h3>Categoria: {categories.find(c => c.id === selected)?.name}</h3>
          <p style={{marginTop: 20, color: "#666"}}>Adicione seus canais aqui...</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
          <button onClick={addCategory} style={{ gridColumn: "1/-1", padding: 15, background: "#1a1a2e", border: "1px dashed #f59e0b", color: "#f59e0b", borderRadius: 10 }}>
            + Nova Categoria
          </button>
          {categories.map(cat => (
            <div key={cat.id} onClick={() => setSelected(cat.id)} style={{ background: "#0f0f1e", padding: 20, borderRadius: 15, border: "1px solid #1a1a35", textAlign: "center" }}>
              <div style={{ fontSize: 30 }}>{cat.icon}</div>
              <div style={{ fontWeight: "bold" }}>{cat.name}</div>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleSave} style={{ position: "fixed", bottom: 20, right: 20, background: "#22c55e", color: "#000", border: "none", padding: "15px 25px", borderRadius: 50, fontWeight: "bold" }}>
        💾 SALVAR AGORA
      </button>
    </div>
  );
}
