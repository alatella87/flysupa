// global.d.ts
interface HSStaticMethods {
  autoInit: () => void;
  // Add other methods and properties as needed
}

interface Window {
  HSStaticMethods: HSStaticMethods;
}