const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const idx = trimmed.indexOf('=');
    const key = trimmed.substring(0, idx).trim();
    let val = trimmed.substring(idx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[key] = val;
  }
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testUpload() {
  const testBuffer = Buffer.from('test image content');
  const path = `category-images/novel/${Date.now()}-test.txt`;
  
  const { data, error } = await supabase.storage
    .from('book-covers')
    .upload(path, testBuffer, {
      contentType: 'text/plain',
      upsert: true,
    });
    
  console.log('Upload result:', data, error);
  if (!error) {
    const { data: urlData } = supabase.storage.from('book-covers').getPublicUrl(path);
    console.log('Public URL:', urlData.publicUrl);
    
    // Clean up
    await supabase.storage.from('book-covers').remove([path]);
    console.log('Cleaned up successfully');
  }
}

testUpload();
