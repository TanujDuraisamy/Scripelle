// Simple test for the AI targeting system
import { extractTargetTag, cleanResponse, processAIResponse } from './aiTargeting.js';

// Test cases
const testCases = [
  {
    input: "This is some content that should go to the document.\n\n<<TARGET:document>>",
    expectedTarget: "document",
    expectedContent: "This is some content that should go to the document."
  },
  {
    input: "Here's some advice for the user.\n\n<<TARGET:sidebar>>",
    expectedTarget: "sidebar", 
    expectedContent: "Here's some advice for the user."
  },
  {
    input: "No target tag specified",
    expectedTarget: "sidebar",
    expectedContent: "No target tag specified"
  },
  {
    input: "Multiple tags <<TARGET:document>> <<TARGET:sidebar>>",
    expectedTarget: "document",
    expectedContent: "Multiple tags"
  }
];

console.log("Testing AI Targeting System...");

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}:`);
  console.log(`Input: "${testCase.input}"`);
  
  const target = extractTargetTag(testCase.input);
  const content = cleanResponse(testCase.input);
  const processed = processAIResponse(testCase.input);
  
  console.log(`Extracted target: ${target} (expected: ${testCase.expectedTarget})`);
  console.log(`Cleaned content: "${content}"`);
  console.log(`Processed result:`, processed);
  
  const targetPass = target === testCase.expectedTarget;
  const contentPass = content === testCase.expectedContent;
  
  console.log(`Target test: ${targetPass ? 'PASS' : 'FAIL'}`);
  console.log(`Content test: ${contentPass ? 'PASS' : 'FAIL'}`);
});

console.log("\nTesting complete!"); 