const fs = require('fs');

function search(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = dir + '/' + f;
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') search(full);
    } else {
      const txt = fs.readFileSync(full, 'utf8');
      if (txt.includes("from('categories')") || txt.includes('from("categories")') || 
          txt.includes("from('authors')") || txt.includes('from("authors")')) {
        console.log('Found supabase call in:', full);
      }
    }
  }
}
search('.');
