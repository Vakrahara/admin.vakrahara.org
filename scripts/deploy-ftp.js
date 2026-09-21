const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '../../../infra/.env.hostinger');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  });
}

const HASHED_ASSET_EXTENSIONS = new Set([
  '.js',
  '.css',
  '.woff2',
  '.woff',
  '.ttf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg'
]);

function isEligibleForSkip(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  // ONLY content-hashed assets inside _next/static/(chunks|media|css)/ are eligible for size-based skipping
  if (!/(?:^|\/)_next\/static\/(?:chunks|media|css)\//.test(normalized)) {
    return false;
  }
  const filename = path.basename(filePath).toLowerCase();
  // Manifest and unhashed entry files must ALWAYS be uploaded unconditionally
  if (
    filename.includes('manifest') ||
    filename.endsWith('.html') ||
    filename.endsWith('.txt') ||
    filename.endsWith('.json') ||
    filename.endsWith('.xml') ||
    filename === '.htaccess'
  ) {
    return false;
  }
  const ext = path.extname(filePath).toLowerCase();
  return HASHED_ASSET_EXTENSIONS.has(ext);
}

const uploadedInSession = new Set();

async function syncDirectory(client, localDir) {
  let remoteList = [];
  try {
    remoteList = await client.list();
  } catch (e) {
    remoteList = [];
  }
  const remoteMap = new Map(remoteList.map(item => [item.name, item]));

  const localEntries = fs.readdirSync(localDir);
  for (const entry of localEntries) {
    const localPath = path.join(localDir, entry);
    const stat = fs.statSync(localPath);

    if (stat.isDirectory()) {
      await client.ensureDir(entry);
      await syncDirectory(client, localPath);
      await client.cdup();
    } else if (stat.isFile()) {
      if (uploadedInSession.has(localPath)) {
        continue;
      }
      const remoteItem = remoteMap.get(entry);
      const isHashedAsset = isEligibleForSkip(localPath);
      if (isHashedAsset && remoteItem && remoteItem.size === stat.size) {
        uploadedInSession.add(localPath);
        continue;
      }
      console.log(`📤 Uploading: ${entry} (${Math.round(stat.size / 1024)} KB)`);
      await client.uploadFrom(localPath, entry);
      uploadedInSession.add(localPath);
      await new Promise(r => setTimeout(r, 40));
    }
  }
}

async function deploy() {
  const host = process.env.HOSTINGER_FTP_SERVER || process.env.FTP_SERVER || '91.108.107.97';
  const user = process.env.HOSTINGER_FTP_USERNAME || process.env.FTP_USERNAME;
  const password = process.env.HOSTINGER_FTP_PASSWORD || process.env.FTP_PASSWORD;
  const localDir = path.resolve(process.env.LOCAL_DIR || './out');

  const maxRetries = 10;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const client = new ftp.Client();
    client.ftp.verbose = false;
    client.timeout = 180000;

    try {
      console.log(`🚀 Connecting to Hostinger (${host}) as ${user} (Attempt ${attempt}/${maxRetries})...`);
      await client.access({
        host: host,
        user: user,
        password: password,
        secure: true,
        secureOptions: {
          rejectUnauthorized: false
        }
      });

      console.log('✅ Connected and authenticated via FTPS successfully.');
      const targetDir = 'domains/vakrahara.org/public_html/admin';
      await client.ensureDir(targetDir);
      const finalPwd = await client.pwd();
      console.log(`✅ Destination directory: ${finalPwd}`);

      await syncDirectory(client, localDir);

      console.log('🎉 Deployment completed successfully with 0 errors!');
      client.close();
      return;
    } catch (err) {
      console.warn(`⚠️ Attempt ${attempt} encountered error: ${err.message || err}`);
      client.close();
      if (attempt >= maxRetries) {
        console.error('❌ All deployment attempts failed.');
        process.exit(1);
      }
      console.log('⏳ Resuming incremental upload in 3 seconds...');
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

deploy();
