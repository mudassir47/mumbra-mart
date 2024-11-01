'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, database, storage } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToastProvider, Toast } from "@/components/ui/toast"; // Adjust the import path as necessary
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { ref as dbRef, push, set } from 'firebase/database';
import { ref as storageRef, getDownloadURL, uploadBytes } from 'firebase/storage';
import { User as FirebaseUser } from 'firebase/auth';

export function ShopAdminComponent() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageOption, setImageOption] = useState<'upload' | 'url'>('upload');
  const [imageURL, setImageURL] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (!heading || !description || !price || !category) {
      setError('Please fill in all fields.');
      setSubmitting(false);
      return;
    }

    let imageURLToSave = '';

    if (imageOption === 'upload' && !image) {
      setError('Please upload an image.');
      setSubmitting(false);
      return;
    }

    if (imageOption === 'url' && !imageURL) {
      setError('Please enter a valid image URL.');
      setSubmitting(false);
      return;
    }

    try {
      if (imageOption === 'upload') {
        const storageRefPath = `products/${user!.uid}/${Date.now()}_${image!.name}`;
        const imageRef = storageRef(storage, storageRefPath);
        const snapshot = await uploadBytes(imageRef, image!);
        imageURLToSave = await getDownloadURL(snapshot.ref);
      } else if (imageOption === 'url') {
        imageURLToSave = imageURL;
      }

      const productsRef = dbRef(database, `users/${user!.uid}/products`);
      const newProductRef = push(productsRef);
      await set(newProductRef, {
        heading,
        description,
        price: parseFloat(price),
        category,
        imageURL: imageURLToSave,
        createdAt: Date.now(),
      });

      setSuccess('Product added successfully!');
      setHeading('');
      setDescription('');
      setPrice('');
      setCategory('Electronics');
      setImage(null);
      setImagePreview(null);
      setImageURL('');
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Shop Admin Dashboard</h1>
          
          {/* Product Preview Card */}
          <Card className="w-full mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Product Preview</CardTitle>
              <CardDescription>See how your product will look in the store</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                {(imagePreview || imageURL) && (
                  <div className="mb-4">
                    <Image
                      src={imagePreview || imageURL}
                      alt="Product Preview"
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{heading || 'Product Name'}</h3>
                <p className="text-gray-600 mb-2">{description || 'Product description will appear here.'}</p>
                <p className="text-lg font-bold text-[#000052] mb-2">${price || '0.00'}</p>
                <p className="text-sm text-gray-500">{category}</p>
              </div>
            </CardContent>
          </Card>

          {/* Product Form */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Add New Product</CardTitle>
                <CardDescription>Fill in the details to add a new product to your store</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="heading">Product Name</Label>
                    <Input
                      id="heading"
                      value={heading}
                      onChange={(e) => setHeading(e.target.value)}
                      placeholder="Wireless Earbuds"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your product here..."
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="79.99"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Home">Home</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Image</Label>
                    <Tabs value={imageOption} onValueChange={(value) => setImageOption(value as 'upload' | 'url')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Upload Image</TabsTrigger>
                        <TabsTrigger value="url">Image URL</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          required={imageOption === 'upload'}
                        />
                      </TabsContent>
                      <TabsContent value="url">
                        <Input
                          id="imageURL"
                          type="text"
                          value={imageURL}
                          onChange={(e) => setImageURL(e.target.value)}
                          placeholder="Enter image URL here..."
                          required={imageOption === 'url'}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  {success && <p className="text-green-500 text-sm">{success}</p>}
                </form>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-[#000052] hover:bg-[#000052]/90"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Product...
                    </>
                  ) : (
                    'Add Product'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        <Toast />
      </div>
    </ToastProvider>
  );
}
