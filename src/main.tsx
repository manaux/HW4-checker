import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import hw4Rules from './data/hw4Rules.json'
import type { HW4RulesFile } from './types/index'

// Sanity check: confirms JSON import resolves correctly at runtime.
// Remove or guard behind import.meta.env.DEV before Phase 5 deploy.
console.log('Loaded', (hw4Rules as HW4RulesFile).rules.length, 'HW4 rules')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
