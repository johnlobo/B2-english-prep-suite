import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

const PROXY_BASE = '/proxy/3000';

export default defineConfig(({command}) => {
  const isProduction = command === 'build';

  return {
    base: isProduction ? './' : PROXY_BASE + '/',
    plugins: [
      react(),
      tailwindcss(),
      // Rewrites incoming request URLs to re-add the code-server proxy prefix
      // before Vite's own middleware matches them against `base`.
      !isProduction && codeServerProxyPlugin(PROXY_BASE),
      VitePWA({
        // Service worker only registers in the production build — the dev server runs behind
        // the code-server reverse proxy (see codeServerProxyPlugin above) and a registered SW
        // there would fight the proxy's URL rewriting.
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png'],
        manifest: {
          name: 'B2 English Prep Suite',
          short_name: 'B2 Prep',
          description: 'Suite de preparación para el examen B2 First de Cambridge',
          start_url: '.',
          display: 'standalone',
          background_color: '#f8fafc',
          theme_color: '#4f46e5',
          icons: [
            {src: 'pwa-192.png', sizes: '192x192', type: 'image/png'},
            {src: 'pwa-512.png', sizes: '512x512', type: 'image/png'},
            {src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
          ],
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Vite's dev server only accepts requests whose Host header matches localhost by default
      // (DNS-rebinding protection). Accessing it through the VPS's real domain needs it listed here.
      allowedHosts: ['code-server.digitalpartners.es'],
    },
  };
});

function codeServerProxyPlugin(base: string) {
  const prefix = '/' + base.replace(/^\/|\/$/g, '') + '/';
  return {
    name: 'code-server-proxy-fix',
    configureServer(server: any) {
      server.middlewares.use((req: any, _res: any, next: any) => {
        if (req.url && !req.url.startsWith(prefix)) {
          req.url = prefix + req.url.replace(/^\//, '');
        }
        next();
      });
    },
  };
}
