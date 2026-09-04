const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..', '..', 'src', 'app');

function prependUseClient(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      prependUseClient(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (!content.startsWith("'use client';") && content.includes('use')) {
        fs.writeFileSync(fullPath, "'use client';\n" + content);
      }
    }
  }
}

prependUseClient(appDir);
