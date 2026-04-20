import { useState, useEffect } from "react";

// --- CONFIGURAÇÃO ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export default function App() {
  const [page, setPage] = useState("hero");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [db, setDb] = useState(null);

  // 1. INICIALIZAÇÃO SEGURA DO SUPABASE
  useEffect(() => {
    const initSupabase = async () => {
      try {
        // Importa a biblioteca dinamicamente para garantir que ela carregue
        const { createClient } = await import("@supabase/supabase-js");
        const client = createClient(supabaseUrl, supabaseKey);
        setDb(client);

        // Busca os dados iniciais
        const { data, error } = await client
          .from("gerenciador")
          .select("data")
          .eq("id", 1)
          .single();

        if (!error && data) setCategories(data.data || []);
      } catch (e) {
        console.error("Erro ao carregar banco:", e);
      } finally {
        setLoading(false);
      }
    };
    initSupabase();
  }, []);

  // 2. FUNÇÃO DE SALVAMENTO BLINDADA
  const handleSave = async () => {
    if (!db) return alert("Erro: Banco ainda não carregou!");
    
    setSaving(true);
    try {
      const { error } = await db
        .from("gerenciador")
        .upsert({ id: 1, data: categories });

      if (error) throw error;
      alert("✅ Eletrovision: Salvo no Banco!");
    } catch (e) {
      alert("Erro ao salvar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // --- LÓGICA DE INTERFACE ---
  const addCategory = () => {
    setCategories([...categories, { id: Date.now(), name: "Nova Categoria", icon: "📺", channels: [] }]);
  };

  const deleteCategory = (id) => {
    if(confirm("Excluir categoria?")) setCategories(categories.filter(c => c.id !== id));
  };

  if (loading) return (
    <div style={{ background: "#080810", height: "100vh", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      ⚡ INICIALIZANDO BANCO...
    </div>
  );

  return (
    <div style={{ background: "#080810", minHeight: "100vh", color: "#f1f1f1", fontFamily: "sans-serif" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .card { background: #0f0f1e; border: 1px solid #1a1a35; padding: 20px; border-radius: 15px; text-align: center; cursor: pointer; position: relative; }
        .btn-save { position: fixed; bottom: 20px; right: 20px; background: #22c55e; color: #000; border: none; padding: 15px 25px; border-radius: 50px; font-weight: 900; z-index: 100; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
      `}</style>

      {page === "hero" ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", textAlign: "center", padding: 20 }}>
          <h1 style={{ color: "#f59e0b", fontSize: 40, marginBottom: 20 }}>Eletrovision Pro</h1>
          <p style={{ color: "#888", marginBottom: 30 }}>Gerenciador de IPs e Failover</p>
          <button onClick={() => setPage("manager")} style={{ background: "#f59e0b", border: "none", padding: "15px 40px", borderRadius: 10, fontWeight: "bold", width: "100%", maxWidth: 300 }}>ENTRAR</button>
        </div>
      ) : (
        <div style={{ padding: 20 }}>
          <h2 style={{ color: "#f59e0b", marginBottom: 20 }}>Suas Categorias</h2>
          
          <button onClick={addCategory} style={{ width: "100%", padding: 15, background: "transparent", border: "1px dashed #333", color: "#666", borderRadius: 10, marginBottom: 20 }}>
            + Adicionar Categoria
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
            {categories.map(cat => (
              <div key={cat.id} className="card" onClick={() => alert("Função de abrir canais aqui")}>
                <div style={{ fontSize: 30 }}>{cat.icon}</div>
                <div style={{ fontWeight: "bold", marginTop: 10 }}>{cat.name}</div>
                <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }} style={{ position: "absolute", top: 5, right: 10, background: "none", border: "none", color: "#ef4444" }}>×</button>
              </div>
            ))}
          </div>

          <button className="btn-save" onClick={handleSave}>
            {saving ? "⏳ SALVANDO..." : "💾 SALVAR TUDO"}
          </button>
        </div>
      )}
    </div>
  );
}
