import { useState, useEffect } from "react";

// Conexão via CDN (Pula o erro do NPM)
const supabase = window.supabase.createClient(
  'https://qznreydoxhycwmsdrkmm.supabase.co', 
  'COLE_AQUI_SUA_CHAVE_ANON'
);

export default function App() {
  const [canais, setCanais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCanais();
  }, []);

  async function fetchCanais() {
    const { data } = await supabase.from('canais').select('*');
    setCanais(data || []);
    setLoading(false);
  }

  async function atualizarLinks(id, novosLinksArray) {
    const { error } = await supabase
      .from('canais')
      .update({ links: novosLinksArray })
      .eq('id', id);

    if (error) alert("Erro ao salvar: " + error.message);
    else {
      alert("Sucesso! O XCIPTV já está com o novo sinal.");
      fetchCanais();
    }
  }

  if (loading) return <div style={{padding: 50, color: '#fff', background: '#000', height: '100vh'}}>Carregando Canais...</div>;

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', background: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ color: '#38bdf8' }}>Gerenciador de Sinais Eletrovision</h1>
      <div style={{ display: 'grid', gap: '20px' }}>
        {canais.map(canal => (
          <div key={canal.id} style={{ background: '#1e293b', padding: 20, borderRadius: 12, border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{canal.nome}</h3>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>ID do Link Eterno: {canal.id}</p>
            
            {canal.links.map((link, index) => (
              <div key={index} style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '12px' }}>Fonte {index + 1}:</label>
                <input 
                  style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
                  defaultValue={link} 
                  onBlur={(e) => {
                    let novos = [...canal.links];
                    novos[index] = e.target.value;
                    canal.links = novos;
                  }}
                />
              </div>
            ))}
            
            <button 
              onClick={() => atualizarLinks(canal.id, canal.links)}
              style={{ background: '#0ea5e9', color: '#fff', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: 6, fontWeight: 'bold', marginTop: '10px' }}
            >
              Salvar Novos IPs
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
