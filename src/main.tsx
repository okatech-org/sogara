import { createRoot } from 'react-dom/client'
import Index from './pages/Index.tsx'
import './index.css'
import './utils/forceHSE001Update'
import './utils/updatePersonalizedURLs'
import './utils/updateHSSEChiefRole'
import './utils/updateHSE001Menu'
import './utils/debugHSE001Menu'
import './utils/clear-cache'
import { ConvexProvider } from 'convex/react'
import { convex } from './lib/convexClient'

const root = document.getElementById('root')
createRoot(root).render(
  <ConvexProvider client={convex.raw}>
    <Index />
  </ConvexProvider>,
)
