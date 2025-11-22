'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Search, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();
  
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEEEEC] via-[#FFCBD8]/20 to-[#EEEEEC] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFCBD8] via-[#FFCBD8]/80 to-[#FFCBD8]/60 animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 text-9xl font-bold text-neutral-200 blur-2xl -z-10">
            404
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-neutral-600 max-w-md mx-auto">
            The page you're looking for seems to have wandered off. Don't worry, 
            let's get you back on track!
          </p>
        </div>

        {/* Illustration/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <ShoppingBag className="size-32 text-neutral-300" />
            <div className="absolute -top-2 -right-2">
              <div className="size-8 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">?</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="size-5" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/search">
              <Search className="size-5" />
              Search Products
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="lg" 
            className="gap-2"
            onClick={handleGoBack}
          >
            <ArrowLeft className="size-5" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <p className="text-sm text-neutral-500 mb-4">You might be looking for:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link 
              href="/" 
              className="text-sm text-[#FFCBD8] hover:text-[#FFCBD8]/80 hover:underline transition-colors"
            >
              Home
            </Link>
            <span className="text-neutral-300">•</span>
            <Link 
              href="/search" 
              className="text-sm text-[#FFCBD8] hover:text-[#FFCBD8]/80 hover:underline transition-colors"
            >
              Search
            </Link>
            <span className="text-neutral-300">•</span>
            <Link 
              href="/cart" 
              className="text-sm text-[#FFCBD8] hover:text-[#FFCBD8]/80 hover:underline transition-colors"
            >
              Cart
            </Link>
            <span className="text-neutral-300">•</span>
            <Link 
              href="/login" 
              className="text-sm text-[#FFCBD8] hover:text-[#FFCBD8]/80 hover:underline transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
