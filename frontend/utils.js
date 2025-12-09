// utils.js
export function createPageUrl(pageName) {
  // Example: convert page name to URL path
  switch (pageName) {
    case "Home":
      return "/";
    case "AIRoom":
      return "/ai/code-whisperer";
    case "About":
      return "/about";
    default:
      return "/";
  }
}
