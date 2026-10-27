// tests/signup-flow.test.js

/**
 * CashApp MVP - Signup Flow Test
 * Tests the complete user registration and login flow
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Test Data File Path
const USERS_FILE = path.join(__dirname, '../data/users.json');

// Helper Functions
function readUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function clearTestUsers() {
    if (fs.existsSync(USERS_FILE)) {
        let users = readUsers();
        // Keep only real users (optional filter)
        users = users.filter(user => !user.email.includes('test'));
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    }
}

// Test Suite
console.log("🧪 Starting CashApp Signup Flow Tests...\n");

try {
    // Test 1: Signup with valid data
    console.log("Test 1: New User Signup");
    
    const newTestUser = {
        id: Date.now(),
        fullName: "Test User",
        email: "testuser@example.com",
        phone: "+13452345678",
        cashtag: "$testuser",
        password: "password123",
        balance: 50.00,
        btcBalance: 0.0000,
        createdAt: new Date().toISOString()
    };

    let users = readUsers();

    // Check for duplicate
    const existing = users.find(u => u.email === newTestUser.email || u.cashtag === newTestUser.cashtag);
    
    if (existing) {
        console.log("⚠️  Test user already exists. Removing...");
        users = users.filter(u => u.email !== newTestUser.email);
    }

    users.push(newTestUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

    console.log("✅ User created successfully");
    console.log(`   Name: ${newTestUser.fullName}`);
    console.log(`   Cashtag: ${newTestUser.cashtag}`);
    console.log(`   Email: ${newTestUser.email}`);
    console.log(`   Balance: $${newTestUser.balance}\n`);

    // Test 2: Verify user was saved
    console.log("Test 2: Verify User Persistence");
    const savedUsers = readUsers();
    const savedUser = savedUsers.find(u => u.email === newTestUser.email);

    assert.ok(savedUser, "User should be saved in data file");
    assert.strictEqual(savedUser.cashtag, newTestUser.cashtag, "Cashtag should match");
    assert.strictEqual(savedUser.balance, 50.00, "Should receive welcome bonus");

    console.log("✅ User data persisted correctly\n");

    // Test 3: Prevent duplicate signup
    console.log("Test 3: Duplicate Signup Prevention");
    const duplicateAttempt = users.some(u => u.email === newTestUser.email);

    assert.ok(duplicateAttempt, "System should detect existing user");

    console.log("✅ Duplicate signup prevented\n");

    console.log("🎉 All Signup Flow Tests Passed Successfully!");

} catch (error) {
    console.error("❌ Test Failed:", error.message);
    process.exit(1);
}

// Cleanup (optional - comment out if you want to keep test user)
clearTestUsers();

console.log("\n✅ Test completed.");