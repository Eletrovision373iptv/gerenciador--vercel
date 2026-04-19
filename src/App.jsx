import { useState, useEffect } from "react";

export default function App() {
  const [canais, setCanais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [view, setView] = useState("landing");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

  async function fetchCanais() {
    setLoading(true);
    setErro(null);
    
    // Tenta esperar a biblioteca carregar por até 3 segundos
    let tentativas = 0;
    while (!window.supabase && tentativas < 30) {
      await new Promise(r => setTimeout(r, 100));
      tentativas++;
    }

    try {
      if (!window.supabase) {
        throw new Error("Aguardando conexão com o servidor... Tente atualizar a página.");
      }

      const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
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
      <div style={{ backgroundColor: '#0a0a0c', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '28px', marginTop: '40px' }}>Eletrovision</h2>
        <h1 style={{ color: '#f59e0b', fontSize: '36px' }}>Gerenciador Pro</h1>
        <button 
          onClick={() => setView("painel")}
          style={{ width: '100%', padding: '20px', backgroundColor: '#f59e0b', color: '#000', border: 'none', borderRadius: '15px', fontWeight: 'bold', fontSize: '18px', marginTop: '30px' }}
        >
          ▶ Acessar Gerenciador
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0a0a0c', minHeight: '100vh', color: '#fff', padding: '15px', fontFamily: 'sans-serif' }}>
      <button onClick={() => setView("landing")} style={{ color: '#f59e0b', background: 'none', border: 'none', marginBottom: '20px' }}>← Voltar</button>
      
      {erro && (
        <div style={{ background: '#450a0a', padding: '15px', borderRadius: '10px', border: '1px solid #f87171' }}>
          <p style={{ color: '#fca5a5', margin: 0 }}>{erro}</p>
          <button onClick={fetchCanais} style={{ marginTop: '10px', background: '#f87171', border: 'none', padding: '5px 10px', borderRadius: '5px', color: '#fff' }}>Tentar Novamente</button>
        </div>
      )}

      {loading ? <p style={{textAlign:'center', marginTop: 50}}>Conectando aos IPs...</p> : (
        <div>
          {canais.map(canal => (
            <div key={canal.id} style={{ background: '#16161e', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #26262e' }}>
              <p style={{ fontWeight: 'bold', color: '#f59e0b' }}>{canal.nome}</p>
              {/* Campos de IP e Porta aqui */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
