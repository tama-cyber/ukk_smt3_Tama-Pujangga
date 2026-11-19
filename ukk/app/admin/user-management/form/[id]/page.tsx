import { Suspense } from 'react'
import { UserForm } from '../user-form' // Sesuaikan path komponen form kamu

type PageProps = {
  params: Promise<{ id: string }>
}

async function UserContent({ params }: PageProps) {
  const { id } = await params
  return <UserForm userId={id} />
}

export default function EditUserPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 font-medium">Memuat form edit...</div>}>
      <UserContent params={params} />
    </Suspense>
  )
}