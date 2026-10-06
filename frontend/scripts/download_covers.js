import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const IMAGES = {
  'website-api.jpg': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80',
  'security.jpg': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80',
  'servers.jpg': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80',
  'network.jpg': 'https://images.unsplash.com/photo-1551703599-6b3e8379aa8b?auto=format&fit=crop&w=900&q=80',
  'incidents.jpg': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
  'cybersachet.jpg': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80',
  'devops.jpg': 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=900&q=80',
  'edr.jpg': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80',
  'academy.jpg': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80'
};

const targetDir = path.resolve('public', 'covers');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  for (const [name, url] of Object.entries(IMAGES)) {
    const dest = path.join(targetDir, name);
    try {
      await download(url, dest);
      const size = fs.statSync(dest).size;
      console.log(`✓ Downloaded ${name} (${size} bytes)`);
    } catch (err) {
      console.error(`✗ Error downloading ${name}:`, err.message);
    }
  }
}

run();
