import { useState, useEffect } from "react";

// Inicialização segura fora do componente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export default function App() {
  const [canais, setCanais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [view, setView] = useState("landing");

  // Função para buscar dados com tratamento de erro real
  async function fetchCanais() {
    setLoading(true);
    setErro(null);
    try {
      if (!window.supabase) {
        throw new Error("Biblioteca Supabase não carregada no index.html");
      }
      const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.from('canais').select('*');
      
      if (error) throw error;
      setCanais(data || []);
    } catch (err) {
      setErro(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (view === "painel") fetchCanais();
  }, [view]);

  async function salvarIp(id, novosLinks) {
    try {
      const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('canais').update({ links: novosLinks }).eq('id', id);
      if (error) throw error;
      alert("✅ Atualizado!");
    } catch (err) {
      alert("❌ Erro: " + err.message);
    }
  }

  if (view === "landing") {
    return (
      <div style={{ backgroundColor: '#0a0a0c', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '20px' }}>
        <header style={{ textAlign: 'center', padding: '40px 0' }}>
          <h2 style={{ color: '#fff', fontSize: '28px' }}>Eletrovision</h2>
          <h1 style={{ color: '#f59e0b', fontSize: '36px', marginTop: '-10px' }}>Gerenciador Pro</h1>
        </header>
        <button 
          onClick={() => setView("painel")}
          style={{ width: '100%', padding: '20px', backgroundColor: '#f59e0b', color: '#000', border: 'none', borderRadius: '15px', fontWeight: 'bold', fontSize: '18px' }}
        >
          ▶ Acessar Gerenciador
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0a0a0c', minHeight: '100vh', color: '#fff', padding: '15px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => setView("landing")} style={{ color: '#f59e0b', background: 'none', border: 'none' }}>← Voltar</button>
        <h3>Painel de Controle</h3>
        <button onClick={fetchCanais} style={{ background: '#16161e', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px' }}>🔄</button>
      </div>

      {erro && (
        <div style={{ background: '#450a0a', border: '1px solid #f87171', padding: '15px', borderRadius: '10px', marginTop: '20px' }}>
          <p style={{ color: '#fca5a5', margin: 0 }}>⚠️ Erro de Conexão:</p>
          <code style={{ fontSize: '12px' }}>{erro}</code>
          <p style={{ fontSize: '12px', marginTop: '10px' }}>Verifique se as chaves VITE_SUPABASE_URL e KEY estão certas na Vercel e se deu Redeploy.</p>
        </div>
      )}

      {loading ? <p style={{textAlign:'center', marginTop: 50}}>Conectando ao Banco...</p> : (
        <div style={{ marginTop: '20px' }}>
          {canais.length === 0 && !erro && <p style={{textAlign: 'center'}}>Nenhum canal encontrado. Adicione um na tabela 'canais'.</p>}
          {canais.map(canal => (
            <div key={canal.id} style={{ background: '#16161e', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #26262e' }}>
              <p style={{ fontWeight: 'bold', color: '#f59e0b', margin: '0 0 10px 0' }}>{canal.nome}</p>
              <input 
                style={{ width: '100%', padding: '10px', background: '#0a0a0c', border: '1px solid #334155', color: '#fff', borderRadius: '5px', marginBottom: '10px' }}
                placeholder="IP 1"
                defaultValue={canal.links?.[0]}
                onBlur={(e) => { 
                  let l = [...(canal.links || [])]; 
                  l[0] = e.target.value; 
                  salvarIp(canal.id, l);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
