'use client';

import { useState, useEffect } from 'react';
import { Trash2, ShoppingBag, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { database } from '@/firebase';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue, remove } from 'firebase/database';

// Define interfaces matching Firebase data structure
interface ProductDetails {
  heading: string;
  imageURL: string;
  price: number;
}

interface CartItem {
  id: string; // Firebase push key
  productId: string;
  ownerUid: string;
  productDetails: ProductDetails;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  addedAt: number;
}

// Define the interface for data from Firebase
interface CartItemData {
  productId: string;
  ownerUid: string;
  productDetails: ProductDetails;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  addedAt: number;
}

export function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Listen for authentication state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchCartItems(currentUser.uid);
      } else {
        setUser(null);
        setCartItems([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch cart items from Firebase
  const fetchCartItems = (uid: string) => {
    const cartRef = ref(database, `users/${uid}/addtocart`);
    onValue(
      cartRef,
      (snapshot) => {
        const data = snapshot.val() as Record<string, CartItemData>;
        if (data) {
          const items: CartItem[] = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          setCartItems(items);
        } else {
          setCartItems([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching cart items:', error);
        setError('Failed to load cart items.');
        setLoading(false);
      }
    );
  };

  // Remove item from Firebase
  const removeItem = async (id: string) => {
    if (!user) return;
    try {
      await remove(ref(database, `users/${user.uid}/addtocart/${id}`));
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item.');
    }
  };

  // Placeholder for booking logic
  const bookNow = (id: string) => {
    console.log(`Booking item ${id}`);
    // Implement booking logic here
  };

  // Placeholder for order processing logic
  const processOrder = () => {
    console.log(`Processing order for ${deliveryMethod}`);
    // Implement order processing logic here
    alert(`Order processed with delivery method: ${deliveryMethod}`);
  };

  // Calculate total items and cost
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = cartItems.reduce(
    (sum, item) => sum + item.productDetails.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">Loading...</div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h2 className="text-2xl font-semibold mb-4">You are not logged in.</h2>
        <Button
          onClick={() => router.push('/login')}
          className="bg-[#000080] hover:bg-[#000060] text-white"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-[#000080]">
            Your Shopping Cart
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
        )}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 bg-white rounded shadow">
                <ShoppingBag className="w-16 h-16 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700">
                  Your cart is empty.
                </h2>
                <Button
                  onClick={() => router.push('/')}
                  className="mt-4 bg-[#000080] hover:bg-[#000060] text-white"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-24 w-24">
                      <div className="relative w-full h-full">
                        <Image
                          src={item.productDetails.imageURL}
                          alt={item.productDetails.heading}
                          layout="fill"
                          className="object-contain rounded"
                        />
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h2 className="text-sm sm:text-base font-semibold truncate">
                        {item.productDetails.heading}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm sm:text-base text-[#000080] font-bold">
                        ₹{(item.productDetails.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm w-full"
                        onClick={() => bookNow(item.id)}
                      >
                        Book Now
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm w-full text-red-600 hover:text-red-700"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Order Summary Section */}
          <div>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">
                  Order Summary
                </h2>
                <div className="space-y-2 mb-4">
                  <p className="flex justify-between text-sm sm:text-base">
                    <span>Total Items:</span>
                    <span>{totalItems}</span>
                  </p>
                  <p className="flex justify-between text-base sm:text-lg font-bold">
                    <span>Total Cost:</span>
                    <span>₹{totalCost.toFixed(2)}</span>
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Delivery Method</h3>
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={(value: string) =>
                      setDeliveryMethod(value as 'pickup' | 'delivery')
                    }
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="text-sm cursor-pointer">
                        Pick Up In-Store
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery" className="text-sm cursor-pointer">
                        Home Delivery
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button
                  className="w-full bg-[#000080] hover:bg-[#000060] text-white text-sm sm:text-base flex items-center justify-center"
                  onClick={processOrder}
                  disabled={cartItems.length === 0}
                >
                  {deliveryMethod === 'pickup' ? (
                    <>
                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Pick Up In-Store
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Proceed to Delivery
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
