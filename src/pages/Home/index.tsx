import { useState, useEffect } from "react";

import { ProductList } from "./styles";
import { api } from "../../services/api";
import { useCart } from "../../hooks/useCart";
import { ProductItem } from "../../components/ProductItem";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    sumAmount[product.id] = product.amount;
    return sumAmount;
  }, {} as CartItemsAmount);

  useEffect(() => {
    async function loadProducts() {
      const response = await api.get("/products");
      setProducts(response.data);
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    addProduct(id);
  }

  return (
    <ProductList>
      {products.map((each) => (
        <ProductItem
          key={each.id}
          product={each}
          handleAddProduct={handleAddProduct}
          cartItemsAmount={cartItemsAmount}
        />
      ))}
    </ProductList>
  );
};

export default Home;
