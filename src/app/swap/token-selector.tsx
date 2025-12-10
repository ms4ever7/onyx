// components/TokenSelector.tsx
'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, Loader2, Star } from 'lucide-react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Token } from '@/lib/utils/token'
import { resolveLogo } from '@/lib/api/token-list'

interface TokenSelectorProps {
  token: Token | null
  onSelect: (token: Token) => void
  tokens: Token[]
  popularTokens?: Token[]
  isLoading: boolean
}

function TokenSelector({ 
  token, 
  onSelect, 
  tokens, 
  popularTokens = [],
  isLoading 
}: TokenSelectorProps) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filteredTokens = useMemo(() => {
    if (!search) return tokens.slice(0, 50)
    
    const query = search.toLowerCase()
    return tokens.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.symbol.toLowerCase().includes(query) ||
        (t.address !== 'NATIVE' && t.address.toLowerCase().includes(query))
    )
  }, [tokens, search])

  const displayTokens = search ? filteredTokens : popularTokens.length > 0 ? popularTokens : filteredTokens

  const getImageEl = (src: string, token: Token) => {
    const isIpfs = src.includes("ipfs");

    return isIpfs ? (
      <img
        src={resolveLogo(src)}
        alt={token.symbol}
        width={32}
        height={32}
        className="rounded-full"
      />
    ) : (
      <Image
        src={src}
        alt={token.symbol}
        width={32}
        height={32}
        className="rounded-full"
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-16 px-4 min-w-[140px]">
          {token ? (
            <div className="flex items-center gap-2">
              {token.logo && getImageEl(token.logo, token)}
              <span className="font-semibold">{token.symbol.toUpperCase()}</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Select token</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
          <DialogDescription>
            Search by name, symbol, or paste address
          </DialogDescription>
        </DialogHeader>
        
        <Input
          placeholder="Search tokens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />

        {!search && popularTokens.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Star className="h-3 w-3" />
            <span>Popular tokens</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {displayTokens.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No tokens found
              </div>
            ) : (
              displayTokens.map((t) => (
                <button
                  key={t.address}
                  onClick={() => {
                    onSelect(t)
                    setOpen(false)
                    setSearch('')
                  }}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {t.logo && getImageEl(t.logo, t)}
                    <div className="text-left">
                      <div className="font-medium flex items-center gap-2">
                        {t.name}
                        {t.isNative && (
                          <span className="text-xs bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded">
                            Native
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t.symbol.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  {t.current_price && (
                    <div className="text-right">
                      <div className="font-medium text-sm">
                        ${t.current_price.toFixed(2)}
                      </div>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          {search 
            ? `${filteredTokens.length} tokens found`
            : `${tokens.length} tokens available`
          }
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TokenSelector