'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, Shield, HandMetal, Store, Search, Home, Heart, ShoppingCart, User } from 'lucide-react'
import mumbra from "@/img/Mumbra.png"
import m1 from "@/img/1.png"

import { database } from '@/firebase'
import { ref, onValue } from 'firebase/database'

// Define the Product and UserType interfaces
interface Product {
  id: string;
  heading: string;
  imageURL?: string;
  price: number;
  category: string;
  description?: string;
  ownerUid: string;
  distance?: number; // Distance from user in kilometers
}

interface UserType {
  products?: Record<string, Product>;
  product?: Record<string, Product>;
  shop?: {
    latitude: number;
    longitude: number;
    shopName: string;
    shopNumber: string;
  };
}

// Define the Benefit interface
interface Benefit {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  { icon: Truck, title: "Fast Delivery", description: "Get your products delivered quickly and efficiently" },
  { icon: Shield, title: "100% Transparency", description: "Clear and honest information about our products and services" },
  { icon: HandMetal, title: "Hand-to-Hand Transfer", description: "Secure and personal delivery right to your hands" },
  { icon: Store, title: "Connect with Nearby Shops", description: "Support local businesses and get products from shops near you" },
]

// Helper function to calculate distance between two coordinates using Haversine formula
const getDistanceFromLatLonInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

// Helper function to format distance
const formatDistance = (distance: number): string => {
  if (distance < 1) {
    const meters = Math.round(distance * 1000);
    return `${meters} m`;
  }
  return `${distance.toFixed(2)} km`;
}

