import { defineConfig } from 'vite';
import typo3, { getDefaultAllowedOrigins } from 'vite-plugin-typo3';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';

function ignoreHMRUpdates(options = {}) {
	return {
		name: 'ignore-hmr-updates',
		hotUpdate({ server, file }) {
			const paths = options.paths ?? [];
			const files = options.files ?? [];
			const shouldbeIgnored = paths.some(path => {
				if (typeof path === 'string') return file.includes(path);
				if (typeof path === 'object') {
					if (!path.path) {
						console.error('Missing path in path object');
						return false;
					}

					if (!file.includes(path.path)) return false;
					if (path.excludeByExtension) {
						const shouldbeIgnoredFile = path.excludeByExtension.some(fileType => {
							return file.endsWith(fileType);
						});
						if (shouldbeIgnoredFile) return false;
					}

					file.includes(path.path);
				}
			});
			if (shouldbeIgnored) return [];

			const shouldbeIgnoredFile = files.some(fileType => file.endsWith(fileType));
			if (shouldbeIgnoredFile) return [];
		},
	};
}

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		ignoreHMRUpdates({
			paths: [{ path: 'src/js', excludeByExtension: ['tsx', 'css'] }],
			files: ['js', 'ts', 'html', 'php'],
		}),
		typo3({
			entrypointFile: 'src/ViteEntrypoints.json',
		}),
		tailwindcss(),
	],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'packages', 'slimstart-dist', './src/js'),
		},
	},
	build: {
		outDir: resolve(__dirname, 'packages', 'slimstart-dist', 'Resources', 'Public', 'Build'),
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
