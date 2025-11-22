/**
 * Simple verification script to check error handling consistency
 */

const fs = require('fs');
const path = require('path');

const serviceFiles = [
  'src/services/authservices.js',
  'src/services/adminservices.js'
];

console.log('🔍 Verifying Error Handling Consistency\n');
console.log('=' .repeat(60));

let allPassed = true;

serviceFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  console.log(`\n📄 Analyzing: ${file}`);
  console.log('-'.repeat(60));

  // Find all async arrow functions
  const asyncFunctionPattern = /(?:const|export const)\s+(\w+)\s*=\s*async/;
  const tryCatchPattern = /try\s*\{/;
  const catchErrorPattern = /catch\s*\(error\)\s*\{/;
  const throwPattern = /throw\s+error\.response\?\.data\s*\|\|\s*error/;
  
  let currentFunction = null;
  let inFunction = false;
  let braceDepth = 0;
  let functionStartLine = 0;
  let hasTry = false;
  let hasCatch = false;
  let hasProperThrow = false;
  const functionResults = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is a new async function
    const funcMatch = line.match(asyncFunctionPattern);
    if (funcMatch && !inFunction) {
      // Save previous function results
      if (currentFunction && currentFunction !== 'replaceUrlParams') {
        functionResults.push({
          name: currentFunction,
          hasTry,
          hasCatch,
          hasProperThrow,
          startLine: functionStartLine
        });
      }
      
      currentFunction = funcMatch[1];
      functionStartLine = i + 1;
      inFunction = false;
      braceDepth = 0;
      hasTry = false;
      hasCatch = false;
      hasProperThrow = false;
    }
    
    // Track braces to know when we're in the function
    if (currentFunction) {
      for (let char of line) {
        if (char === '{') {
          braceDepth++;
          inFunction = true;
        } else if (char === '}') {
          braceDepth--;
          if (braceDepth === 0 && inFunction) {
            // Function ended
            if (currentFunction !== 'replaceUrlParams') {
              functionResults.push({
                name: currentFunction,
                hasTry,
                hasCatch,
                hasProperThrow,
                startLine: functionStartLine
              });
            }
            currentFunction = null;
            inFunction = false;
          }
        }
      }
      
      // Check for patterns within the function
      if (inFunction) {
        if (tryCatchPattern.test(line)) {
          hasTry = true;
        }
        if (catchErrorPattern.test(line)) {
          hasCatch = true;
        }
        if (throwPattern.test(line)) {
          hasProperThrow = true;
        }
      }
    }
  }

  // Display results
  let filePassed = true;
  functionResults.forEach(func => {
    const passed = func.hasTry && func.hasCatch && func.hasProperThrow;
    const status = passed ? '✅' : '❌';
    console.log(`  ${status} ${func.name} (line ${func.startLine})`);
    
    if (!passed) {
      filePassed = false;
      if (!func.hasTry) console.log(`      ⚠️  Missing try block`);
      if (!func.hasCatch) console.log(`      ⚠️  Missing catch (error) block`);
      if (!func.hasProperThrow) console.log(`      ⚠️  Missing proper error handling: throw error.response?.data || error`);
    }
  });

  if (!filePassed) {
    allPassed = false;
  }

  console.log(`\n  Total functions: ${functionResults.length}`);
  const passedCount = functionResults.filter(f => f.hasTry && f.hasCatch && f.hasProperThrow).length;
  console.log(`  Passed: ${passedCount}/${functionResults.length}`);
});

console.log('\n' + '='.repeat(60));

if (allPassed) {
  console.log('\n✅ All functions have consistent error handling!');
  console.log('\nVerified patterns:');
  console.log('  ✓ All async functions use try-catch blocks');
  console.log('  ✓ All catch blocks use catch (error) syntax');
  console.log('  ✓ All catch blocks throw error.response?.data || error');
  process.exit(0);
} else {
  console.log('\n❌ Some functions need error handling improvements');
  process.exit(1);
}
