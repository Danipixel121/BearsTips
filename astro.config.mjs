import { defineConfig } from 'astro/config';
import staticAdapter from '@astrojs/static';

export default defineConfig({
  site: 'https://danipixel121.github.io',
  base: '/bearstips/',
  adapter: staticAdapter(),
});
