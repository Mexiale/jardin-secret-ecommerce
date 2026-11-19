import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductPage from "./pages/ProductPage";
import About from "./pages/About";
import Sopk from "./pages/Sopk";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import AvisAdmin from "./pages/admin/AvisAdmin";
import StockAdmin from "./pages/admin/StockAdmin";
import ProduitsAdmin from "./pages/admin/ProduitsAdmin";
import ProduitForm from "./pages/admin/ProduitForm";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/boutique" element={<Shop />} />
        <Route path="/produits/:slug" element={<ProductPage />} />
        <Route path="/notre-histoire" element={<About />} />
        <Route path="/sopk" element={<Sopk />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/panier" element={<Cart />} />
      </Route>
      <Route path="/admin/avis" element={<AvisAdmin />} />
      <Route path="/admin/stock" element={<StockAdmin />} />
      <Route path="/admin/produits" element={<ProduitsAdmin />} />
      <Route path="/admin/produits/nouveau" element={<ProduitForm />} />
      <Route path="/admin/produits/:slug" element={<ProduitForm />} />
    </Routes>
  );
}

export default App;
