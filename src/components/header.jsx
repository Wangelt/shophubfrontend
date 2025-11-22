"use client"
import { Search, ShoppingCart, User, User2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from './ui/button'
import Searchbox from './Searchbox'
import { useRouter } from 'next/navigation'
import { logout } from '@/services/authservices'
import { useSelector } from 'react-redux'
import { getGuestCartTotalItems } from '@/utils/guestCart'   
const Header = () => {
  const [mounted, setMounted] = useState(false)
  const isLoggedIn = useSelector(state => state.auth.isAuthenticated)
  const User = useSelector(state => state.auth.user)
  const cartTotalItems = useSelector(state => state.cart.totalItems)
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const [guestCartCount, setGuestCartCount] = useState(0)

  // Prevent hydration mismatch by only rendering client-specific content after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update guest cart count when not logged in
  useEffect(() => {
    if (!isLoggedIn && mounted) {
      const updateGuestCount = () => {
        setGuestCartCount(getGuestCartTotalItems())
      }
      updateGuestCount()
      // Update on storage changes (when cart is modified in another tab)
      window.addEventListener('storage', updateGuestCount)
      // Poll for changes (since same-tab changes don't trigger storage event)
      const interval = setInterval(updateGuestCount, 1000)
      return () => {
        window.removeEventListener('storage', updateGuestCount)
        clearInterval(interval)
      }
    } else {
      setGuestCartCount(0)
    }
  }, [isLoggedIn, mounted])

  // Ensure consistent rendering - use mounted state to prevent hydration mismatch
  const showCartButton = mounted // Always show cart button
  const showUserMenu = mounted && isLoggedIn
  const showLoginButton = mounted && !isLoggedIn
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }
  const handleLogin = () => {
    router.push('/login')
  }
  const handleNavigate = (path) => {
    setIsMenuOpen(false)
    router.push(path)
  }
    return (
      <div className='px-5 sticky top-5 z-50 h-30'>
         <header className='sticky top-5 z-50 w-full bg-gradient-to-r py-2 rounded-sm from-[#EEEEEC] to-[#FFCBD8]  shadow-sm'>
      <div className='flex items-center justify-between pr-4'>
         <Link href="/" className="flex items-center gap-2 px-4 py-2 hover:opacity-80 transition-opacity">
           <div className="relative">
             <Sparkles className="size-8 text-pink-600" />
             <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-sm opacity-50"></div>
           </div>
           <div className="flex flex-col">
             <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
               ShopHub
             </span>
             <span className="text-xs text-neutral-600 -mt-1">Premium Shopping</span>
           </div>
         </Link>
          <div className='max-w-1/3 w-full'>
          <Searchbox/>
           </div>
          
         
       <div className='flex items-center gap-5'>
         {/* Cart button - always render structure, hide/show based on state */}
         <div className='relative inline-flex items-center justify-center' suppressHydrationWarning>
           {showCartButton ? (
             <button
               onClick={() => handleNavigate('/cart')}
               className='relative inline-flex items-center justify-center rounded-md border border-transparent p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/20'
               aria-label='Shopping Cart'
             >
               <ShoppingCart className='size-6'/>
               <span className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white'>
                 {isLoggedIn 
                   ? (cartTotalItems > 99 ? '99+' : (cartTotalItems || 0))
                   : (guestCartCount > 99 ? '99+' : (guestCartCount || 0))
                 }
               </span>
             </button>
           ) : (
             <div className='h-8 w-8' aria-hidden='true' />
           )}
         </div>
         
         {/* User menu or Login button - always render structure */}
         <div suppressHydrationWarning>
           {showUserMenu ? (
           <div className='relative flex items-center' ref={menuRef} onClick={() => setIsMenuOpen((v) => !v)}>
             <button
               type='button'
               aria-haspopup='menu'
               aria-expanded={isMenuOpen}
               className='inline-flex items-center justify-center rounded-md border border-transparent p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/20'
             >
               <User2/>
             </button>
             {isMenuOpen && (
               <div
                 role='menu'
                 className='absolute right-0 mt-60 w-44 origin-top-right rounded-md border border-gray-200 bg-white shadow-md focus:outline-none z-50'
               >
                 <button
                   className='w-full px-3 py-2 text-left text-sm hover:bg-gray-100'
                   onClick={() => handleNavigate('/profile')}
                   role='menuitem'
                 >
                   Profile
                 </button>
                 <button
                   className='w-full px-3 py-2 text-left text-sm hover:bg-gray-100'
                   onClick={() => handleNavigate('/addresses')}
                   role='menuitem'
                 >
                   Addresses
                 </button>
                 <button
                   className='w-full px-3 py-2 text-left text-sm hover:bg-gray-100'
                   onClick={() => handleNavigate('/orders')}
                   role='menuitem'
                 >
                   Orders
                 </button>
                 <div className='my-1 h-px bg-gray-200' />
                 <button
                   className='w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100'
                   onClick={handleLogout}
                   role='menuitem'
                 >
                   Logout
                 </button>
               </div>
             )}
             <p className='ml-2'>{User?.name}</p>
           </div>
           ) : showLoginButton ? (
             <Button variant="outline" onClick={handleLogin} className='bg-black text-white'>Login</Button>
           ) : (
             <div className='h-10 w-20' aria-hidden='true' />
           )}
         </div>
       </div>
      </div>
    </header>
      </div>
  )
}

export default Header