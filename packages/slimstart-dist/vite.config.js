import { defineConfig } from 'vite';
import typo3, { getDefaultAllowedOrigins } from 'vite-plugin-typo3';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		typo3({
			entrypointFile: 'src/ViteEntrypoints.json',
		}),
		tailwindcss(),
	],
	resolve: {
		alias: {
			'@': resolve(__dirname, './src/js'),
		},
	},
	build: {
		outDir: resolve(__dirname, 'Resources', 'Public', 'Build'),
		rollupOptions: {
			output: {
				assetFileNames: assetInfo => {
					const getAssetName = assetInfo => assetInfo.names?.[0] ?? '';
					if (/\.(woff2?|ttf|otf|ttf)$/.test(getAssetName(assetInfo))) {
						return 'fonts/[name]-[hash][extname]';
					}
					if (/\.(png|jpe?g|gif|webp|avif)$/.test(getAssetName(assetInfo))) {
						return 'images/[name]-[hash][extname]';
					}
					if (/\.(svg)$/.test(getAssetName(assetInfo))) {
						return 'svgs/[name]-[hash][extname]';
					}
					if ('rte-backend.css'.includes(getAssetName(assetInfo))) {
						return 'backend/[name][extname]';
					}
					return 'assets/[name]-[hash][extname]';
				},
			},
		},
	},
	server: {
		cors: {
			origin: [...getDefaultAllowedOrigins(), /^https?:\/\/.*\.dev(:\d+)?$/],
		},
	},
};

export default defineConfig(config);
