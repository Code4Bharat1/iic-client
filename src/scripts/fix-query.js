const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Fix imports to include useParams and useSearchParams
      if (content.includes('router.query')) {
        let imports = [];
        if (content.match(/router\.query\.(id|ref|slug)/)) {
          imports.push('useParams');
        }
        if (content.match(/router\.query\.(search|status|floor|date|start|end|expired)/)) {
          imports.push('useSearchParams');
        }
        
        if (imports.length > 0) {
          // Find next/navigation import
          if (content.includes("from 'next/navigation'")) {
            for (const imp of imports) {
              if (!content.includes(imp)) {
                content = content.replace("import { useRouter", `import { useRouter, ${imp}`);
              }
            }
          }
          
          // Add the hook calls inside the component
          // A bit hacky, let's just do it directly:
          content = content.replace(/const router = useRouter\(\);/g, "const router = useRouter();\n  " + (imports.includes('useParams') ? "const params = useParams();\n  " : "") + (imports.includes('useSearchParams') ? "const searchParams = useSearchParams();\n  " : ""));

          // Replace usages
          content = content.replace(/router\.query\.id/g, "params?.id");
          content = content.replace(/router\.query\.search/g, "searchParams?.get('search')");
          content = content.replace(/router\.query\.status/g, "searchParams?.get('status')");
          content = content.replace(/router\.query\.floor/g, "searchParams?.get('floor')");
          content = content.replace(/router\.query\.date/g, "searchParams?.get('date')");
          content = content.replace(/router\.query\.start/g, "searchParams?.get('start')");
          content = content.replace(/router\.query\.end/g, "searchParams?.get('end')");
          content = content.replace(/router\.query\.expired/g, "searchParams?.get('expired')");
          content = content.replace(/router\.isReady/g, "true");
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceInDir(path.join(__dirname, '..', '..', 'src'));
