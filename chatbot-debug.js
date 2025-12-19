// Debug script to check chatbot positioning
console.log("=== CHATBOT POSITION DEBUG ===");

// Find the chatbot container
const chatbotContainer = document.querySelector('.chatbot-container');
if (chatbotContainer) {
  console.log("✓ Chatbot container found");
  
  // Get computed styles
  const computedStyles = window.getComputedStyle(chatbotContainer);
  console.log("Position:", computedStyles.position);
  console.log("Top:", computedStyles.top);
  console.log("Bottom:", computedStyles.bottom);
  console.log("Left:", computedStyles.left);
  console.log("Right:", computedStyles.right);
  console.log("Z-index:", computedStyles.zIndex);
  
  // Get element position
  const rect = chatbotContainer.getBoundingClientRect();
  console.log("Element bounds:", {
    top: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right,
    width: rect.width,
    height: rect.height
  });
  
  // Check toggle button
  const toggleButton = document.querySelector('.chatbot-toggle');
  if (toggleButton) {
    console.log("✓ Toggle button found");
    const toggleRect = toggleButton.getBoundingClientRect();
    console.log("Toggle button position:", {
      top: toggleRect.top,
      bottom: toggleRect.bottom,
      left: toggleRect.left,
      right: toggleRect.right
    });
  } else {
    console.log("✗ Toggle button NOT found");
  }
  
} else {
  console.log("✗ Chatbot container NOT found");
}

// Check all CSS rules that apply to chatbot elements
console.log("\n=== CSS CLASSES APPLIED ===");
const allElements = document.querySelectorAll('[class*="chatbot"]');
allElements.forEach((el, i) => {
  console.log(`Element ${i}:`, el.className, "Position:", window.getComputedStyle(el).position);
});