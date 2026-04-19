import { createClient } from '@supabase/supabase-client'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

export default async function handler(req, res) {
  const { id } = req.query;

  const { data: canal } = await supabase
    .from('canais')
    .select('links')
    .eq('id', id)
    .single();

  if (!canal || !canal.links) return res.status(404).send("Canal nao encontrado");

  for (const url of canal.links) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeout);

      if (response.ok) return res.redirect(302, url);
    } catch (e) { continue; }
  }
  res.status(404).send("Nenhum sinal online");
}
