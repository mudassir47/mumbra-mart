// app/page.tsx

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Truck,
  Shield,
  HandMetal,
  Store,
  ChevronLeft,
  ChevronRight,
  Zap,
  Coffee,
  Shirt,
} from 'lucide-react'; // Removed unused imports
import mumbra from '@/img/Mumbra.png';
import m1 from '@/img/1.png';
import { database } from '@/firebase';
import { ref, onValue } from 'firebase/database';

// Define the Product and UserType interfaces here
interface Product {
  id: string; // Firebase push key
  heading: string;
  imageURL?: string;
  price: number;
  category: string;
  description?: string;
  ownerUid: string; // UID of the user who owns the product
}

interface UserType {
  products?: Record<string, Product>;
  product?: Record<string, Product>;
}

const benefits = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Get your products delivered quickly and efficiently',
  },
  {
    icon: Shield,
    title: '100% Transparency',
    description: 'Clear and honest information about our products and services',
  },
  {
    icon: HandMetal,
    title: 'Hand-to-Hand Transfer',
    description: 'Secure and personal delivery right to your hands',
  },
  {
    icon: Store,
    title: 'Connect with Nearby Shops',
    description: 'Support local businesses and get products from shops near you',
  },
];

const carouselItems = [
  {
    id: 1,
    heading: 'New Electronics',
    icon: Zap,
    paragraph: 'Discover the latest gadgets and tech accessories',
    image: m1,
  },
  {
    id: 2,
    heading: 'Coffee Lovers',
    icon: Coffee,
    paragraph: 'Explore our premium coffee selection',
    image: m1,
  },
  {
    id: 3,
    heading: 'Fashion Forward',
    icon: Shirt,
    paragraph: 'Stay trendy with our latest clothing collection',
    image: m1,
  },
];

export default function Pages() {
  const router = useRouter(); // Initialize the router inside the Pages component
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]); // Use Product[]
  const [loading, setLoading] = useState<boolean>(true); // Specify boolean

  useEffect(() => {
    const productsRef = ref(database, 'users');
    onValue(productsRef, (snapshot) => {
      const usersData: Record<string, UserType> | null = snapshot.val();
      const allProducts: Product[] = [];
      if (usersData) {
        Object.entries(usersData).forEach(([userUid, user]) => {
          if (user.products) {
            Object.entries(user.products).forEach(([productId, product]) => {
              allProducts.push({ ...product, id: productId, ownerUid: userUid });
            });
          }
          if (user.product) {
            Object.entries(user.product).forEach(([productId, product]) => {
              allProducts.push({ ...product, id: productId, ownerUid: userUid });
            });
          }
        });
      }
      setProducts(allProducts);
      setLoading(false);
    });
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="md:hidden flex justify-center items-center p-1 bg-white shadow-sm">
        <Link href="/" className="flex items-center">
          <Image src={mumbra} alt="Mumbra Logo" width={250} height={200} className="mr-2" />
        </Link>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex justify-between items-center p-4 bg-white shadow-sm">
        <Link href="/" className="text-2xl font-bold text-[#000050] flex items-center">
          <Image src={mumbra} alt="Mumbra Logo" width={250} height={200} className="mr-2" />
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="text-gray-600 hover:text-[#000050]">
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" className="text-gray-600 hover:text-[#000050]">
                Products
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-gray-600 hover:text-[#000050]">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-600 hover:text-[#000050]">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="flex-grow pt-1 md:pt-0 pb-16 md:pb-0">
        {/* Carousel Section */}
        <section className="relative bg-[#000050] text-white" aria-label="Brand Promotions">
          <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
            {carouselItems.map((item, index) => (
              <div
                key={item.id}
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ zIndex: index === currentSlide ? 1 : 0 }}
              >
                <Image
                  src={item.image}
                  alt={item.heading}
                  layout="fill"
                  objectFit="cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center px-4">
                    <item.icon className="w-12 h-12 mx-auto mb-4" />
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">{item.heading}</h2>
                    <p className="text-lg md:text-xl mb-4">{item.paragraph}</p>
                    <Button
                      size="lg"
                      variant="secondary"
                      className="bg-white text-[#000050] hover:bg-gray-100"
                    >
                      Shop Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 text-[#000050] hover:bg-opacity-75 focus:outline-none"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 text-[#000050] hover:bg-opacity-75 focus:outline-none"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Products Tabs */}
        <Tabs defaultValue="all" className="w-full mt-8 px-4">
          <TabsList className="w-full justify-start mb-4 overflow-x-auto">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-[#000050] data-[state=active]:text-white"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="Electronics"
              className="data-[state=active]:bg-[#000050] data-[state=active]:text-white"
            >
              Electronics
            </TabsTrigger>
            <TabsTrigger
              value="Sports"
              className="data-[state=active]:bg-[#000050] data-[state=active]:text-white"
            >
              Sports
            </TabsTrigger>
            <TabsTrigger
              value="Home"
              className="data-[state=active]:bg-[#000050] data-[state=active]:text-white"
            >
              Home
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <Image
                      src={product.imageURL || m1}
                      alt={product.heading}
                      width={200}
                      height={200}
                      className="w-full h-32 object-cover mb-4 rounded"
                    />
                    <h3 className="font-semibold text-lg mb-2">{product.heading}</h3>
                    <p className="text-[#000050] font-bold">${product.price.toFixed(2)}</p>
                    <Button
                      className="w-full mt-4 bg-[#000050] hover:bg-[#000080]"
                      onClick={() => router.push(`/addtocart/${product.ownerUid}/${product.id}`)}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          {/* Repeat for other TabsContent (Electronics, Sports, Home) */}
          {['Electronics', 'Sports', 'Home'].map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products
                  .filter((p) => p.category === category)
                  .map((product) => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        <Image
                          src={product.imageURL || m1}
                          alt={product.heading}
                          width={200}
                          height={200}
                          className="w-full h-48 object-cover mb-4 rounded"
                        />
                        <h3 className="font-semibold text-lg mb-2">{product.heading}</h3>
                        <p className="text-[#000050] font-bold">${product.price.toFixed(2)}</p>
                        <Button
                          className="w-full mt-4 bg-[#000050] hover:bg-[#000080]"
                          onClick={() => router.push(`/addtocart/${product.ownerUid}/${product.id}`)}
                        >
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Benefits Section */}
        <section className="mt-16 px-4 py-8 bg-white">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#000050]">Our Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index}>
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
    </div>
  );
}
