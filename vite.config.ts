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
