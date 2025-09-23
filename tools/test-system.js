#!/usr/bin/env node

/**
 * BrewOps System Test Script
 * 
 * This script performs basic system tests to verify the application is working correctly.
 * Run with: node tools/test-system.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4323';
const FRONTEND_URL = 'http://localhost:5173';

// Test configuration
const TEST_USER = {
  name: 'Test Admin',
  email: 'test@brewops.com',
  password: 'password123',
  role: 'manager',
  phone: '0712345678',
  employeeId: 'TEST001'
};

let authToken = '';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, success, message = '') {
  const status = success ? '✓' : '✗';
  const color = success ? 'green' : 'red';
  log(`${status} ${testName}`, color);
  if (message) {
    log(`  ${message}`, 'yellow');
  }
}

async function testAPIHealth() {
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    const success = response.status === 200 && response.data.success;
    logTest('API Health Check', success, success ? 'API is running' : 'API not responding');
    return success;
  } catch (error) {
    logTest('API Health Check', false, error.message);
    return false;
  }
}

async function testUserRegistration() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, TEST_USER);
    const success = response.status === 201 && response.data.success;
    logTest('User Registration', success, success ? 'User registered successfully' : 'Registration failed');
    return success;
  } catch (error) {
    logTest('User Registration', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testUserLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    const success = response.status === 200 && response.data.success && response.data.jwtToken;
    if (success) {
      authToken = response.data.jwtToken;
      logTest('User Login', success, 'Login successful, token received');
    } else {
      logTest('User Login', false, 'Login failed or no token received');
    }
    return success;
  } catch (error) {
    logTest('User Login', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetCurrentUser() {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/user`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const success = response.status === 200 && response.data.id;
    logTest('Get Current User', success, success ? 'User data retrieved' : 'Failed to get user data');
    return success;
  } catch (error) {
    logTest('Get Current User', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetUsers() {
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const success = response.status === 200 && response.data.success;
    logTest('Get Users (Admin)', success, success ? 'Users list retrieved' : 'Failed to get users');
    return success;
  } catch (error) {
    logTest('Get Users (Admin)', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetSuppliers() {
  try {
    const response = await axios.get(`${BASE_URL}/api/suppliers`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const success = response.status === 200 && response.data.success;
    logTest('Get Suppliers', success, success ? 'Suppliers retrieved' : 'Failed to get suppliers');
    return success;
  } catch (error) {
    logTest('Get Suppliers', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetInventory() {
  try {
    const response = await axios.get(`${BASE_URL}/api/inventory`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const success = response.status === 200 && response.data.success;
    logTest('Get Inventory', success, success ? 'Inventory retrieved' : 'Failed to get inventory');
    return success;
  } catch (error) {
    logTest('Get Inventory', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetPayments() {
  try {
    const response = await axios.get(`${BASE_URL}/api/payments`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const success = response.status === 200 && response.data.success;
    logTest('Get Payments', success, success ? 'Payments retrieved' : 'Failed to get payments');
    return success;
  } catch (error) {
    logTest('Get Payments', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testFrontendAccess() {
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
    const success = response.status === 200;
    logTest('Frontend Access', success, success ? 'Frontend is accessible' : 'Frontend not accessible');
    return success;
  } catch (error) {
    logTest('Frontend Access', false, error.message);
    return false;
  }
}

async function runAllTests() {
  log('\n🚀 BrewOps System Test Suite', 'bold');
  log('=' .repeat(50), 'blue');
  
  const tests = [
    { name: 'API Health Check', fn: testAPIHealth },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Get Current User', fn: testGetCurrentUser },
    { name: 'Get Users (Admin)', fn: testGetUsers },
    { name: 'Get Suppliers', fn: testGetSuppliers },
    { name: 'Get Inventory', fn: testGetInventory },
    { name: 'Get Payments', fn: testGetPayments },
    { name: 'Frontend Access', fn: testFrontendAccess }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) passed++;
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  log('\n' + '=' .repeat(50), 'blue');
  log(`\n📊 Test Results: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 All tests passed! The system is working correctly.', 'green');
    log('\n✅ You can now:', 'bold');
    log('   • Access the frontend at: http://localhost:5173', 'blue');
    log('   • Use the API at: http://localhost:4323', 'blue');
    log('   • Login with: test@brewops.com / password123', 'blue');
    log('   • Import the Postman collection for detailed API testing', 'blue');
  } else {
    log('\n❌ Some tests failed. Please check the error messages above.', 'red');
    log('\n🔧 Troubleshooting tips:', 'bold');
    log('   • Ensure both backend and frontend are running', 'yellow');
    log('   • Check database connection and schema', 'yellow');
    log('   • Verify environment variables are set correctly', 'yellow');
    log('   • Check the README.md for setup instructions', 'yellow');
  }
  
  log('\n' + '=' .repeat(50), 'blue');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    log(`\n💥 Test suite failed with error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testAPIHealth,
  testUserRegistration,
  testUserLogin,
  testGetCurrentUser,
  testGetUsers,
  testGetSuppliers,
  testGetInventory,
  testGetPayments,
  testFrontendAccess
};

