// shop-dashboard.tsx
'use client'

import React, { useState, useEffect} from 'react'
import { useRouter } from 'next/navigation' // Import useRouter from next/navigation
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, Trash2, Plus } from 'lucide-react'
import Image from 'next/image'
import { database, auth } from '@/firebase' // Adjust the path as needed
import { ref, onValue, remove, update } from 'firebase/database'
import { onAuthStateChanged, User } from 'firebase/auth'

// Define the Product interface within the same file
interface Product {
  id: string
  heading: string
  price: number
  imageURL: string
  createdAt?: number // Optional field
  // Add other fields as necessary
}

const ShopDashboardComponent: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const router = useRouter() // Initialize the router

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUserId(user.uid)
      } else {
        // Handle unauthenticated state (e.g., redirect to login)
        alert('User not authenticated. Please log in.')
        // Optionally, redirect to login page
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [router])

  // Fetch products from Firebase
  useEffect(() => {
    if (!userId) return

    const productsRef = ref(database, `users/${userId}/products`)
    const unsubscribe = onValue(
      productsRef,
      (snapshot) => {
        const data = snapshot.val()
        const productList: Product[] = data
          ? Object.keys(data).map(key => ({
              id: key,
              heading: data[key].heading,
              price: data[key].price,
              imageURL: data[key].imageURL,
              createdAt: data[key].createdAt,
              // Add other fields as necessary
            }))
          : []
        setProducts(productList)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching products:", error)
        setLoading(false)
        alert('Failed to load products.')
      }
    )

    return () => unsubscribe()
  }, [userId])

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
  }

  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const productRef = ref(database, `users/${userId}/products/${productId}`)
      remove(productRef)
        .then(() => {
          alert('Product deleted successfully.')
        })
        .catch(error => {
          console.error("Error deleting product:", error)
          alert('Failed to delete product.')
        })
    }
  }

  const handleSave = () => {
    if (!editingProduct) {
      alert('No product is being edited.')
      return
    }

    const { heading, price, imageURL, id } = editingProduct

    if (!heading || price === undefined || !imageURL) {
      alert('Please fill in all fields.')
      return
    }

    const productRef = ref(database, `users/${userId}/products/${id}`)
    update(productRef, {
      heading,
      price: parseFloat(price.toString()),
      imageURL,
      // Add other fields as needed
    })
      .then(() => {
        alert('Product updated successfully.')
        setEditingProduct(null)
      })
      .catch(error => {
        console.error("Error updating product:", error)
        alert('Failed to update product.')
      })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">My Shop Dashboard</h1>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Product Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{products.length}</p>
            <p className="text-center text-gray-500">Total Products</p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button
              className="w-full"
              onClick={() => router.push('/shopadmin')} // Navigate to /shopadmin on click
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Product
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-4">
          {loading ? (
            Array(3).fill(0).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            products.map(product => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={product.imageURL || '/placeholder.svg?height=100&width=100'}
                      alt={product.heading}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.heading}</h3>
                      <p className="text-sm text-gray-500">₹{product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        {editingProduct && editingProduct.id === product.id && (
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>Edit Product</SheetTitle>
                              <SheetDescription>Make changes to your product here. Click save when youre done.</SheetDescription>
                            </SheetHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="heading">Name</Label>
                                <Input
                                  id="heading"
                                  value={editingProduct.heading}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, heading: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input
                                  id="price"
                                  type="number"
                                  value={editingProduct.price.toString()}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="imageURL">Image URL</Label>
                                <Input
                                  id="imageURL"
                                  value={editingProduct.imageURL}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, imageURL: e.target.value })}
                                />
                              </div>
                              <Button onClick={handleSave}>Save Changes</Button>
                            </div>
                          </SheetContent>
                        )}
                      </Sheet>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ShopDashboardComponent
