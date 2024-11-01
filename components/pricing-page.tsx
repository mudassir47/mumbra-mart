'use client'

import React, { useState, FC, FormEvent } from 'react'; // Removed useEffect
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from 'lucide-react';
import { auth, database } from '@/firebase';
import { ref, set } from 'firebase/database';
// Removed unused imports
// import { onAuthStateChanged, User } from 'firebase/auth';

interface Feature {
  included: boolean;
  text: string;
}

interface CTA {
  text: string;
  onClick: () => void;
}

interface PricingTierProps {
  title: string;
  price: number | string;
  originalPrice?: number;
  discount?: number;
  features: Feature[];
  cta: CTA;
  popular?: boolean;
}

const PricingTier: FC<PricingTierProps> = ({ title, price, originalPrice, discount, features, cta, popular = false }) => (
  <Card className={`w-full max-w-sm ${popular ? 'border-[#000052] border-2' : ''}`}>
    <CardHeader>
      <CardTitle className="text-2xl font-bold">{title}</CardTitle>
      <CardDescription>
        {originalPrice && discount ? (
          <div className="space-y-1">
            <span className="text-3xl font-bold">₹{price}</span>
            <div>
              <span className="text-lg line-through text-gray-500">₹{originalPrice}</span>
              <span className="ml-2 text-green-600 font-semibold">{discount}% OFF</span>
            </div>
          </div>
        ) : (
          <span className="text-3xl font-bold">
            {typeof price === 'number' ? `₹${price}` : price}
          </span>
        )}
        {typeof price === 'number' && price > 0 && <span className="text-sm">/month</span>}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            {feature.included ? (
              <Check className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <X className="h-5 w-5 text-red-500 mr-2" />
            )}
            <span className={feature.included ? '' : 'text-gray-500 line-through'}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button className="w-full bg-[#000052] hover:bg-[#000052]/90" onClick={cta.onClick}>
        {cta.text}
      </Button>
    </CardFooter>
  </Card>
)

export function PricingPageComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');
  const [shopNumber, setShopNumber] = useState<string>('');
  const router = useRouter();

  const openModal = (plan: string) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShopName('');
    setShopNumber('');
    setSelectedPlan('');
  };

  const handleRegisterShop = async (e: FormEvent) => {
    e.preventDefault();
    if (!shopName || !shopNumber) return;

    const user = auth.currentUser;
    if (!user) {
      alert('User not authenticated');
      return;
    }

    try {
      const userId = user.uid;
      const shopRef = ref(database, `users/${userId}/shop`);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          await set(shopRef, {
            shopName,
            shopNumber,
            latitude,
            longitude
          });
          closeModal();
          router.push('/profile?message=Shop%20registered%20successfully');
        }, () => {
          alert('Unable to retrieve your location');
        });
      } else {
        alert('Geolocation is not supported by this browser.');
      }
    } catch (error) {
      console.error('Error registering shop:', error);
      alert('Failed to register shop. Please try again.');
    }
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/919958399157`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Pricing Plans
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Choose the perfect plan for your business
          </p>
        </div>
        <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
          <PricingTier
            title="Free"
            price={0}
            features={[
              { included: true, text: "Upload 20 products" },
              { included: true, text: "20 leads per month" },
              { included: true, text: "1st rank in nearby area" },
              { included: true, text: "Help and support" },
              { included: true, text: "Real-time product display to nearby users" },
              { included: false, text: "Unlimited product uploads" },
              { included: false, text: "Unlimited leads" },
            ]}
            cta={{ text: "Get Started", onClick: () => openModal('Free') }}
          />
          <PricingTier
            title="Premium"
            price={1000}
            originalPrice={2000}
            discount={50}
            features={[
              { included: true, text: "Upload 200 products" },
              { included: true, text: "200 leads per month" },
              { included: true, text: "1st rank in nearby area" },
              { included: true, text: "Help and support" },
              { included: true, text: "Real-time product display to nearby users" },
              { included: false, text: "Unlimited product uploads" },
              { included: false, text: "Unlimited leads" },
            ]}
            cta={{ text: "Get Premium", onClick: () => openModal('Premium') }}
            popular={true}
          />
          <PricingTier
            title="Enterprise"
            price="Custom"
            features={[
              { included: true, text: "Unlimited product uploads" },
              { included: true, text: "Unlimited leads" },
              { included: true, text: "1st rank in nearby area" },
              { included: true, text: "Priority help and support" },
              { included: true, text: "Real-time product display to nearby users" },
              { included: true, text: "Custom features available" },
              { included: true, text: "Dedicated account manager" },
            ]}
            cta={{ text: "Contact Us", onClick: openWhatsApp }}
          />
        </div>
        <div className="mt-10 text-center">
          <p className="text-gray-600">
            All plans include our revolutionary feature: When users open the app while walking nearby,
            your products are automatically displayed in real-time!
          </p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold">Register Shop - {selectedPlan} Plan</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">
                &times;
              </button>
            </div>
            <form onSubmit={handleRegisterShop} className="p-4 space-y-4">
              <div>
                <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
                  Shop Name
                </label>
                <input
                  type="text"
                  id="shopName"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#000052] focus:border-[#000052]"
                />
              </div>
              <div>
                <label htmlFor="shopNumber" className="block text-sm font-medium text-gray-700">
                  Shop Number
                </label>
                <input
                  type="text"
                  id="shopNumber"
                  value={shopNumber}
                  onChange={(e) => setShopNumber(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#000052] focus:border-[#000052]"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" onClick={closeModal} className="bg-gray-300 hover:bg-gray-400">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#000052] hover:bg-[#000052]/90">
                  Register Shop
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
