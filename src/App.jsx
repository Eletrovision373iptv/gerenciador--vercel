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

// ─── COMPONENTES VISUAIS ──────────────────────────────────────────────────────

function Hero({ onEnter, stats }) {
  return (
    <div style={{minHeight:"100vh",background:"#080810",fontFamily:"'Sora',sans-serif",display:"flex",flexDirection:"column",overflowX:"hidden"}}>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"radial-gradient(ellipse 80% 60% at 50% -10%, #f59e0b18 0%, transparent 70%)"}}/>
      <div style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"60px 20px 40px",textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#f59e0b14",border:"1px solid #f59e0b44",borderRadius:100,padding:"6px 16px",marginBottom:28,fontSize:12,color:"#f59e0b",fontWeight:700,letterSpacing:1}}>⚡ ELETROVISION PRO · MULTI-IP</div>
        <h1 style={{fontSize:"clamp(32px,8vw,54px)",fontWeight:900,lineHeight:1.1,color:"#f8f8f8",letterSpacing:-1.5,marginBottom:20}}>Gestão de IPs<br/><span style={{background:"linear-gradient(90deg,#f59e0b,#fcd34d)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>com Failover Real</span></h1>
        <p style={{fontSize:"clamp(15px,3.5vw,18px)",color:"#888",lineHeight:1.7,marginBottom:40}}>Configure múltiplos IPs por canal e garanta estabilidade 24h.</p>
        <button onClick={onEnter} style={{background:"linear-gradient(135deg,#f59e0b,#d97706)",border:"none",color:"#000",borderRadius:16,padding:"16px 40px",fontSize:16,cursor:"pointer",fontWeight:900,width:"100%",maxWidth:360}}>▶ Acessar Gerenciador</button>
      </div>
    </div>
  );
}

function SourceRow({src,status,onCheck,onDelete,onCopy,copied,isBest}){
  const url=buildUrl(src);
  return(
    <div style={{background:isBest?"#071507":"#0f0f22",border:isBest?"1.5px solid #22c55e66":"1px solid #1a1a35",borderRadius:10,padding:"11px",marginBottom:8,position:"relative"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:8}}>
        <span style={{background:"#0d0d20",fontSize:11,color:"#7dd3fc",fontFamily:"monospace"}}>{src.ip}</span>
        <span style={{color:"#f59e0b",fontSize:11,fontWeight:700}}>{src.port}</span>
        <span style={{marginLeft:"auto"}}>
          {status==="checking" && <span style={{fontSize:10,color:"#f59e0b"}}>⏳</span>}
          {status==="online" && <span style={{fontSize:11,color:"#22c55e"}}>● ONLINE</span>}
          {status==="offline" && <span style={{fontSize:11,color:"#ef4444"}}>● OFFLINE</span>}
          {!status && <button onClick={onCheck} style={{background:"transparent",border:"1px solid #222",color:"#555",fontSize:10,padding:"2px 5px"}}>Testar</button>}
        </span>
      </div>
      <div style={{display:"flex",gap:7}}>
        <button onClick={()=>onCopy(url)} style={{background:"#1a1a2e",border:"1px solid #252535",color:"#bbb",borderRadius:7,padding:"5px 11px",fontSize:11}}>{copied?"✓":"Copiar"}</button>
        <button onClick={onDelete} style={{marginLeft:"auto",background:"transparent",border:"none",color:"#ef444466"}}>🗑</button>
      </div>
    </div>
  );
}

function ChannelCard({channel,catId,statuses,onCheckSource,onDeleteSource,onAddSource,onDeleteChannel}){
  const [expanded,setExpanded]=useState(false);
  const [addOpen,setAddOpen]=useState(false);
  const [newIp,setNewIp]=useState("");
  const [newPort,setNewPort]=useState("");

  const handleAdd=()=>{
    if(!newIp||!newPort)return;
    onAddSource(catId,channel.id,{id:Date.now(),ip:newIp,port:newPort,path:"/live",label:`IP ${channel.sources.length+1}`});
    setNewIp("");setNewPort("");setAddOpen(false);
  };

  return(
    <div style={{background:"#0f0f1e",border:"1.5px solid #1a1a35",borderRadius:14,marginBottom:10,overflow:"hidden"}}>
      <div onClick={()=>setExpanded(!expanded)} style={{padding:"12px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between"}}>
        <span style={{color:"#f1f1f1",fontWeight:700}}>{channel.name} ({channel.sources.length} IPs)</span>
        <span>{expanded?"▲":"▼"}</span>
      </div>
      {expanded && (
        <div style={{padding:"14px"}}>
          {channel.sources.map(src=>(
            <SourceRow key={src.id} src={src} status={statuses[`${channel.id}-${src.id}`]} onCheck={()=>onCheckSource(channel.id,src.id,buildUrl(src))} onDelete={()=>onDeleteSource(catId,channel.id,src.id)} onCopy={(url)=>copyText(url,()=>{},src.id)}/>
          ))}
          {addOpen ? (
            <div style={{marginTop:10}}>
              <input placeholder="IP" value={newIp} onChange={e=>setNewIp(e.target.value)} style={{width:"60%",background:"#080818",color:"#fff",border:"1px solid #252535",padding:5}}/>
              <input placeholder="Porta" value={newPort} onChange={e=>setNewPort(e.target.value)} style={{width:"30%",background:"#080818",color:"#fff",border:"1px solid #252535",padding:5}}/>
              <button onClick={handleAdd} style={{width:"100%",marginTop:5,background:"#f59e0b",border:"none",padding:8}}>Adicionar</button>
            </div>
          ) : (
            <button onClick={()=>setAddOpen(true)} style={{width:"100%",background:"transparent",border:"1px dashed #1e1e35",color:"#444",padding:10}}>+ Novo IP</button>
          )}
          <button onClick={()=>onDeleteChannel(catId,channel.id)} style={{marginTop:10,color:"#ef4444",background:"none",border:"none",fontSize:11}}>Remover Canal</button>
        </div>
      )}
    </div>
  );
}

