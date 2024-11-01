// shopprofile/[useruid]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Phone } from 'lucide-react';
import { useParams } from 'next/navigation';

import { database } from '@/firebase';
import { ref, get } from 'firebase/database';

// Define interfaces
interface Product {
  id: string;
  name: string;
  price: number;
  imageURL: string;
}

interface UserShopInfo {
  name: string;
  profileImage: string;
  shop: {
    shopName: string;
    shopNumber: string;
  };
  products?: Record<string, ProductData>;
}

interface ProductData {
  category: string;
  createdAt: number;
  description: string;
  heading: string;
  imageURL: string;
  price: number;
}

export default function ShopProfilePage() {
  const { useruid } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [shopInfo, setShopInfo] = useState<UserShopInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!useruid) return;

    const fetchData = async () => {
      try {
        const userRef = ref(database, `users/${useruid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val() as UserShopInfo;
          setShopInfo(userData);

          const productsData = userData.products || {};
          const productsArray: Product[] = Object.entries(productsData).map(([key, value]) => ({
            id: key,
            name: value.heading,
            price: value.price,
            imageURL: value.imageURL || '/placeholder.svg?height=200&width=200',
          }));

          setProducts(productsArray);
        } else {
          console.error('User data not found');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [useruid]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">Loading...</div>
    );
  }

  if (!shopInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Shop not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Shop Profile Header */}
      <div className="bg-[#000060] text-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <Image
              src={shopInfo.profileImage || '/placeholder.svg?height=100&width=100'}
              alt={shopInfo.shop.shopName}
              width={80}
              height={80}
              className="rounded-full border-4 border-white"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{shopInfo.shop.shopName}</h1>
              <div className="flex items-center mt-2">
                <Phone className="h-4 w-4 mr-2" />
                <span>{shopInfo.shop.shopNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-4">Our Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative w-full h-48">
                <Image
                  src={product.imageURL}
                  alt={product.name}
                  layout="fill"
                  objectFit="contain"
                  className="w-full h-48 object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-[#000060] font-bold">₹{product.price.toFixed(2)}</p>
                <Button
                  className="w-full mt-2 bg-[#000060] hover:bg-[#000060]/90"
                  // Implement add to cart functionality here
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
