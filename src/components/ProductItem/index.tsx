import { MdAddShoppingCart } from "react-icons/md";
import { formatPrice } from "../../util/format";

interface ProductItemProps {
  product: Product;
  productQuantity?: number;
  handleAddProduct: (id: number) => void;
  cartItemsAmount: CartItemsAmount;
}
interface CartItemsAmount {
  [key: number]: number;
}
interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

export function ProductItem({
  product,
  handleAddProduct,
  cartItemsAmount,
}: ProductItemProps) {
  return (
    <li>
      <img src={product.image} alt={product.title} />
      <strong>{product.title}</strong>
      <span>{formatPrice(product.price)}</span>
      <button
        type='button'
        data-testid='add-product-button'
        onClick={() => handleAddProduct(product.id)}
      >
        <div data-testid='cart-product-quantity'>
          <MdAddShoppingCart size={16} color='#FFF' />
          {cartItemsAmount[product.id] || 0}
        </div>

        <span>ADICIONAR AO CARRINHO</span>
      </button>
    </li>
  );
}
