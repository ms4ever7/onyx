'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, Loader2 } from 'lucide-react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Token {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
}

function TokenSelector({
  token,
  onSelect,
  tokens,
  isLoading,
}: {
  token: Token | null
  onSelect: (token: Token) => void
  tokens: Token[]
  isLoading: boolean
}) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filteredTokens = useMemo(() => {
    if (!search) return tokens.slice(0, 20)
    const query = search.toLowerCase()
    return tokens.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.symbol.toLowerCase().includes(query)
    )
  }, [tokens, search])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-16 px-4 min-w-[140px]">
          {token ? (
            <div className="flex items-center gap-2">
              <Image
                src={token.image}
                alt={token.name}
                width={24}
                height={24}
                className="rounded-full"
              />
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
            Search by name or symbol
          </DialogDescription>
        </DialogHeader>
        
        <Input
          placeholder="Search tokens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {filteredTokens.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  onSelect(t)
                  setOpen(false)
                  setSearch('')
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="text-left">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {t.symbol.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${t.current_price.toFixed(2)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default TokenSelector;