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
      .select('idioma, tutoriales (slug, categoria)');

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    const staticPages = [
      'https://bearstips.com/',
      'https://bearstips.com/es/',
      'https://bearstips.com/en/',
    ];

    // Función para escapar caracteres XML
    function escapeXml(unsafe: string) {
      return unsafe.replace(/[<>&'"]/g, c => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;',
      }[c]!));
    }

    // Generar URLs dinámicas para tutoriales
    const tutorialPages = data?.flatMap((t: any) =>
      t.tutoriales.map((tutorial: any) =>
        `https://bearstips.com/${t.idioma}/tutorial/${encodeURIComponent(tutorial.categoria)}/${encodeURIComponent(tutorial.slug)}`
      )
    ) ?? [];

    const allPages = [...staticPages, ...tutorialPages];

    // Generar sitemap XML seguro
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(url => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (err) {
    console.error(err);
    return new Response('Error generando sitemap', { status: 500 });
  }
};