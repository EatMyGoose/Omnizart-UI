import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import "materialize-css/dist/css/materialize.css"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import "./fullHeightSidebar.css"

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App /> 
    </QueryClientProvider>
  </React.StrictMode>,
)
