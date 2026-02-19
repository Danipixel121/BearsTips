import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const GET: APIRoute = async () => {
  if (!supabaseUrl || !supabaseKey) {
    return new Response('Error: variables de entorno de Supabase no configuradas', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .from('tutoriales_traducciones')
      .select(`idioma, tutoriales (slug, categoria)`);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    const staticPages = [
      'https://bearstips.com/',
      'https://bearstips.com/es/',
      'https://bearstips.com/en/',
    ];

    const tutorialPages = data?.map((t: any) =>
      `https://bearstips.com/${t.idioma}/tutorial/${t.tutoriales.categoria}/${t.tutoriales.slug}`
    ) ?? [];

    const allPages = [...staticPages, ...tutorialPages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (err) {
    console.error(err);
    return new Response('Error generando sitemap', { status: 500 });
  }
};