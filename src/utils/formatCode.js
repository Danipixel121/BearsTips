import prettier from 'prettier';

export async function formatearBloquesCodigo(htmlContenido) {
  const regex = /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;
  const matches = [...htmlContenido.matchAll(regex)];
  let salida = htmlContenido;

  for (const match of matches) {
    const [completo, lang, codigo] = match;

    const codigoLimpio = codigo
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"');

    const parser = lang === 'html' ? 'html'
                 : lang === 'css'  ? 'css'
                 : (lang === 'js' || lang === 'javascript') ? 'babel'
                 : null;

    if (!parser) continue;

    try {
      const formateado = await prettier.format(codigoLimpio, { parser, tabWidth: 2 });

      const escapado = formateado.trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      salida = salida.replace(completo,
        `<pre><code class="language-${lang}">${escapado}</code></pre>`
      );
    } catch (e) {
      // Si falla el formateo, deja el código original
    }
  }

  return salida;
}