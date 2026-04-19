import { useState, useEffect } from "react";

export default function App() {
  const [canais, setCanais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("landing"); // landing ou painel
  const [auth, setAuth] = useState(true);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

  useEffect(() => {
    if (view === "painel") fetchCanais();
  }, [view]);

  async function fetchCanais() {
    setLoading(true);
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase.from('canais').select('*');
    setCanais(data || []);
    setLoading(false);
  }

  async function salvarIp(id, novosLinks) {
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from('canais').update({ links: novosLinks }).eq('id', id);
    if (error) alert("Erro ao salvar!");
    else alert("Sinal Atualizado com Sucesso!");
  }

  // Visual da Landing Page (Seus Prints)
  if (view === "landing") {
    return (
      <div style={{ backgroundColor: '#0a0a0c', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '20px' }}>
        <header style={{ textAlign: 'center', padding: '40px 0' }}>
          <h2 style={{ color: '#fff', fontSize: '28px' }}>Mais estabilidade</h2>
          <h1 style={{ color: '#f59e0b', fontSize: '36px', marginTop: '-10px' }}>para o seu servidor</h1>
          <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>Em vez de contar com apenas 1 IP por canal, nossa fonte oferece múltiplos IPs. Se um cair, outro assume.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
          {[ {n: '6+', t: 'Categorias', i: '📁'}, {n: '28+', t: 'Canais', i: '📺'}, {n: '∞', t: 'IPs por canal', i: '⚡'}, {n: '24h', t: 'No ar sempre', i: '🔄'} ].map(card => (
            <div style={{ background: '#16161e', padding: '20px', borderRadius: '15px', textAlign: 'center', border: '1px solid #26262e' }}>
              <span style={{ fontSize: '24px' }}>{card.i}</span>
              <h3 style={{ color: '#818cf8', margin: '10px 0 5px 0' }}>{card.n}</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>{card.t}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setView("painel")}
          style={{ width: '100%', padding: '20px', backgroundColor: '#f59e0b', color: '#000', border: 'none', borderRadius: '15px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}
        >
          ▶ Acessar Gerenciador de Canais
        </button>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
           <p style={{ color: '#475569', fontSize: '12px' }}>PRÉVIA DAS CATEGORIAS DISPONÍVEIS</p>
           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
             {['GLOBO', 'ESPORTES', 'INFANTIL', 'HBO', 'FUTEBOL', 'SÉRIES'].map(cat => (
               <span style={{ background: '#16161e', padding: '8px 15px', borderRadius: '20px', fontSize: '12px', border: '1px solid #26262e' }}>{cat}</span>
             ))}
           </div>
        </div>
      </div>
    );
  }

  // Visual do Painel de Controle
  return (
    <div style={{ backgroundColor: '#0a0a0c', minHeight: '100vh', color: '#fff', padding: '15px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => setView("landing")} style={{ background: 'none', border: 'none', color: '#f59e0b' }}>← Voltar</button>
        <h3>Gerenciador Pro</h3>
        <button onClick={fetchCanais} style={{ background: '#16161e', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '5px' }}>🔄</button>
      </div>

      {loading ? <p style={{textAlign:'center', marginTop: 50}}>Carregando Sinais...</p> : (
        <div style={{ marginTop: '20px' }}>
          {canais.map(canal => (
            <div key={canal.id} style={{ background: '#16161e', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #26262e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>{canal.nome}</span>
                <span style={{ fontSize: '10px', color: '#4ade80' }}>● ONLINE (FAILOVER ON)</span>
              </div>
              
              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>LINK PRINCIPAL (IP 1)</label>
                <input 
                  style={{ width: '100%', padding: '10px', background: '#0a0a0c', border: '1px solid #334155', color: '#fff', borderRadius: '5px', marginTop: '5px', boxSizing: 'border-box' }}
                  defaultValue={canal.links?.[0]}
                  onBlur={(e) => { canal.links[0] = e.target.value; }}
                />
              </div>

              <div style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>LINK RESERVA (FAILOVER - IP 2)</label>
                <input 
                  style={{ width: '100%', padding: '10px', background: '#0a0a0c', border: '1px solid #334155', color: '#fff', borderRadius: '5px', marginTop: '5px', boxSizing: 'border-box' }}
                  defaultValue={canal.links?.[1]}
                  onBlur={(e) => { canal.links[1] = e.target.value; }}
                />
              </div>

              <button 
                onClick={() => salvarIp(canal.id, canal.links)}
                style={{ width: '100%', marginTop: '15px', padding: '10px', background: '#f59e0b', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
              >
                ATUALIZAR SINAIS
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div style={{ padding: '20px', background: '#1e1e26', borderRadius: '10px', marginTop: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px' }}>⬇️ Exportar Lista M3U para Servidor</p>
        <button style={{ background: '#334155', color: '#fff', border: 'none', padding: '10px', width: '100%', borderRadius: '5px', marginTop: '10px' }}>
          Gerar Link .m3u8
        </button>
      </div>
    </div>
  );
}
