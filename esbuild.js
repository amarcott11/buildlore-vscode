const esbuild = require('esbuild');

const isMinify = process.argv.includes('--minify');
const isWatch = process.argv.includes('--watch');

const shared = {
  bundle: true,
  minify: isMinify,
  sourcemap: !isMinify,
};

async function build() {
  // Extension host bundle (Node.js CJS)
  const extensionOptions = {
    ...shared,
    entryPoints: ['src/extension.ts'],
    outfile: 'dist/extension.js',
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    external: ['vscode'],
  };

  // Webview bundle (browser IIFE)
  const webviewOptions = {
    ...shared,
    entryPoints: ['src/webview/preview.ts'],
    outfile: 'dist/webview.js',
    platform: 'browser',
    target: 'es2022',
    format: 'iife',
  };

  if (isWatch) {
    const extCtx = await esbuild.context(extensionOptions);
    const webCtx = await esbuild.context(webviewOptions);
    await Promise.all([extCtx.watch(), webCtx.watch()]);
    console.log('Watching for changes...');
  } else {
    await Promise.all([
      esbuild.build(extensionOptions),
      esbuild.build(webviewOptions),
    ]);
    console.log('Build complete.');
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
