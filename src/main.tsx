import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ConvexProvider } from "convex/react";
import { convex, convexClientAvailable } from "./lib/convexClient";

const root = document.getElementById("root")!;
createRoot(root).render(
  convexClientAvailable && convex.raw ? (
    <ConvexProvider client={convex.raw}>
      <App />
    </ConvexProvider>
  ) : (
    <App />
  )
);
