import { createRoot } from 'react-dom/client'
import Index from './pages/Index.tsx'
import './index.css'
import './utils/clear-cache'
import { ConvexProvider } from 'convex/react'
import { convex } from './lib/convexClient'

const root = document.getElementById('root')
createRoot(root).render(
  <ConvexProvider client={convex.raw}>
    <Index />
  </ConvexProvider>,
)
