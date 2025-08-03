'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EnhancedTest from '@/pages/EnhancedTest'

export default function TestPage() {
  const router = useRouter()
  
  return <EnhancedTest />
}