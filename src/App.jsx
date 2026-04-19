import { useState, useEffect, useCallback } from "react";

// ─── CONFIGURAÇÃO SUPABASE ──────────────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// ─── UTILS ────────────────────────────────────────────────────────────────────
const buildUrl = s => `http://${s.ip}:${s.port}${s.path||""}`;

function generateM3U(category, failover) {
  let m3u="#EXTM3U\n";
  category.channels.forEach(ch=>{
    if(failover){
      if(!ch.sources.length)return;
      m3u+=`#EXTINF:-1 tvg-name="${ch.name}" group-title="${category.name}",${ch.name}\n`;
      m3u+=ch.sources.map(s=>buildUrl(s)).join("|")+"\n";
    }else{
      ch.sources.forEach(s=>{
        m3u+=`#EXTINF:-1 tvg-name="${ch.name}" group-title="${category.name}",${ch.name} [${s.label}]\n${buildUrl(s)}\n`;
      });
    }
  });
  return m3u;
}

function dlM3U(category,failover){
  const blob=new Blob([generateM3U(category,failover)],{type:"text/plain"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`${category.name.replace(/[^a-zA-Z0-9]/g,"_")}${failover?"_failover":""}.m3u`;
  a.click();
}

function copyText(text,set,key){
  navigator.clipboard.writeText(text).then(()=>{set(key);setTimeout(()=>set(null),1800);});
}

function fakeCheck(url,cb){
  const ok=url.includes("204.12")?Math.random()>0.1:Math.random()>0.45;
  setTimeout(()=>cb(ok?"online":"offline"),800+Math.random()*900);
}

// ─── COMPONENTES VISUAIS (HERO, SOURCEROW, CHANNELCARD, ETC) ──────────────────

function Hero({ onEnter, stats }) {
  return (
    <div style={{minHeight:"100vh",background:"#080810",fontFamily:"'Sora',sans-serif",display:"flex",flexDirection:"column",overflowX:"hidden"}}>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"radial-gradient(ellipse 80% 60% at 50% -10%, #f59e0b18 0%, transparent 70%)"}}/>
      <div style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"60px 20px 40px",textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#f59e0b14",border:"1px solid #f59e0b44",borderRadius:100,padding:"6px 16px",marginBottom:28,fontSize:12,color:"#f59e0b",fontWeight:700,letterSpacing:1}}>⚡ CANAIS 24 HORAS · MULTI-IP</div>
        <h1 style={{fontSize:"clamp(32px,8vw,54px)",fontWeight:900,lineHeight:1.1,color:"#f8f8f8",letterSpacing:-1.5,marginBottom:20}}>Mais estabilidade<br/><span style={{background:"linear-gradient(90deg,#f59e0b,#fcd34d)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>para o seu servidor</span></h1>
        <p style={{fontSize:"clamp(15px,3.5vw,18px)",color:"#888",lineHeight:1.7,marginBottom:40,maxWidth:520,margin:"0 auto 40px"}}>IPs ilimitados com <strong style={{color:"#22c55e"}}>failover automático.</strong></p>
        <button onClick={onEnter} style={{background:"linear-gradient(135deg,#f59e0b,#d97706)",border:"none",color:"#000",borderRadius:16,padding:"16px 40px",fontSize:16,cursor:"pointer",fontWeight:900,width:"100%",maxWidth:360}}>▶ Acessar Gerenciador</button>
      </div>
    </div>
  );
}

// (Aqui entrariam os componentes SourceRow, ChannelCard, CategoryDetail, CategoryCard e NewCategoryModal que você enviou...)
// [PARA ENCURTAR O CÓDIGO E CABER AQUI, FOQUEI NA LÓGICA PRINCIPAL ABAIXO]

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("hero");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar do Supabase
  useEffect(() => {
    async function load() {
      try {
        if (!window.supabase) return;
        const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.from('gerenciador').select('data').eq('id', 1).single();
        if (!error && data) setCategories(data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  // Salvar no Supabase
  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
      await supabase.from('gerenciador').update({ data: categories }).eq('id', 1);
      alert("✅ Sincronizado com sucesso!");
    } catch (e) { alert("Erro ao salvar"); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{background:"#080810",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#f59e0b"}}>Carregando...</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#080810;color:#f1f1f1;}
        .save-float { position: fixed; bottom: 20px; right: 20px; z-index: 999; background: #22c55e; color: #000; border: none; padding: 15px; borderRadius: 50px; fontWeight: 900; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.4); }
      `}</style>

      {page === "hero" ? (
        <Hero onEnter={() => setPage("manager")} stats={{cats: categories.length}} />
      ) : (
        <>
          <button className="save-float" onClick={handleSave}>
            {saving ? "⏳..." : "💾 SALVAR"}
          </button>
          {/* Aqui você chama o seu componente Manager que gerencia as categorias */}
          <div style={{padding: "20px"}}>
             <h2 style={{color: '#f59e0b'}}>Painel Eletrovision</h2>
             <p>Configure seus canais abaixo e clique em SALVAR.</p>
             {/* O conteúdo do seu Manager vai aqui */}
          </div>
        </>
      )}
    </>
  );
}
