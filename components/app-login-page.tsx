// components/Login.tsx

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { auth, provider, signInWithPopup, database, ref, get, set, update } from '../firebase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import mumbra from "@/img/2.png"

// Define a User type to avoid using `any`
interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export function Login() {
  const [email, setEmail] = useState<string>('') // Specify type as string
  const [phone, setPhone] = useState<string>('') // Specify type as string
  const [isNewUser, setIsNewUser] = useState<boolean>(false) // Specify type as boolean
  const [currentUser, setCurrentUser] = useState<User | null>(null) // Specify type as User | null
  const [loading, setLoading] = useState<boolean>(false) // Specify type as boolean
  const [error, setError] = useState<string | null>(null) // Specify type as string | null
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user as User; // Specify type as User
      setCurrentUser(user)

      const userRef = ref(database, `users/${user.uid}`)
      const snapshot = await get(userRef)

      if (snapshot.exists()) {
        // User exists, redirect to home
        router.push('/')
      } else {
        // New user, save initial data including location
        const location = await getCurrentLocation()
        await set(userRef, {
          name: user.displayName,
          email: user.email,
          profileImage: user.photoURL,
          latitude: location?.latitude,
          longitude: location?.longitude,
        })
        setIsNewUser(true)
      }
    } catch (error) {
      console.error('Error during Google login:', error)
      setError('Failed to sign in with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    return new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            })
          },
          (error) => {
            console.error('Error getting location:', error)
            resolve(null) // In case of error, resolve with null
          }
        )
      } else {
        console.error('Geolocation is not supported by this browser.')
        resolve(null)
      }
    })
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement email submission logic here
    console.log('Email submitted:', email)
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentUser) {
      const phoneRegex = /^(\d{3}-\d{3}-\d{4}|\d{10})$/;
      if (!phoneRegex.test(phone)) {
        setError('Please enter a valid phone number (e.g., 123-456-7890 or 1234567890).')
        return
      }

      setLoading(true)
      setError(null)
      try {
        const userRef = ref(database, `users/${currentUser.uid}`)
        await update(userRef, {
          phoneNumber: phone,
        })
        router.push('/')
      } catch (error) {
        console.error('Error saving phone number:', error)
        setError('Failed to save phone number. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  if (isNewUser && currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000050] p-4">
        <Card className="w-full max-w-sm"> {/* Adjusted width and height */}
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-center">Welcome, {currentUser.displayName}</CardTitle>
            <CardDescription className="text-center">
              Please enter your phone number to complete registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePhoneSubmit}>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="123-456-7890 or 1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000050] p-4">
      <Card className="w-full max-w-sm"> {/* Adjusted width and height */}
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Image
              src={mumbra} // Use the imported mumbra image here
              alt="Mumbra Logo"
              width={200} // Adjusted size
              height={150} // Adjusted size
            />
          </div>
          <CardTitle className="text-xl font-bold text-center">Welcome to MUMBRA MART</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full bg-white text-black hover:bg-gray-100 transition-colors flex items-center justify-center"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <form onSubmit={handleEmailSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? 'Submitting...' : 'Sign In with Email'}
            </Button>
          </form>
          {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-gray-600 mt-2">
            By signing in, you agree to our{' '}
            <a href="#" className="text-[#000050] hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-[#000050] hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
