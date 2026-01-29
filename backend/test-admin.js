// Simple test script to verify admin creation
const bcrypt = require('bcryptjs');

async function testAdmin() {
  console.log('Testing admin password hashing...\n');
  
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('Original password:', password);
  console.log('Hashed password:', hashedPassword);
  
  const isValid = await bcrypt.compare(password, hashedPassword);
  console.log('Password validation:', isValid ? '✅ PASS' : '❌ FAIL');
  
  // Test with wrong password
  const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword);
  console.log('Wrong password test:', isInvalid ? '❌ FAIL (should be false)' : '✅ PASS (correctly rejected)');
  
  console.log('\n--- Admin Login Test ---');
  console.log('If you see "✅ Default admin created" in your backend console,');
  console.log('the admin user exists and you should be able to login with:');
  console.log('Username: admin');
  console.log('Password: admin123');
  console.log('\nIf you DON\'T see that message, restart the backend server!');
}

testAdmin().catch(console.error);
