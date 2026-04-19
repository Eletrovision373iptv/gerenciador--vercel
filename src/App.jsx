import { useState, useEffect, useCallback } from "react";

// --- CONFIGURAÇÃO SUPABASE ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// --- UTILS ---
const buildUrl = s => `http://${s.ip}:${s.port}${s.path||""}`;
function fakeCheck(url,cb){
  const ok=url.includes("204.12")?Math.random()>0.1:Math.random()>0.45;
  setTimeout(()=>cb(ok?"online":"offline"),800+Math.random()*900);
}

// ─── COMPONENTES DE INTERFACE (HERO, SOURCEROW, ETC) ──────────────────
// (A lógica visual que você enviou integrada com as funções de salvamento)

export default function App() {
  const [page, setPage] = useState("hero");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // CARREGAR DADOS DO SUPABASE
  async function loadData() {
    setLoading(true);
    try {
      const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.from('gerenciador').select('data').eq('id', 1).single();
      if (error) throw error;
      setCategories(data.data || []);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  }

  // SALVAR DADOS NO SUPABASE
  async function saveData() {
    setSaving(true);
    try {
      const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('gerenciador').update({ data: categories }).eq('id', 1);
      if (error) throw error;
      alert("✅ Sistema sincronizado com o servidor!");
    } catch (err) {
      alert("❌ Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  // Renderização das Páginas (Landing ou Gerenciador)
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#080810;color:#f1f1f1; font-family: 'Sora', sans-serif;}
        .save-btn { position: fixed; bottom: 20px; right: 20px; z-index: 100; background: #22c55e; color: #000; border: none; padding: 15px 25px; borderRadius: 50px; fontWeight: bold; cursor: pointer; boxShadow: 0 10px 20px rgba(0,0,0,0.5); }
      `}</style>

      {page === "hero" ? (
        <Hero onEnter={() => setPage("manager")} stats={{cats: categories.length, channels: 0}} />
      ) : (
        <div style={{position: 'relative'}}>
            <Manager 
                onBack={() => setPage("hero")} 
                categories={categories} 
                setCategories={setCategories} 
            />
            {/* BOTÃO FLUTUANTE PARA SALVAR NO SUPABASE */}
            <button className="save-btn" onClick={saveData}>
                {saving ? "Salvando..." : "💾 SALVAR TUDO"}
            </button>
        </div>
      )}
    </>
  );
}

// Reutilize aqui as funções Hero, Manager, CategoryCard que você enviou no seu código original...
// Apenas certifique-se de que os nomes das funções batam com o que o App() está chamando.
