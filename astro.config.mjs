import { defineConfig } from 'astro/config';
import staticAdapter from '@astrojs/static';

export default defineConfig({
  site: 'https://Danipixel121.github.io',
  base: '/BearsTips/',
  adapter: staticAdapter(),
});
