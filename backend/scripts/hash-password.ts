import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run hash-password -- "VotreMotDePasse"');
  process.exit(1);
}

console.log(await bcrypt.hash(password, 12));
