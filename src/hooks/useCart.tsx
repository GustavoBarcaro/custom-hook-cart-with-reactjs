import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productInCart = cart.find((p) => p.id === productId);
      const response = await api.get(`/stock/${productId}`);
      const amountInStock = response.data.amount;
      const currentAmount = productInCart ? productInCart.amount : 0;
      const updatedAmount = currentAmount + 1;
      if (updatedAmount > amountInStock) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }
      if (productInCart) {
        const updatedCart = cart.map((product) =>
          product.id === productId
            ? { ...product, amount: updatedAmount }
            : product
        );
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
        setCart(updatedCart);
      } else {
        const response = await api.get(`/products/${productId}`);
        localStorage.setItem(
          "@RocketShoes:cart",
          JSON.stringify([
            ...cart,
            {
              ...response.data,
              amount: 1,
            },
          ])
        );
        setCart((prevCart) => [
          ...prevCart,
          {
            ...response.data,
            amount: 1,
          },
        ]);
      }
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productIndex = cart.findIndex(
        (product) => product.id === productId
      );
      if (productIndex < 0) {
        throw new Error("attempt to remove a product that doesn't exist");
      }
      const updatedCart = cart.filter((product) => product.id !== productId);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
      setCart(updatedCart);
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      console.log(productId, amount);
      if (amount <= 0) {
        return;
      }
      const response = await api.get(`/stock/${productId}`);
      const productInCart = cart.findIndex((p) => p.id === productId);

      if (productInCart < 0 || !response.data.amount) {
        throw new Error("product not found");
      }
      const amountInStock = response.data.amount;

      if (amount > amountInStock) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }
      const updatedCart = cart.map((product) =>
        product.id === productId ? { ...product, amount: amount } : product
      );
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
      setCart(updatedCart);
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
