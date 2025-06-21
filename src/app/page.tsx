'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

const page = () => {

  const router = useRouter()
  return (
    <div className='flex flex-col'>
      <button onClick={() => router.push("/login")}>test</button>
      <button onClick={() => router.push("/product/collections")}>test</button>
    </div>
  );
}

export default page