function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/wishlist', icon: Heart, label: 'Wishlist' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 md:hidden">
      <ul className="flex justify-around p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link href={item.href} className="flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ease-in-out hover:bg-gray-100">
                <Icon
                  className={`h-6 w-6 ${isActive ? 'text-[#000050]' : 'text-gray-600'} transition-colors duration-200 ease-in-out`}
                />
                <span className={`text-xs mt-1 ${isActive ? 'text-[#000050] font-medium' : 'text-gray-600'} transition-colors duration-200 ease-in-out`}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SearchPageComponent() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState<boolean>(true)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter();

  // Fetch user's location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
      },
      (err) => {
        console.error(err);
        setError('Failed to get your location');
        setLoading(false);
      }
    );
  }, [])

  // Fetch products from Firebase
  useEffect(() => {
    const productsRef = ref(database, 'users')
    onValue(productsRef, (snapshot) => {
      const usersData: Record<string, UserType> | null = snapshot.val()
      const allProducts: Product[] = []
      if (usersData) {
        Object.entries(usersData).forEach(([userUid, user]) => {
          const shopLat = user.shop?.latitude
          const shopLon = user.shop?.longitude

          if (user.products) {
            Object.entries(user.products).forEach(([productId, product]) => {
              let distance: number | undefined = undefined
              if (userLocation && shopLat != null && shopLon != null) {
                distance = getDistanceFromLatLonInKm(
                  userLocation.latitude,
                  userLocation.longitude,
                  shopLat,
                  shopLon
                )
              }
              allProducts.push({ ...product, id: productId, ownerUid: userUid, distance })
            })
          }
          if (user.product) {
            Object.entries(user.product).forEach(([productId, product]) => {
              let distance: number | undefined = undefined
              if (userLocation && shopLat != null && shopLon != null) {
                distance = getDistanceFromLatLonInKm(
                  userLocation.latitude,
                  userLocation.longitude,
                  shopLat,
                  shopLon
                )
              }
              allProducts.push({ ...product, id: productId, ownerUid: userUid, distance })
            })
          }
        })
      }

      // Sort products by distance if distance is available
      const sortedProducts = allProducts.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance
        }
        return 0
      })

      setProducts(sortedProducts)
      setFilteredProducts(sortedProducts)
      setLoading(false)
    })
  }, [userLocation])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase()
    setSearchTerm(term)
    const filtered = products.filter(product =>
      product.heading.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term)
    )
    setFilteredProducts(filtered)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-white shadow-sm">
        <Link href="/" className="text-2xl font-bold text-[#000050] flex items-center">
          <Image src={mumbra} alt="Mumbra Logo" width={250} height={200} className="mr-2" />
        </Link>
        <nav className="hidden md:block">
          <ul className="flex space-x-4">
            <li><Link href="/" className="text-gray-600 hover:text-[#000050] transition-colors duration-200">Home</Link></li>
            <li><Link href="/products" className="text-gray-600 hover:text-[#000050] transition-colors duration-200">Products</Link></li>
            <li><Link href="/about" className="text-gray-600 hover:text-[#000050] transition-colors duration-200">About</Link></li>
            <li><Link href="/contact" className="text-gray-600 hover:text-[#000050] transition-colors duration-200">Contact</Link></li>
          </ul>
        </nav>
      </header>

      <main className="flex-grow pt-8 pb-24 md:pb-16 px-4 md:px-6">
        {/* Display error message if any */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 text-center mb-6">
            {error}
          </div>
        )}

        {/* Search Section */}
        <section className="mb-12">
          <h1 className="text-3xl font-bold text-[#000050] mb-6 text-center">Search Products</h1>
          <div className="max-w-2xl mx-auto relative">
            <Input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#000050] transition-all duration-200"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </section>

        {/* Tabs for Different Product Categories */}
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="Electronics">Electronics</TabsTrigger>
            <TabsTrigger value="Sports">Sports</TabsTrigger>
            <TabsTrigger value="Home">Home</TabsTrigger>
          </TabsList>

          {/* All Products Tab */}
          <TabsContent value="all">
            <section>
              <h2 className="text-2xl font-semibold text-[#000050] mb-6">
                {searchTerm ? `Search Results for "${searchTerm}"` : "All Products"}
              </h2>
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        <div className="relative w-full h-48 overflow-hidden rounded-lg">
                          <Image
                            src={product.imageURL || m1}
                            alt={product.heading}
                            layout="fill"
                            objectFit="contain"
                            className="rounded-lg"
                          />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{product.heading}</h3>
                        <p className="text-[#000050] font-bold">${product.price.toFixed(2)}</p>
                        {product.distance !== undefined && (
                          <p className="text-sm text-gray-600 mb-2">
                            Distance: {formatDistance(product.distance)}
                          </p>
                        )}
                        <Button
                          className="w-full mt-2 bg-[#000050] hover:bg-[#000080]"
                          onClick={() => router.push(`/addtocart/${product.ownerUid}/${product.id}`)}
                        >
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600">No products found.</p>
              )}
            </section>
          </TabsContent>

          {/* Electronics Tab */}
          <TabsContent value="Electronics">
            <section>
              <h2 className="text-2xl font-semibold text-[#000050] mb-6">Electronics</h2>
              {filteredProducts.filter(p => p.category === 'Electronics').length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts
                    .filter((product) => product.category === 'Electronics')
                    .map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <div className="relative w-full h-48 overflow-hidden rounded-lg">
                            <Image
                              src={product.imageURL || m1}
                              alt={product.heading}
                              layout="fill"
                              objectFit="contain"
                              className="rounded-lg"
                            />
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{product.heading}</h3>
                          <p className="text-[#000050] font-bold">${product.price.toFixed(2)}</p>
                          {product.distance !== undefined && (
                            <p className="text-sm text-gray-600 mb-2">
                              Distance: {formatDistance(product.distance)}
                            </p>
                          )}
                          <Button
                            className="w-full mt-2 bg-[#000050] hover:bg-[#000080]"
                            onClick={() => router.push(`/addtocart/${product.ownerUid}/${product.id}`)}
                          >
                            Add to Cart
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-600">No Electronics products found.</p>
              )}
            </section>
          </TabsContent>

          {/* Sports Tab */}
          <TabsContent value="Sports">
            <section>
              <h2 className="text-2xl font-semibold text-[#000050] mb-6">Sports</h2>
              {filteredProducts.filter(p => p.category === 'Sports').length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts
                    .filter((product) => product.category === 'Sports')
                    .map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <div className="relative w-full h-48 overflow-hidden rounded-lg">
                            <Image
                              src={product.imageURL || m1}
                              alt={product.heading}
                              layout="fill"
                              objectFit="contain"
                              className="rounded-lg"
                            />
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{product.heading}</h3>
                          <p className="text-[#000050] font-bold">${product.price.toFixed(2)}</p>
                          {product.distance !== undefined && (
                            <p className="text-sm text-gray-600 mb-2">
                              Distance: {formatDistance(product.distance)}
                            </p>
                          )}
                          <Button
                            className="w-full mt-2 bg-[#000050] hover:bg-[#000080]"
                            onClick={() => router.push(`/addtocart/${product.ownerUid}/${product.id}`)}
                          >
                            Add to Cart
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-600">No Sports products found.</p>
              )}
            </section>
          </TabsContent>

          {/* Home Tab */}
          <TabsContent value="Home">
            <section>
              <h2 className="text-2xl font-semibold text-[#000050] mb-6">Home</h2>
              {filteredProducts.filter(p => p.category === 'Home').length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts
                    .filter((product) => product.category === 'Home')
                    .map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <div className="relative w-full h-48 overflow-hidden rounded-lg">
                            <Image
                              src={product.imageURL || m1}
                              alt={product.heading}
                              layout="fill"
                              objectFit="contain"
                              className="rounded-lg"
                            />
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{product.heading}</h3>
                          <p className="text-[#000050] font-bold">${product.price.toFixed(2)}</p>
                          {product.distance !== undefined && (
                            <p className="text-sm text-gray-600 mb-2">
                              Distance: {formatDistance(product.distance)}
                            </p>
                          )}
                          <Button
                            className="w-full mt-2 bg-[#000050] hover:bg-[#000080]"
                            onClick={() => router.push(`/addtocart/${product.ownerUid}/${product.id}`)}
                          >
                            Add to Cart
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-600">No Home products found.</p>
              )}
            </section>
          </TabsContent>

        </Tabs>

        {/* Benefits Section */}
        <section className="mt-16 py-8 bg-white rounded-lg shadow">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#000050]">Our Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="transition-transform duration-300 hover:scale-105">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <benefit.icon className="w-12 h-12 text-[#000050] mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
