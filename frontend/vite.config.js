import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh for better development experience
      fastRefresh: true,
    }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@fortawesome/react-fontawesome": resolve(__dirname, "node_modules/@fortawesome/react-fontawesome"),
      "@fortawesome/free-solid-svg-icons": resolve(__dirname, "node_modules/@fortawesome/free-solid-svg-icons"),
      // Add more aliases for frequently used imports
      "@components": resolve(__dirname, "src/components"),
      "@pages": resolve(__dirname, "src/pages"),
      "@contexts": resolve(__dirname, "src/contexts"),
      "@utils": resolve(__dirname, "src/utils"),
    }
  },
  optimizeDeps: {
    // Pre-bundle these dependencies for faster dev server start
    include: [
      '@fortawesome/react-fontawesome', 
      '@fortawesome/free-solid-svg-icons',
      'react-router-dom',
      'react-hot-toast',
      'lottie-react',
      'axios',
      'jwt-decode',
      'lucide-react',
      'chart.js',
      'react-chartjs-2'
    ],
    // Force Vite to optimize dependencies again on server restart
    force: true,
    // Exclude heavy dependencies that should be loaded on demand
    exclude: ['@react-google-maps/api', 'leaflet', 'react-leaflet']
  },
  build: {
    // Improve production build
    cssCodeSplit: true,
    reportCompressedSize: false, // Speeds up build
    chunkSizeWarningLimit: 1000, // Increased from default
    rollupOptions: {
      output: {
        manualChunks: {
          // Group common dependencies into chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['react-icons', 'react-hot-toast', 'lottie-react'],
        }
      }
    },
    // Minify output for production builds
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console for debugging
        drop_debugger: true
      }
    },
  },
  server: {
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: true,
    },
    // Optimize dev server
    port: 5173, // Consistent port
    strictPort: false, // Allow fallback to another port if 5173 is in use
    open: true, // Auto open browser
  },
  // Better caching for faster rebuilds
  cacheDir: 'node_modules/.vite',
  clearScreen: false
});
