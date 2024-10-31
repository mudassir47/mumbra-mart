'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Tabs imports are now being used
import { Truck, Shield, HandMetal, Store, Search, Home, Heart, ShoppingCart, User } from 'lucide-react'
import mumbra from "@/img/Mumbra.png"
import m1 from "@/img/1.png"

import { database } from '@/firebase'
import { ref, onValue } from 'firebase/database'

interface Product {
  id: string;
  heading: string;
  imageURL?: string;
  price: number;
  category: string;
}

interface UserType {
  products?: Record<string, Product>;
}

const benefits = [
  { icon: Truck, title: "Fast Delivery", description: "Get your products delivered quickly and efficiently" },
  { icon: Shield, title: "100% Transparency", description: "Clear and honest information about our products and services" },
  { icon: HandMetal, title: "Hand-to-Hand Transfer", description: "Secure and personal delivery right to your hands" },
  { icon: Store, title: "Connect with Nearby Shops", description: "Support local businesses and get products from shops near you" },
]

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

  useEffect(() => {
    const productsRef = ref(database, 'users')
    onValue(productsRef, (snapshot) => {
      const usersData: Record<string, UserType> | null = snapshot.val()
      const allProducts: Product[] = []
      if (usersData) {
        Object.values(usersData).forEach((user: UserType) => {
          if (user.products) {
            Object.values(user.products).forEach((product: Product) => {
              allProducts.push(product)
            })
          }
        })
      }
      setProducts(allProducts)
      setFilteredProducts(allProducts)
      setLoading(false)
    })
  }, [])

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
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="category1">Category 1</TabsTrigger>
            <TabsTrigger value="category2">Category 2</TabsTrigger>
            {/* Add more categories as needed */}
          </TabsList>

          {/* All Products Tab */}
          <TabsContent value="all">
            <section>
              <h2 className="text-2xl font-semibold text-[#000050] mb-6">
                {searchTerm ? `Search Results for "${searchTerm}"` : "All Products"}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                    <CardContent className="p-4">
                      <Image
                        src={product.imageURL || m1}
                        alt={product.heading}
                        width={200}
                        height={200}
                        className="w-full h-32 object-cover mb-4 rounded"
                      />
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.heading}</h3>
                      <p className="text-[#000050] font-bold">${product.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                      <Button className="w-full mt-2 bg-[#000050] hover:bg-[#000080] transition-colors duration-200">Add to Cart</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Example of another category */}
          <TabsContent value="category1">
            <section>
              <h2 className="text-2xl font-semibold text-[#000050] mb-6">Category 1 Products</h2>
              {/* Filtered Products by Category 1 */}
              {/* You can implement filtering logic here */}
            </section>
          </TabsContent>

          <TabsContent value="category2">
            <section>
              <h2 className="text-2xl font-semibold text-[#000050] mb-6">Category 2 Products</h2>
              {/* Filtered Products by Category 2 */}
              {/* You can implement filtering logic here */}
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
