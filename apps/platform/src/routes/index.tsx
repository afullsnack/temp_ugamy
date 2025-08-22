"use client"

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/signin' })
  },
  component: App,
})

function App() {
  return (
    <div className='relative bg-gray-100 w-full min-h-screen h-fit'>
    </div>
  )
}