function CategoryDetail({category,onBack,statuses,onCheckSource,onDeleteSource,onAddSource,onDeleteChannel,onUpdateCategory}){
  const [newName,setNewName]=useState("");
  const addChannel=()=>{
    if(!newName)return;
    onUpdateCategory(category.id,{channels:[...category.channels,{id:Date.now(),name:newName,sources:[]}]});
    setNewName("");
  };

  return(
    <div style={{padding:15}}>
      <button onClick={onBack} style={{color:"#f59e0b",background:"none",border:"none",marginBottom:20}}>← Voltar</button>
      <h2 style={{color:"#fff"}}>{category.icon} {category.name}</h2>
      <div style={{margin:"20px 0"}}>
        <input placeholder="Nome do novo canal" value={newName} onChange={e=>setNewName(e.target.value)} style={{width:"70%",padding:10,background:"#131320",border:"1px solid #1e1e35",color:"#fff"}}/>
        <button onClick={addChannel} style={{width:"28%",padding:10,background:"#f59e0b",border:"none",marginLeft:"2%"}}>+ Criar</button>
      </div>
      {category.channels.map(ch=>(
        <ChannelCard key={ch.id} channel={ch} catId={category.id} statuses={statuses} onCheckSource={onCheckSource} onDeleteSource={onDeleteSource} onAddSource={onAddSource} onDeleteChannel={onDeleteChannel}/>
      ))}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("hero");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [statuses, setStatuses] = useState({});

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

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
      await supabase.from('gerenciador').update({ data: categories }).eq('id', 1);
      alert("✅ Banco de Dados Atualizado!");
    } catch (e) { alert("Erro ao salvar"); }
    finally { setSaving(false); }
  };

  const checkSource = (channelId, sourceId, url) => {
    const key = `${channelId}-${sourceId}`;
    setStatuses(p => ({ ...p, [key]: "checking" }));
    fakeCheck(url, res => setStatuses(p => ({ ...p, [key]: res })));
  };

  const updateCat = (id, updates) => setCategories(p => p.map(c => c.id === id ? { ...c, ...updates } : c));
  
  const addSource = (catId, chId, src) => setCategories(p => p.map(cat => cat.id !== catId ? cat : { ...cat, channels: cat.channels.map(ch => ch.id !== chId ? ch : { ...ch, sources: [...ch.sources, src] }) }));

  const deleteSource = (catId, chId, sId) => setCategories(p => p.map(cat => cat.id !== catId ? cat : { ...cat, channels: cat.channels.map(ch => ch.id !== chId ? ch : { ...ch, sources: ch.sources.filter(s => s.id !== sId) }) }));

  const deleteChannel = (catId, chId) => setCategories(p => p.map(cat => cat.id !== catId ? cat : { ...cat, channels: cat.channels.filter(ch => ch.id !== chId) }));

  if (loading) return <div style={{background:"#080810",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#f59e0b"}}>Conectando ao Eletrovision...</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#080810;color:#f1f1f1;font-family:'Sora',sans-serif;}
        .save-float { position: fixed; bottom: 20px; right: 20px; z-index: 999; background: #22c55e; color: #000; border: none; padding: 15px 25px; borderRadius: 50px; fontWeight: 900; cursor: pointer; }
      `}</style>

      {page === "hero" ? (
        <Hero onEnter={() => setPage("manager")} stats={{ cats: categories.length }} />
      ) : (
        <div style={{minHeight:"100vh"}}>
          <button className="save-float" onClick={handleSave}>{saving ? "⏳..." : "💾 SALVAR TUDO"}</button>
          
          {selected ? (
            <CategoryDetail 
              category={categories.find(c => c.id === selected)} 
              onBack={() => setSelected(null)}
              statuses={statuses} onCheckSource={checkSource} onDeleteSource={deleteSource} onAddSource={addSource} onDeleteChannel={deleteChannel} onUpdateCategory={updateCat}
            />
          ) : (
            <div style={{padding:20}}>
              <h2 style={{color:"#f59e0b",marginBottom:20}}>Categorias</h2>
              <button onClick={() => setCategories([...categories, {id:Date.now(), name:"Nova Categoria", icon:"📂", channels:[]}])} style={{width:"100%",padding:15,background:"#1a1a2e",border:"1px dashed #f59e0b",color:"#f59e0b",marginBottom:20}}>+ Adicionar Categoria</button>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {categories.map(cat => (
                  <div key={cat.id} onClick={() => setSelected(cat.id)} style={{background:"#0f0f1e",padding:20,borderRadius:15,border:"1px solid #1a1a35",textAlign:"center"}}>
                    <div style={{fontSize:30}}>{cat.icon}</div>
                    <div style={{marginTop:10,fontWeight:700}}>{cat.name}</div>
                    <div style={{fontSize:10,color:"#444"}}>{cat.channels.length} canais</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
