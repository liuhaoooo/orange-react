
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Enable host to be accessible from network if needed
    host: '0.0.0.0', 
    port: 3001,
    proxy: {
      // Intercept requests starting with /cgi-bin
      '/cgi-bin': {
        target: 'http://192.168.0.1', // The CPE Router IP
        changeOrigin: true, // Required for virtual hosted sites
        secure: false, // Accept self-signed certificates if applicable
        // Optional: Log proxy requests for debugging
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
});
