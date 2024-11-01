'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MapPin, Phone, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import mumbra from "@/img/Mumbra.png"
import { database } from '@/firebase'
import { ref, onValue } from 'firebase/database'

// Define the AddToCartItem interface based on Firebase structure
interface AddToCartItem {
  addedAt: number;
  ownerUid: string;
  productDetails: {
    heading: string;
    imageURL?: string;
    price: number;
  };
  productId: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

// Define the Product interface
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

// Define the UserType interface based on Firebase structure
interface UserType {
  addtocart?: Record<string, AddToCartItem>;
  email?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  phoneNumber?: string;
  profileImage?: string;
  shop?: {
    latitude: number;
    longitude: number;
    shopName: string;
    shopNumber: string;
  };
  products?: Record<string, Product>;
}

// Define the Shop interface
interface Shop {
  id: string; // userUid
  name: string;
  photo: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance?: number; // Distance from user in kilometers
}

// Helper function to calculate distance between two coordinates using Haversine formula
const getDistanceFromLatLonInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km
  return distance
}

// Helper function to format distance
const formatDistance = (distance: number): string => {
  if (distance < 1) {
    const meters = Math.round(distance * 1000)
    return `${meters} m`
  }
  return `${distance.toFixed(2)} km`
}

export function ShopListComponent() {
  const [shops, setShops] = useState<Shop[]>([])
  const [filteredShops, setFilteredShops] = useState<Shop[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState<boolean>(true)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  // Fetch user's location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ latitude, longitude })
      },
      (err) => {
        console.error(err)
        setError('Failed to get your location')
        setLoading(false)
      }
    )
  }, [])

  // Fetch shops from Firebase
  useEffect(() => {
    const shopsRef = ref(database, 'users')
    onValue(shopsRef, (snapshot) => {
      const usersData: Record<string, UserType> | null = snapshot.val()
      const fetchedShops: Shop[] = []

      if (usersData) {
        Object.entries(usersData).forEach(([userUid, user]) => {
          if (user.shop) {
            const shopNumber = user.shop.shopNumber
            const shopLat = user.shop.latitude
            const shopLon = user.shop.longitude
            const profileImage = user.profileImage || '/placeholder.svg'

            let distance: number | undefined = undefined
            if (userLocation) {
              distance = getDistanceFromLatLonInKm(
                userLocation.latitude,
                userLocation.longitude,
                shopLat,
                shopLon
              )
            }

            fetchedShops.push({
              id: userUid,
              name: user.shop.shopName, // Use directly without assigning to shopName variable
              photo: profileImage,
              phone: shopNumber,
              latitude: shopLat,
              longitude: shopLon,
              distance,
            })
          }
        })

        // Sort shops by distance if distance is available
        if (userLocation) {
          fetchedShops.sort((a, b) => {
            if (a.distance !== undefined && b.distance !== undefined) {
              return a.distance - b.distance
            }
            return 0
          })
        }

        setShops(fetchedShops)
        setFilteredShops(fetchedShops)
      }
      setLoading(false)
    })
  }, [userLocation])

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase()
    setSearchTerm(term)
    const filtered = shops.filter(shop =>
      shop.name.toLowerCase().includes(term)
    )
    setFilteredShops(filtered)
  }

  const handleOpenMap = (latitude: number, longitude: number, shopName: string) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    window.open(googleMapsUrl, '_blank')
  }

  const handleCardClick = (shopId: string) => {
    router.push(`/shopprofile/${shopId}`)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#000060] text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src={mumbra} alt="Logo" width={200} height={200} />
            <span className="ml-2 text-xl font-bold">Shop Finder</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Display error message if any */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 text-center mb-6">
            {error}
          </div>
        )}

        {/* Search Section */}
        <section className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search shops..."
            className="pl-10 pr-4 py-2 w-full"
            value={searchTerm}
            onChange={handleSearch}
          />
        </section>

        {/* Shops List */}
        <section>
          {filteredShops.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredShops.map(shop => (
                <Card
                  key={shop.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => handleCardClick(shop.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Image
                        src={shop.photo}
                        alt={shop.name}
                        width={80}
                        height={80}
                        className="rounded-full border-2 border-[#000060]"
                      />
                      <div>
                        <h2 className="text-xl font-semibold">{shop.name}</h2>
                        <p className="text-gray-600 flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {shop.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      {shop.distance !== undefined && (
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {formatDistance(shop.distance)}
                        </p>
                      )}
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenMap(shop.latitude, shop.longitude, shop.name)
                        }}
                        className="bg-[#000060] hover:bg-[#000060]/90"
                      >
                        Open on Map
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No shops found.</p>
          )}
        </section>
      </main>
    </div>
  )
}
