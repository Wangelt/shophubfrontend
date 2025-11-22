/**
 * Service Layer Coding Pattern Validation Script
 * 
 * This script validates that all service functions follow consistent coding patterns:
 * 1. Use replaceUrlParams helper for URL parameters
 * 2. Reference ENDPOINTS config for URLs and methods
 * 3. Use Axios instance from lib/axios.js
 * 4. Use named exports
 * 5. Include 'use client' directive
 */

const fs = require('fs');
const path = require('path');

const SERVICE_FILES = [
  'src/services/authservices.js',
  'src/services/adminservices.js',
  'src/services/userservices.js'
];

const VALIDATION_RULES = {
  useClientDirective: {
    pattern: /^['"]use client['"]/m,
    description: "'use client' directive present at top of file"
  },
  replaceUrlParamsHelper: {
    pattern: /const replaceUrlParams = \(url, params = \{\}\) => \{/,
    description: "replaceUrlParams helper function defined"
  },
  axiosImport: {
    pattern: /import Axios from ["'][@./]+lib\/axios["']/,
    description: "Axios imported from lib/axios.js"
  },
  endpointsImport: {
    pattern: /import ENDPOINTS from ["'][@./]+lib\/apiConfig/,
    description: "ENDPOINTS imported from lib/apiConfig"
  },
  namedExports: {
    pattern: /(^export (const|async function|function)|^export \{)/m,
    description: "Functions use named exports"
  },
  noDefaultExport: {
    pattern: /^export default/m,
    description: "No default exports (should use named exports)",
    shouldNotMatch: true
  }
};

console.log('='.repeat(80));
console.log('SERVICE LAYER CODING PATTERN VALIDATION');
console.log('='.repeat(80));
console.log();

let allPassed = true;

SERVICE_FILES.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    allPassed = false;
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  
  console.log(`📄 ${filePath}`);
  console.log('-'.repeat(80));

  Object.entries(VALIDATION_RULES).forEach(([ruleName, rule]) => {
    const matches = rule.pattern.test(content);
    const passed = rule.shouldNotMatch ? !matches : matches;
    
    if (passed) {
      console.log(`  ✅ ${rule.description}`);
    } else {
      console.log(`  ❌ ${rule.description}`);
      allPassed = false;
    }
  });

  // Additional checks for specific patterns
  const urlParamFunctions = content.match(/replaceUrlParams\(/g);
  if (urlParamFunctions) {
    console.log(`  ℹ️  replaceUrlParams used ${urlParamFunctions.length} time(s)`);
  }

  const endpointReferences = content.match(/ENDPOINTS\./g);
  if (endpointReferences) {
    console.log(`  ℹ️  ENDPOINTS referenced ${endpointReferences.length} time(s)`);
  }

  const axiosCalls = content.match(/await Axios\(/g);
  if (axiosCalls) {
    console.log(`  ℹ️  Axios called ${axiosCalls.length} time(s)`);
  }

  console.log();
});

console.log('='.repeat(80));
if (allPassed) {
  console.log('✅ ALL VALIDATION CHECKS PASSED');
  console.log('All service files follow consistent coding patterns.');
} else {
  console.log('❌ VALIDATION FAILED');
  console.log('Some service files do not follow the required coding patterns.');
  process.exit(1);
}
console.log('='.repeat(80));
