'use client'

import { useEffect, useState } from 'react'

const POPULAR_COLLECTIONS = [
  { name: 'Bored Ape', slug: 'boredapeyachtclub' },
  { name: 'Pudgy Penguins', slug: 'pudgypenguins' },
  { name: 'Azuki', slug: 'azuki' },
  { name: 'Milady', slug: 'milady' },
  { name: 'CloneX', slug: 'clonex' }
]

export default function SearchableNFTGallery() {
  const [nfts, setNfts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('pudgypenguins')
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true)
      const options = {
        method: 'GET',
        headers: { accept: 'application/json', 'x-api-key': '9526dbf19d124970abe0cf8686d98057' }
      }

      try {
        // We use the search query to fetch the specific collection's NFTs
        const res = await fetch(
          `https://api.opensea.io/api/v2/collection/${searchQuery}/nfts?limit=12`, 
          options
        )
        const data = await res.json()
        setNfts(data.nfts || [])
      } catch (err) {
        console.error("Error fetching collection:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchNFTs()
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) setSearchQuery(inputValue.toLowerCase())
  }

  return (
    <div className="min-h-screen bg-[#0f051d] p-4 md:p-8 text-white font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Search Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-6">
            NFT Explorer
          </h1>
          
          <form onSubmit={handleSearch} className="flex max-w-md mx-auto gap-2 mb-4">
            <input 
              type="text"
              placeholder="Enter collection slug (e.g. azuki)"
              className="flex-1 bg-[#1e0a36] border border-purple-900/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 transition"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-lg text-sm font-bold transition">
              Search
            </button>
          </form>

          {/* Popular Chips */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-xs text-purple-400 mr-2 self-center">Popular:</span>
            {POPULAR_COLLECTIONS.map((c) => (
              <button
                key={c.slug}
                onClick={() => setSearchQuery(c.slug)}
                className={`text-[10px] px-3 py-1 rounded-full border transition ${
                  searchQuery === c.slug 
                  ? 'bg-purple-600 border-purple-400 text-white' 
                  : 'border-purple-900 text-purple-300 hover:border-purple-500'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* NFT Grid */}
        {loading ? (
          <div className="text-center py-20 text-purple-400 animate-pulse">Scanning the blockchain...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {nfts.map((nft) => (
              <div 
                key={nft.identifier} 
                className="bg-[#1e0a36] border border-purple-900/30 rounded-lg overflow-hidden hover:scale-[1.02] transition-transform shadow-lg shadow-black/20"
              >
                <div className="aspect-square bg-black/40">
                  <img 
                    src={nft.image_url} 
                    alt={nft.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/200?text=No+Image')}
                  />
                </div>
                <div className="p-2">
                  <p className="text-[10px] text-purple-400 truncate mb-1 uppercase tracking-tighter">
                    {searchQuery.replace('-', ' ')}
                  </p>
                  <h3 className="text-xs font-bold truncate text-gray-100">
                    {nft.name || `#${nft.identifier}`}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
