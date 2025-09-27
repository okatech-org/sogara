import { createRoot } from "react-dom/client";
import Index from "./pages/Index.tsx";
import "./index.css";
import { ConvexProvider } from "convex/react";
import { convex, convexClientAvailable } from "./lib/convexClient";

const root = document.getElementById("root")!;
createRoot(root).render(
  convexClientAvailable && convex.raw ? (
    <ConvexProvider client={convex.raw}>
      <Index />
    </ConvexProvider>
  ) : (
    <Index />
  )
);
