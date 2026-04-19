import { useState, useEffect } from "react";

export default function App() {
  const [canais, setCanais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const inicializar = () => {
      // Pega as chaves da Vercel (precisam começar com VITE_)
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_KEY;

      if (!window.supabase) {
        // Se o script do index.html ainda não carregou, tenta de novo em breve
        setTimeout(inicializar, 500);
        return;
      }

      if (!url || !key) {
        setError("As chaves VITE_SUPABASE_URL ou VITE_SUPABASE_KEY não foram encontradas na Vercel.");
        setLoading(false);
        return;
      }

      const supabase = window.supabase.createClient(url, key);
      fetchCanais(supabase);
    };

    inicializar();
  }, []);

  async function fetchCanais(supabase) {
    try {
      const { data, error } = await supabase.from('canais').select('*');
      if (error) throw error;
      setCanais(data || []);
    } catch (err) {
      setError("Erro ao buscar canais: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function salvar(id, novosLinks) {
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_KEY;
      const supabase = window.supabase.createClient(url, key);

      const { error } = await supabase
        .from('canais')
        .update({ links: novosLinks })
        .eq('id', id);

      if (error) throw error;
      alert("Sucesso! O sinal foi atualizado.");
    } catch (err) {
      alert("Erro ao salvar: " + err.message);
    }
  }

  if (loading) return <div style={{padding: 40, color: '#fff', textAlign: 'center'}}>Iniciando Painel...</div>;
  if (error) return <div style={{padding: 40, color: '#ff4444'}}>{error}</div>;

  return (
    <div style={{ padding: '20px', color: '#fff', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#38bdf8', textAlign: 'center' }}>Eletrovision Sinais</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {canais.map(canal => (
          <div key={canal.id} style={{ background: '#1e293b', padding: '15px', borderRadius: '10px', border: '1px solid #334155' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>{canal.nome}</h2>
            {canal.links && canal.links.map((link, index) => (
              <input 
                key={index}
                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #475569', background: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
                defaultValue={link}
                onBlur={(e) => { canal.links[index] = e.target.value; }}
              />
            ))}
            <button 
              onClick={() => salvar(canal.id, canal.links)}
              style={{ width: '100%', padding: '12px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
            >
              SALVAR NOVO IP
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
