const ftp = require('basic-ftp');
const path = require('path');

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  client.timeout = 60000;

  const host = process.env.FTP_SERVER || '91.108.107.97';
  const user = process.env.FTP_USERNAME;
  const password = process.env.FTP_PASSWORD;
  const localDir = path.resolve(process.env.LOCAL_DIR || './out');

  console.log(`🚀 Connecting to Hostinger (${host}) as ${user}...`);

  try {
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
    const pwd = await client.pwd();
    console.log(`🔍 Current FTP Directory: ${pwd}`);
    const list = await client.list();
    console.log(`📁 Contents of ${pwd}:`);
    list.forEach(item => console.log(`   - ${item.name} (${item.isDirectory ? 'DIR' : 'FILE'})`));

    // Smart detection:
    // If public_html exists in the listing, navigate to public_html/admin.
    // If we are already inside public_html (no public_html directory), navigate directly to admin.
    const hasPublicHtml = list.some(item => item.name === 'public_html' && item.isDirectory);
    const targetDir = hasPublicHtml ? 'public_html/admin' : 'admin';
    
    console.log('\n========================================');
    console.log('📍 HOSTINGER PATH VERIFICATION DIAGNOSTIC:');
    console.log(`   - Connected User: ${user}`);
    console.log(`   - Initial Working Directory: ${pwd}`);
    console.log(`   - Is 'public_html' found in list: ${hasPublicHtml}`);
    console.log(`   - Navigating to Target Subdirectory: '${targetDir}'`);
    console.log('========================================\n');
    
    await client.ensureDir(targetDir);
    
    const finalPwd = await client.pwd();
    console.log(`✅ VERIFIED DESTINATION PATH: ${finalPwd}`);
    console.log(`🚀 All admin files from ${localDir} will be uploaded directly into: ${finalPwd}\n`);

    client.trackProgress(info => {
      console.log(`📤 Uploading: ${info.name} (${Math.round(info.bytesOverall / 1024)} KB)`);
    });

    // Upload directly into the current working directory
    await client.uploadFromDir(localDir);

    console.log('🎉 Deployment completed successfully with 0 errors!');
  } catch (err) {
    console.error('❌ FTP Deployment failed with error:', err.message || err);
    console.error(err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
