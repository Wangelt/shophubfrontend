"use client"
import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { TypeAnimation } from 'react-type-animation'

const Searchbox = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&page=1`)
      setSearchQuery('')
    }
  }

  const handleClick = () => {
    if (pathname !== '/search') {
      router.push('/search')
    }
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className='flex items-center gap-2 bg-white rounded-full px-3 py-2 w-full cursor-text'
      onClick={handleClick}
    >
      <Search className='text-gray-500 flex-shrink-0' size={18} />
      {!isFocused && !searchQuery ? (
        <TypeAnimation
          sequence={[
            'search Windcheater',
            2000,
            'search Workout Wear',
            2000,
            'search Wool Coat',
            2000,
            'search Wedges',
            2000,
            'search Wedding Dress',
            2000,
            'search Winter Dress',
            2000,
            'search Waistcoat',
            2000,
            'search Wide-Leg Pants',
            2000,
            'search Wrap Dress',
            2000,
            'search Woodland',
            2000,
            'search Wandler',
            2000,
            'search Walkmate',
            2000,
            'search Walk London',
            2000,
          ]}
          wrapper="span"
          speed={50}
          repeat={Infinity}
          className="text-gray-400 text-sm flex-1"
        />
      ) : (
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search for products..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
        />
      )}
    </form>
  )
}

export default Searchbox