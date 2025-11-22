/**
 * Verification script to check error handling consistency
 * This script analyzes the service files to ensure all async functions
 * follow the consistent error handling pattern
 */

const fs = require('fs');
const path = require('path');

// Files to check
const serviceFiles = [
  'src/services/authservices.js',
  'src/services/adminservices.js'
];

// Pattern to match: async function with try-catch and error.response?.data
const patterns = {
  asyncFunction: /(?:const|export const)\s+(\w+)\s*=\s*async\s*\([^)]*\)\s*=>\s*\{/g,
  tryBlock: /try\s*\{/g,
  catchBlock: /catch\s*\(error\)\s*\{/g,
  errorHandling: /throw\s+error\.response\?\.data\s*\|\|\s*error/g
};

console.log('🔍 Verifying Error Handling Consistency\n');
console.log('=' .repeat(60));

let totalFunctions = 0;
let functionsWithTryCatch = 0;
let functionsWithProperErrorHandling = 0;
const issues = [];

serviceFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  
  console.log(`\n📄 Analyzing: ${file}`);
  console.log('-'.repeat(60));

  // Find all async functions
  const asyncFunctions = [];
  let match;
  
  patterns.asyncFunction.lastIndex = 0;
  while ((match = patterns.asyncFunction.exec(content)) !== null) {
    const functionName = match[1];
    const functionStart = match.index;
    
    // Skip helper functions
    if (functionName === 'replaceUrlParams') continue;
    
    asyncFunctions.push({
      name: functionName,
      start: functionStart
    });
  }

  totalFunctions += asyncFunctions.length;
  console.log(`Found ${asyncFunctions.length} async functions`);

  // Check each function for proper error handling
  asyncFunctions.forEach(func => {
    // Extract function body (simplified - find matching braces)
    let braceCount = 0;
    let functionEnd = func.start;
    let inFunction = false;
    
    for (let i = func.start; i < content.length; i++) {
      if (content[i] === '{') {
        braceCount++;
        inFunction = true;
      } else if (content[i] === '}') {
        braceCount--;
        if (inFunction && braceCount === 0) {
          functionEnd = i;
          break;
        }
      }
    }

    const functionBody = content.substring(func.start, functionEnd + 1);
    
    // Check for try-catch
    const hasTryCatch = /try\s*\{/.test(functionBody) && /catch\s*\(error\)/.test(functionBody);
    
    // Check for proper error handling pattern
    const hasProperErrorHandling = /throw\s+error\.response\?\.data\s*\|\|\s*error/.test(functionBody);

    if (hasTryCatch) {
      functionsWithTryCatch++;
    }

    if (hasProperErrorHandling) {
      functionsWithProperErrorHandling++;
    }

    const status = hasTryCatch && hasProperErrorHandling ? '✅' : '❌';
    console.log(`  ${status} ${func.name}`);

    if (!hasTryCatch) {
      issues.push(`${file}: ${func.name} - Missing try-catch block`);
    }
    if (!hasProperErrorHandling && hasTryCatch) {
      issues.push(`${file}: ${func.name} - Missing proper error handling (error.response?.data || error)`);
    }
  });
});

console.log('\n' + '='.repeat(60));
console.log('📊 Summary\n');
console.log(`Total async functions: ${totalFunctions}`);
console.log(`Functions with try-catch: ${functionsWithTryCatch} (${Math.round(functionsWithTryCatch/totalFunctions*100)}%)`);
console.log(`Functions with proper error handling: ${functionsWithProperErrorHandling} (${Math.round(functionsWithProperErrorHandling/totalFunctions*100)}%)`);

if (issues.length > 0) {
  console.log('\n⚠️  Issues Found:\n');
  issues.forEach(issue => console.log(`  - ${issue}`));
  console.log('\n❌ Verification FAILED');
  process.exit(1);
} else {
  console.log('\n✅ All functions have consistent error handling!');
  console.log('\nVerified patterns:');
  console.log('  ✓ All async functions use try-catch blocks');
  console.log('  ✓ All catch blocks extract error.response?.data');
  console.log('  ✓ All catch blocks throw structured errors');
  process.exit(0);
}
