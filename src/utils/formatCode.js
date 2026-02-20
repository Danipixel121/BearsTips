// src/utils/formatCode.js
import prettier from 'prettier';

export async function formatearBloquesCodigo(htmlContenido) {
  // Captura <pre ...><code class="language-xxx">...</code></pre>
  // con cualquier atributo en el <pre> (como class="code-block")
  const regex = /<pre[^>]*>\s*<code[^>]*class="[^"]*language-(\w+)[^"]*"[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/g;
  const matches = [...htmlContenido.matchAll(regex)];
  let salida = htmlContenido;

  for (const match of matches) {
    const [completo, lang, codigo] = match;

    // Decodifica entidades HTML (el contenido viene escapado desde Supabase)
    const codigoLimpio = codigo
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    const parser = lang === 'html' ? 'html'
                 : lang === 'css'  ? 'css'
                 : (lang === 'js' || lang === 'javascript') ? 'babel'
                 : null;

    if (!parser) continue;

    try {
      const formateado = await prettier.format(codigoLimpio, {
        parser,
        tabWidth: 2,
        printWidth: 80,
      });

      // Re-escapa para meterlo en HTML
      const escapado = formateado.trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Reconstruye manteniendo las clases del <pre> original
      salida = salida.replace(
        completo,
        `<pre class="code-block"><code class="language-${lang}">${escapado}</code></pre>`
      );
    } catch (e) {
      // Si falla el formateo, deja el bloque original sin cambios
      console.warn(`[formatCode] Error formateando bloque ${lang}:`, e.message);
    }
  }

  return salida;
}