import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Usage: npx tsx scripts/hash-password.ts <password>');
  console.error('');
  console.error('IMPORTANT: Pick a NEW password. The old one is burned — it has been');
  console.error('stored in plaintext in GitHub secrets, Cloudflare dashboard, and may');
  console.error('have been logged by diagnostic code. Never reuse it.');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log('Hash:', hash);
console.log('');
console.log('Next steps:');
console.log('1. Add ADMIN_PASSWORD_HASH to GitHub Actions secrets with this value');
console.log('2. Run: echo "<hash>" | npx wrangler secret put ADMIN_PASSWORD_HASH');
console.log('3. Delete the old ADMIN_PASSWORD from GitHub Actions secrets');
console.log('4. Delete the old ADMIN_PASSWORD from Cloudflare dashboard secrets');
console.log('5. Delete this script after use');
