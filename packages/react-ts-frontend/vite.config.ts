import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import path from "node:path";

export default defineConfig({
	plugins: [react(), svgr()],

	test: {
		globals: true,
		environment: "jsdom"
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src")
		}
	},
	server: {
		proxy: { 
			"/api": {
				target: "http://localhost:8080",
				changeOrigin: true,
				secure: false,
				ws: false,
			}
		}
	}
});
