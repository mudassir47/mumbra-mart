// components/BottomNav.jsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, ShoppingCart, User } from 'lucide-react';

export function BottomNav() {
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
      <ul className="flex justify-around p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link href={item.href} className="flex flex-col items-center">
                <Icon
                  className={`h-6 w-6 ${
                    isActive ? 'text-[#000050]' : 'text-gray-600'
                  } hover:text-[#000050]`}
                />
                <span
                  className={`text-xs mt-1 ${
                    isActive ? 'text-[#000050]' : 'text-gray-600'
                  }`}
                >
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
