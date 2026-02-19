import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Falta SUPABASE_URL o SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const GET: APIRoute = async () => {
  try {
    // Traemos tutoriales con idioma, slug y categoria
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
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (err) {
    return new Response('Error generando sitemap', { status: 500 });
  }
};