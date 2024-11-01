'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Download, Share2, Printer } from 'lucide-react';
import { auth, database } from '@/firebase';
import { ref, get } from 'firebase/database';
import QRCode from 'react-qr-code'; 
import html2canvas from 'html2canvas';
import mumbra from "@/img/Mumbra.png";

interface UserData {
  name: string;
  profileImage: string;
  phoneNumber: string;
  shop?: {
    shopName: string;
  };
}

export function QrCodeDownload() {
  const [userData, setUserData] = useState<UserData | null>(null); 
  const [loading, setLoading] = useState<boolean>(true);
  const cardRef = useRef<HTMLDivElement | null>(null); // Reference for the entire card

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserData(snapshot.val() as UserData);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleDownload = async () => {
    if (cardRef.current) {
      const canvas = await html2canvas(cardRef.current);
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'user-profile-qr-code.png'; // Name of the downloaded file
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share && userData) {
      const qrCodeUrl = `https://mumbra-mart.vercel.app/shopprofile/${auth.currentUser?.uid}`;
      navigator.share({
        title: `Check out ${userData.name}'s Profile!`,
        url: qrCodeUrl,
      })
      .catch((error) => console.error('Error sharing:', error));
    } else {
      alert("Share feature is not supported in this browser.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!userData) {
    return <div className="flex items-center justify-center min-h-screen">User data not found.</div>;
  }

  const qrCodeUrl = `https://mumbra-mart.vercel.app/shopprofile/${auth.currentUser?.uid}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col">
      <header className="bg-[#000060] text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Image
            src={mumbra}
            alt="Mumbra Mart Logo"
            width={220}
            height={120}
          />
          <h1 className="text-2xl font-bold">QR Code Profile</h1>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div ref={cardRef} className="bg-white shadow-xl rounded-xl overflow-hidden mb-6 card-to-print">
            <CardContent className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <Image
                    src={userData.profileImage}
                    alt={userData.name}
                    width={100}
                    height={100}
                    className="rounded-full border-4 border-[#000060]"
                  />
                </div>
                <h2 className="text-2xl font-bold mt-4">{userData.name}</h2>
                <p className="text-gray-600">{userData.phoneNumber}</p>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <QRCode
                  value={qrCodeUrl}
                  size={300}
                  style={{ width: '100%' }}
                />
              </div>
            </CardContent>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" className="flex-1" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>

          <Button 
            className="w-full bg-[#000060] hover:bg-[#000060]/90 text-lg py-6"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-6 w-6" />
            Download Profile with QR Code
          </Button>
        </div>
      </main>
      
      <footer className="bg-[#000060] text-white py-4 text-center">
        <p className="text-sm">Powered by Tech Vide</p>
      </footer>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .card-to-print, .card-to-print * {
            visibility: visible;
          }
          .card-to-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
