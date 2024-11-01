'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { database } from '@/firebase';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { ref, get, push, set } from 'firebase/database';
import Image from 'next/image';

interface Product {
  id: string;
  heading: string;
  imageURL?: string;
  price: number;
  category: string;
  description?: string;
}

export default function AddToCartPage() {
  const router = useRouter();
  const { ownerUid, productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!ownerUid || !productId) return;

    const fetchProduct = async () => {
      try {
        const productRef = ref(database, `users/${ownerUid}/products/${productId}`);
        const snapshot = await get(productRef);
        if (!snapshot.exists()) {
          const productAltRef = ref(database, `users/${ownerUid}/product/${productId}`);
          const altSnapshot = await get(productAltRef);
          if (altSnapshot.exists()) {
            const productData = altSnapshot.val();
            setProduct({ ...productData, id: productId });
          } else {
            setProduct(null);
          }
        } else {
          const productData = snapshot.val();
          setProduct({ ...productData, id: productId });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [ownerUid, productId]);

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }

    if (!product) return;

    try {
      const cartRef = ref(database, `users/${user.uid}/addtocart`);
      const newCartItemRef = push(cartRef);
      await set(newCartItemRef, {
        productId: product.id,
        ownerUid: ownerUid,
        quantity,
        addedAt: Date.now(),
        productDetails: {
          heading: product.heading,
          price: product.price,
          imageURL: product.imageURL || '',
        },
      });
      router.push('/cart'); // Navigate to cart after adding
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!product) {
    return <div className="flex items-center justify-center min-h-screen">Product not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-[#000080]">Your Brand</h1>
          <button className="text-gray-600 hover:text-[#000080]" onClick={() => router.push('/cart')}>
            <ShoppingCart className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:flex-shrink-0 flex items-center justify-center h-96 md:w-96">
              <div className="relative w-full h-full">
                <Image
                  className="object-contain"
                  src={product.imageURL || '/placeholder.svg'}
                  alt={product.heading}
                  layout="fill"
                  objectFit="contain" // Ensures the image fits within the bounds without cropping
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-[#000080] font-semibold">New Arrival</div>
              <h2 className="mt-2 text-3xl leading-8 font-extrabold text-gray-900">{product.heading}</h2>
              <p className="mt-2 text-xl text-gray-500">₹{product.price.toFixed(2)}</p>
              <p className="mt-4 text-gray-500">{product.description}</p>
              
              {/* Professional Tagline */}
              <div className="mt-4 text-gray-700 italic">
                Quality you can trust, delivered with care.
              </div>

              {/* Quantity Selection */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
                <div className="flex items-center mt-2 space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="mt-8">
                <Button
                  className="w-full bg-[#000080] hover:bg-[#000060] text-white"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
