import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-client';

// Configuração do Supabase (Substitua pelos seus dados)
const supabase = createClient('SUA_URL_DO_SUPABASE', 'SUA_CHAVE_ANON_DO_SUPABASE');

export default function App() {
  const [canais, setCanais] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar canais do banco de dados
  useEffect(() => {
    fetchCanais();
  }, []);

  async function fetchCanais() {
    const { data } = await supabase.from('canais').select('*');
    setCanais(data || []);
    setLoading(false);
  }

  // Função para salvar novos links
  async function atualizarLinks(id, novosLinksArray) {
    const { error } = await supabase
      .from('canais')
      .update({ links: novosLinksArray })
      .eq('id', id);

    if (error) alert("Erro ao salvar");
    else {
      alert("Links atualizados! O XCIPTV já está recebendo o novo sinal.");
      fetchCanais();
    }
  }

  if (loading) return <div style={{padding: 50}}>Carregando Painel...</div>;

  return (
    <div style={{ padding: 20, fontFamily: 'Sora, sans-serif' }}>
      <h1>Gerenciador de Sinais</h1>
      <div style={{ display: 'grid', gap: '20px' }}>
        {canais.map(canal => (
          <div key={canal.id} style={{ background: '#1a1a2e', padding: 20, borderRadius: 10 }}>
            <h3>{canal.nome}</h3>
            <p>ID do Link Eterno: <strong>{canal.id}</strong></p>
            
            {canal.links.map((link, index) => (
              <div key={index} style={{ marginBottom: 10 }}>
                <label>Fonte {index + 1}: </label>
                <input 
                  style={{ width: '80%', padding: 5 }}
                  defaultValue={link} 
                  onBlur={(e) => {
                    let novos = [...canal.links];
                    novos[index] = e.target.value;
                    canal.links = novos; // Atualiza localmente antes de salvar
                  }}
                />
              </div>
            ))}
            
            <button 
              onClick={() => atualizarLinks(canal.id, canal.links)}
              style={{ background: '#4ecca3', color: '#fff', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: 5 }}
            >
              Salvar Alterações
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
