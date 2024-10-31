'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, database, storage } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import { ref as dbRef, push, set } from 'firebase/database';
import { ref as storageRef, getDownloadURL, uploadBytes } from 'firebase/storage';
import { User as FirebaseUser } from 'firebase/auth'; // Import User type from Firebase

// Define types for your product


export default function ShopAdmin() {
  const [user, setUser] = useState<FirebaseUser | null>(null); // Use FirebaseUser type
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
  const [imageURL, setImageURL] = useState<string>(''); // For URL input

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login'); // Redirect to login if not authenticated
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

    if (!heading || !description || !price || !category) {
      setError('Please fill in all fields.');
      return;
    }

    let imageURLToSave = '';

    if (imageOption === 'upload' && !image) {
      setError('Please upload an image.');
      return;
    }

    if (imageOption === 'url' && !imageURL) {
      setError('Please enter a valid image URL.');
      return;
    }

    try {
      if (imageOption === 'upload') {
        const storageRefPath = `products/${user!.uid}/${Date.now()}_${image!.name}`; // Use non-null assertion
        const imageRef = storageRef(storage, storageRefPath);
        const snapshot = await uploadBytes(imageRef, image!);
        imageURLToSave = await getDownloadURL(snapshot.ref);
      } else if (imageOption === 'url') {
        imageURLToSave = imageURL;
      }

      const productsRef = dbRef(database, `users/${user!.uid}/products`); // Use non-null assertion
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
      setImageURL(''); // Clear input URL
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product. Please try again.');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Add New Product</CardTitle>
          <CardDescription className="text-center">Upload a new product to your store</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heading">Product Name</Label>
              <Input
                id="heading"
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Wireless Earbuds"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product here..."
                className="w-full p-2 border border-gray-300 rounded"
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
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="Electronics">Electronics</option>
                <option value="Sports">Sports</option>
                <option value="Home">Home</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageOption">Image Option</Label>
              <select
                id="imageOption"
                value={imageOption}
                onChange={(e) => setImageOption(e.target.value as 'upload' | 'url')}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="upload">Upload Image</option>
                <option value="url">Enter Image URL</option>
              </select>
            </div>
            {imageOption === 'upload' && (
              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
                {imagePreview && (
                  <div className="mt-2">
                    <Image src={imagePreview} alt="Image Preview" width={200} height={200} className="object-cover rounded" />
                  </div>
                )}
              </div>
            )}
            {imageOption === 'url' && (
              <div className="space-y-2">
                <Label htmlFor="imageURL">Image URL</Label>
                <Input
                  id="imageURL"
                  type="text"
                  value={imageURL || ''}
                  onChange={(e) => setImageURL(e.target.value)}
                  placeholder="Enter image URL here..."
                  required
                />
                {imageURL && (
                  <div className="mt-2">
                    <Image src={imageURL} alt="Selected Image" width={200} height={200} className="object-cover rounded" />
                  </div>
                )}
              </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <Button type="submit" className="w-full bg-[#000050] hover:bg-[#000080]">
              Add Product
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
