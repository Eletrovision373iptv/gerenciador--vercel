import { useState, useEffect } from "react";

export default function App() {
  const [canais, setCanais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [view, setView] = useState("landing");

  // Função que força o carregamento da biblioteca se a Vercel falhar
  async function carregarSupabase() {
    if (window.supabase) return window.supabase;
    
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-client@2";
      script.onload = () => resolve(window.supabase);
      script.onerror = () => reject(new Error("Falha ao baixar biblioteca. Verifique sua internet."));
      document.head.appendChild(script);
    });
  }

  async function fetchCanais() {
    setLoading(true);
    setErro(null);
    try {
      const supabaseLib = await carregarSupabase();
      const supabase = supabaseLib.createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_KEY
      );

      const { data, error } = await supabase.from('canais').select('*');
      if (error) throw error;
      setCanais(data || []);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (view === "painel") fetchCanais();
  }, [view]);

  if (view === "landing") {
    return (
      <div style={{ backgroundColor: '#0a0a0c', minHeight: '100vh', color: '#fff', textAlign: 'center', padding: '20px' }}>
        <h1 style={{ color: '#f59e0b', marginTop: '50px' }}>Eletrovision Pro</h1>
        <button 
          onClick={() => setView("painel")}
          style={{ width: '100%', padding: '20px', backgroundColor: '#f59e0b', borderRadius: '15px', fontWeight: 'bold', marginTop: '30px', border: 'none' }}
        >
          ▶ ACESSAR AGORA
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0a0a0c', minHeight: '100vh', color: '#fff', padding: '15px' }}>
      <button onClick={() => setView("landing")} style={{ color: '#f59e0b', background: 'none', border: 'none' }}>← Voltar</button>
      
      {erro && (
        <div style={{ background: '#450a0a', padding: '15px', borderRadius: '10px', marginTop: '20px', border: '1px solid #f87171' }}>
          <p>Erro: {erro}</p>
          <button onClick={fetchCanais} style={{ background: '#f87171', border: 'none', padding: '5px', borderRadius: '5px', color: '#fff' }}>Tentar de novo</button>
        </div>
      )}

      {loading ? <p style={{textAlign:'center'}}>Conectando ao Banco...</p> : (
        <div style={{ marginTop: '20px' }}>
          {canais.length === 0 && !erro && <p style={{textAlign:'center'}}>Conectado! Mas a tabela está vazia no Supabase.</p>}
          {canais.map(c => (
            <div key={c.id} style={{ background: '#16161e', padding: '15px', borderRadius: '12px', marginBottom: '10px' }}>
              <p style={{ color: '#f59e0b', margin: 0 }}>{c.nome}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
