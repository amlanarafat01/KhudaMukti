// Makes a test JWT without Member 1's login endpoint.
// Usage: node scripts/dev-token.js <userId> <role>    e.g. node scripts/dev-token.js RECEIVER001 receiver
require('dotenv').config();
const jwt = require('jsonwebtoken');

const [id, role] = process.argv.slice(2);
if (!id || !role) {
  console.error('Usage: node scripts/dev-token.js <userId> <admin|donor|receiver|volunteer>');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET missing in .env');
  process.exit(1);
}
console.log(jwt.sign({ sub: id, role }, process.env.JWT_SECRET, { expiresIn: '2h' }));
