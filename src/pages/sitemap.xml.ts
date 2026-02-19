import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_ANON_KEY
);

export const GET: APIRoute = async () => {
  // Obtenemos los tutoriales con sus traducciones
  const { data } = await supabase
    .from('tutoriales_traducciones')
    .select('idioma, slug:tutorial_id(slug, categoria)');

  const staticPages = [
    'https://bearstips.com/',
    'https://bearstips.com/es/',
    'https://bearstips.com/en/',
  ];

  const tutorialPages = data?.map(t => {
    const { idioma, slug: tutorial } = t as any;
    return `https://bearstips.com/${idioma}/tutorial/${tutorial.categoria}/${tutorial.slug}`;
  }) ?? [];

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
};