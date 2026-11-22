import fs from 'fs';
import path from 'path';

if (fs.existsSync('dist')) {
  try {
    const indexHtmlPath = path.join('dist', 'index.html');

    if (fs.existsSync(indexHtmlPath)) {
      const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

      // 1. Create 404.html fallback in dist for static hosting engines
      fs.writeFileSync(path.join('dist', '404.html'), indexContent);

      // 2. Ensure _redirects file is present in dist for Render/Netlify SPA rewrites
      const redirectsContent = '/*    /index.html   200\n';
      fs.writeFileSync(path.join('dist', '_redirects'), redirectsContent);

      // 3. Pre-create physical route directories with index.html for direct link and hard-refresh compatibility
      const staticRoutes = ['admin', 'crm', 'portal', 'about', 'clients'];
      for (const route of staticRoutes) {
        const routeDir = path.join('dist', route);
        if (!fs.existsSync(routeDir)) {
          fs.mkdirSync(routeDir, { recursive: true });
        }
        fs.writeFileSync(path.join(routeDir, 'index.html'), indexContent);
      }

      console.log('✓ Successfully configured SPA static routing fallbacks (404.html, _redirects, route directories).');
    }

    // 4. Mirror complete dist directory to built and build for Render compatibility
    fs.cpSync('dist', 'built', { recursive: true });
    fs.cpSync('dist', 'build', { recursive: true });
    console.log('✓ Successfully mirrored dist to built and build directories for Render deployment.');
  } catch (err) {
    console.error('Error configuring deployment build directories:', err);
  }
} else {
  console.warn('Warning: dist directory does not exist yet. Run vite build first.');
}
