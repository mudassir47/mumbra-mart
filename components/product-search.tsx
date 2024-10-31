'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { database } from '@/firebase'
import { ref, onValue } from 'firebase/database'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, ShoppingCart } from 'lucide-react'
import mumbra from "@/img/Mumbra.png"

interface Product {
  id: string;
  heading: string;
  imageURL?: string;
  price: number;
  category: string;
  description?: string;
}

export function ProductSearchComponent() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const productsRef = ref(database, 'users')
    onValue(productsRef, (snapshot) => {
      const usersData: Record<string, { products?: Record<string, Product> }> | null = snapshot.val()
      const allProducts: Product[] = []
      if (usersData) {
        Object.values(usersData).forEach((user) => {
          if (user.products) {
            Object.values(user.products).forEach((product: Product) => {
              allProducts.push(product)
            })
          }
        })
      }
      setProducts(allProducts)
      setLoading(false)
    })
  }, [])

  const filteredProducts = products.filter(product =>
    product.heading.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex justify-between items-center p-4 bg-white shadow-sm">
        <Link href="/" className="flex items-center">
          <Image src={mumbra} alt="Mumbra Logo" width={150} height={120} className="mr-2" />
        </Link>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-64 md:w-80 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#000050]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <Button className="bg-[#000050] hover:bg-[#000080]">
            <ShoppingCart className="mr-2" size={20} />
            Cart
          </Button>
        </div>
      </header>

      <main className="flex-grow p-6">
        <h1 className="text-3xl font-bold mb-6 text-[#000050]">Product Search</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#000050]"></div>
          </div>
        ) : (
          <>
            <p className="mb-4 text-gray-600">
              {searchTerm ? `Showing results for "${searchTerm}"` : 'Showing all products'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <Image
                    src={product.imageURL || '/placeholder.png'}
                    alt={product.heading}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-4">
                    <h2 className="font-semibold text-lg mb-2">{product.heading}</h2>
                    <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                    <p className="text-[#000050] font-bold mb-2">${product.price.toFixed(2)}</p>
                    <Button className="w-full bg-[#000050] hover:bg-[#000080]">
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <p className="text-center text-gray-600 mt-8">No products found. Try a different search term.</p>
            )}
          </>
        )}
      </main>

      <footer className="bg-[#000050] text-white py-6 px-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 Mumbra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}