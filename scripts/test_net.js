const net = require('net');

const client = new net.Socket();
client.setTimeout(3000);
client.connect(5432, 'db.tbgtvrveyjuupqbcldya.supabase.co', () => {
  console.log('Connected to 5432!');
  client.destroy();
});
client.on('error', (err) => {
  console.log('Error 5432:', err.message);
});
client.on('timeout', () => {
  console.log('Timeout 5432');
  client.destroy();
});
