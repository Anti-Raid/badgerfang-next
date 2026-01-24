import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
	server: {
		port: 4173,
		host: '0.0.0.0',
		allowedHosts: ['tanstack.antiraid.bot']
	},
	worker: {
		format: 'es'
	},
	build: {
		target: 'esnext',
		minify: 'esbuild',
		cssMinify: true,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						if (id.includes('react')) return 'vendor-react';
						if (id.includes('@tanstack')) return 'vendor-tanstack';
						if (id.includes('lucide-react') || id.includes('react-icons')) return 'vendor-icons';
						if (id.includes('recharts') || id.includes('d3')) return 'vendor-charts';
						if (id.includes('monaco-editor')) return 'vendor-monaco';
						if (id.includes('mermaid')) return 'vendor-mermaid';
						if (id.includes('@opentelemetry') || id.includes('@vercel')) return 'vendor-otel';
						return 'vendor';
					}
				}
			}
		},
		chunkSizeWarningLimit: 1000
	},
	plugins: [
		// Enables Vite to resolve imports using path aliases.
		tsconfigPaths(),
		wasm(),
		topLevelAwait(),
		tanstackStart({
			srcDirectory: 'src', // This is the default
			router: {
				// Specifies the directory TanStack Router uses for your routes.
				routesDirectory: 'app' // Defaults to "routes", relative to srcDirectory
			}
		}),
		viteReact()
	]
});
