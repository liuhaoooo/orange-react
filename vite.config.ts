
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Enable host to be accessible from network if needed
    host: '0.0.0.0', 
    port: 2026,
    proxy: {
      // Intercept requests starting with /cgi-bin
      '/cgi-bin': {
        target: 'http://192.168.0.1', // The CPE Router IP
        changeOrigin: true, // Required for virtual hosted sites
        secure: false, // Accept self-signed certificates if applicable
        // Optional: Log proxy requests for debugging
        configure: (proxy: any, _options: any) => {
          proxy.on('error', (err: any, _req: any, _res: any) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq: any, req: any, _res: any) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes: any, req: any, _res: any) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
});
