import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CartProvider } from './context/CartContext'
import { StockProvider } from './context/StockContext'
import { ProductsProvider } from './context/ProductsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ProductsProvider>
        <StockProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </StockProvider>
      </ProductsProvider>
    </BrowserRouter>
  </StrictMode>,
)
