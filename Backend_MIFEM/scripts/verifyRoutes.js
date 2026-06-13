const fs = require('fs');
const path = require('path');

const routesDir = './routes';
const controllersDir = './controllers';

console.log('=== Verifying all route imports match controller exports ===\n');

const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

let allOk = true;

routeFiles.forEach(f => {
  const content = fs.readFileSync(path.join(routesDir, f), 'utf8');
  // Find all require('../controllers/...') and require('../middleware/...')
  const requireMatches = content.match(/require\(['"]\.\.\/(controllers|middleware|utils)\/([^'"]+)['"]\)/g);
  if (!requireMatches) return;

  requireMatches.forEach(m => {
    const parts = m.match(/require\(['"]\.\.\/(controllers|middleware|utils)\/([^'"]+)['"]\)/);
    if (!parts) return;
    const type = parts[1];
    const name = parts[2];
    let filePath;
    if (type === 'controllers') filePath = path.join(controllersDir, name + '.js');
    else if (type === 'middleware') filePath = path.join('./middleware', name + '.js');
    else if (type === 'utils') filePath = path.join('./utils', name + '.js');

    if (!fs.existsSync(filePath)) {
      console.log(`MISSING: ${filePath} required by routes/${f}`);
      allOk = false;
    }
  });

  // Check that destructured imports match module.exports in the controller
  const reqCtrlMatch = content.match(/require\(['"]\.\.\/controllers\/(\w+)['"]\)/);
  if (reqCtrlMatch) {
    const ctrlName = reqCtrlMatch[1];
    const ctrlPath = path.join(controllersDir, ctrlName + '.js');
    if (fs.existsSync(ctrlPath)) {
      const ctrlContent = fs.readFileSync(ctrlPath, 'utf8');
      const exportMatch = ctrlContent.match(/module\.exports\s*=\s*\{([^}]+)\}/);
      if (exportMatch) {
        const exported = exportMatch[1].split(',').map(s => s.trim().split(':')[0].trim());
        // Get functions imported in the route
        const routeFuncs = content.match(/\{([^}]+)\}\s*=\s*require\(['"]\.\.\/controllers\//);
        if (routeFuncs) {
          const imported = routeFuncs[1].split(',').map(s => s.trim());
          const missing = imported.filter(fn => !exported.includes(fn) && fn !== '...');
          if (missing.length > 0) {
            console.log(`ERROR in routes/${f}: functions [${missing.join(', ')}] not exported by controllers/${ctrlName}.js`);
            allOk = false;
          }
        }
      }
    }
  }
});

console.log('\n=== All files ===');
routeFiles.forEach(f => console.log(' ✓ routes/' + f));

console.log('\n' + (allOk ? '✓ ALL ROUTES VERIFIED OK' : '✗ ISSUES FOUND'));
