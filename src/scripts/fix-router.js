const fs = require('fs');
const path = require('path');

function replaceInDir(dir, search, replace) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath, search, replace);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(search)) {
        content = content.replaceAll(search, replace);
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceInDir(path.join(__dirname, '..', '..', 'src'), "'next/navigation'", "'next/navigation'");
