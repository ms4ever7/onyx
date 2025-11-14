import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const BINANCE_BASE_URL = 'https://api.binance.com/api/v3'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const searchParams = request.nextUrl.searchParams
    
    // Build query string
    const queryParams = new URLSearchParams()
    searchParams.forEach((value, key) => {
      queryParams.append(key, value)
    })

    const url = `${BINANCE_BASE_URL}/${path}?${queryParams.toString()}`
    
    console.log('Proxying to Binance:', url)
    
    const response = await axios.get(url)
    
    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('Binance API Error:', error.response?.data || error.message)
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    )
  }
}