import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { Alert } from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const loadedCart = await AsyncStorage.getItem('@gomarketplace/cart');

      loadedCart && setProducts(JSON.parse(loadedCart));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const newProduct = products.find(
        actualProduct => actualProduct.id === product.id,
      );

      let newCart = [];

      if (newProduct) {
        newProduct.quantity += 1;

        const newProductsArray = products.filter(
          actualProduct => actualProduct.id !== newProduct.id,
        );

        newCart = [...newProductsArray, newProduct];
      } else {
        newCart = [...products, { ...product, quantity: 1 }];
      }

      setProducts(newCart);

      await AsyncStorage.setItem(
        '@gomarketplace/cart',
        JSON.stringify(newCart),
      );

      Alert.alert('Item adicionado ao carrinho.');
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const product = products.find(actualProduct => actualProduct.id === id);

      if (product) {
        product.quantity += 1;

        const newProductsArray = products.filter(
          actualProduct => actualProduct.id !== product.id,
        );

        const newCart = [...newProductsArray, product];

        setProducts(newCart);

        await AsyncStorage.setItem(
          '@gomarketplace/cart',
          JSON.stringify(newCart),
        );

        Alert.alert('Item incrementado.');
      } else {
        throw new Error('Produto inexistente');
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.find(actualProduct => actualProduct.id === id);

      if (product) {
        product.quantity -= 1;

        const newProductsArray = products.filter(
          actualProduct => actualProduct.id !== product.id,
        );

        const newCart = [...newProductsArray, product];

        setProducts(newCart);

        await AsyncStorage.setItem(
          '@gomarketplace/cart',
          JSON.stringify(newCart),
        );

        Alert.alert('Item incrementado.');
      } else {
        throw new Error('Produto inexistente');
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
