import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Cloudscape global styles (required for all Cloudscape components)
import "@cloudscape-design/global-styles/index.css";

// -------------------------------------------------------------------
// Theme configuration
// -------------------------------------------------------------------
// Cloudscape supports Light and Dark modes.
// To switch modes, uncomment the appropriate line below:
//
// import { applyMode, Mode } from "@cloudscape-design/global-styles";
// applyMode(Mode.Light);   // Light mode (default)
// applyMode(Mode.Dark);    // Dark mode
//
// To switch density:
// import { applyDensity, Density } from "@cloudscape-design/global-styles";
// applyDensity(Density.Compact);    // Compact density
// applyDensity(Density.Comfortable); // Comfortable density (default)
//
// To apply a custom theme (runtime theming):
// import { applyTheme } from "@cloudscape-design/components/theming";
// const { reset } = applyTheme({
//   theme: {
//     tokens: {
//       colorTextAccent: "#0073bb",
//       fontFamilyBase: "'Open Sans', sans-serif",
//       borderRadiusButton: "4px",
//     },
//     contexts: {
//       "top-navigation": {
//         tokens: { colorTextAccent: "#44b9d6" },
//       },
//     },
//   },
// });
// -------------------------------------------------------------------

import { applyTheme } from "@cloudscape-design/components/theming";

applyTheme({
  theme: {
    tokens: {
      fontFamilyBase: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
      borderRadiusContainer: "20px",
      borderRadiusButton: "999px",
      borderRadiusInput: "14px",
      borderRadiusDropdown: "14px",
      colorBackgroundLayoutMain: "#f5f5f7",
      colorBackgroundContainerContent: "#ffffff",
      colorBackgroundContainerHeader: "#f5f5f7",
      colorBackgroundHomeHeader: "#f5f5f7",
      colorTextBodyDefault: "#1d1d1f",
      colorTextAccent: "#0071e3",
      colorBorderContainerTop: "#d2d2d7",
      colorBackgroundButtonPrimaryDefault: "#1d1d1f",
      colorBackgroundButtonPrimaryHover: "#000000",
      colorBackgroundButtonPrimaryActive: "#000000",
    },
    contexts: {
      "top-navigation": {
        tokens: {
          colorTextAccent: "#f5f5f7",
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
