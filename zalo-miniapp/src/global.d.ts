declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

interface Window {
  ZaloJavaScriptInterface?: {
    getStatusBarHeight: () => number;
  };
  APP_CONFIG?: typeof import("../../app-config.json");
}
