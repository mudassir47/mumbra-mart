'use client'

import React, { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from '@/components/BottomNav';
import { CreditCard, ShoppingBag } from 'lucide-react';
import { auth, database } from '@/firebase';
import { ref, get, update } from 'firebase/database';
import { onAuthStateChanged, User } from 'firebase/auth';

interface UserData {
  email: string;
  latitude: number;
  longitude: number;
  name: string;
  phoneNumber: string;
  profileImage: string;
  shop?: {
    shopName: string;
    shopNumber: string;
    latitude: number;
    longitude: number;
  };
}

export function Profile() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasShop, setHasShop] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        setUserId(user.uid);
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data: UserData = snapshot.val();
          setName(data.name || '');
          setEmail(data.email || '');
          setProfileImage(data.profileImage || '');
          setHasShop(!!data.shop);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (userId) {
      const userRef = ref(database, `users/${userId}`);
      await update(userRef, { name, email });
      console.log('Profile updated:', { name, email });
    }
  };

  const handleRegisterShop = () => {
    router.push('/registershop'); // Navigate to /registershop
  };

  const handleGoToShop = () => {
    router.push('/myshop'); // Navigate to /myshop
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16 md:pb-0">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="mb-6 border-t-4 border-t-[#000052]">
          <CardHeader>
            <div className="flex items-center space-x-4">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile Picture"
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-[#000052]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 border-4 border-[#000052]" />
              )}
              <div>
                <CardTitle className="text-2xl font-bold text-[#000052]">{name}</CardTitle>
                <CardDescription>{email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {!hasShop ? (
          <Button 
            onClick={handleRegisterShop} 
            className="mb-6 w-full bg-[#000052] hover:bg-[#000052]/90"
          >
            Register a Shop
          </Button>
        ) : (
          <Button 
            onClick={handleGoToShop} 
            className="mb-6 w-full bg-[#000052] hover:bg-[#000052]/90"
          >
            My Shop
          </Button>
        )}

        <Tabs defaultValue="account" className="space-y-4">
          <TabsList className="bg-white border-b border-gray-200">
            <TabsTrigger value="account" className="data-[state=active]:text-[#000052] data-[state=active]:border-b-2 data-[state=active]:border-[#000052]">
              Account
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:text-[#000052] data-[state=active]:border-b-2 data-[state=active]:border-[#000052]">
              Orders
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:text-[#000052] data-[state=active]:border-b-2 data-[state=active]:border-[#000052]">
              Payments
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:text-[#000052] data-[state=active]:border-b-2 data-[state=active]:border-[#000052]">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#000052]">Account Information</CardTitle>
                <CardDescription>Update your account details here.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-[#000052] focus:ring-[#000052]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-[#000052] focus:ring-[#000052]"
                    />
                  </div>
                  <Button type="submit" className="bg-[#000052] hover:bg-[#000052]/90">
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#000052]">Order History</CardTitle>
                <CardDescription>View your past orders and their status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Replace with real order data */}
                  {[1, 2, 3].map((order) => (
                    <div key={order} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-center space-x-4">
                        <ShoppingBag className="h-10 w-10 text-[#000052]" />
                        <div>
                          <p className="font-semibold">Order #{order.toString().padStart(5, '0')}</p>
                          <p className="text-sm text-gray-500">Placed on {new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button variant="outline" className="border-[#000052] text-[#000052] hover:bg-[#000052] hover:text-white">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#000052]">Payment Methods</CardTitle>
                <CardDescription>Manage your payment options.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Replace with real payment methods */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <CreditCard className="h-10 w-10 text-[#000052]" />
                      <div>
                        <p className="font-semibold">Visa ending in 1234</p>
                        <p className="text-sm text-gray-500">Expires 12/2025</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-[#000052] text-[#000052] hover:bg-[#000052] hover:text-white">
                      Edit
                    </Button>
                  </div>
                  <Button className="w-full bg-[#000052] hover:bg-[#000052]/90">Add New Payment Method</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#000052]">Account Settings</CardTitle>
                <CardDescription>Manage your account preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline" className="border-[#000052] text-[#000052] hover:bg-[#000052] hover:text-white">
                      Enable
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive updates about your orders and promotions</p>
                    </div>
                    <Button variant="outline" className="border-[#000052] text-[#000052] hover:bg-[#000052] hover:text-white">
                      Manage
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Delete Account</Label>
                      <p className="text-sm text-gray-500">Permanently remove your account and all data</p>
                    </div>
                    <Button variant="destructive">Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
}
