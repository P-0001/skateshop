import { notFound, redirect } from "next/navigation"
import { db } from "@/db"
import { stores } from "@/db/schema"
import { currentUser } from "@clerk/nextjs"
import { eq } from "drizzle-orm"

import { Header } from "@/components/header"
import { StorePager } from "@/components/pagers/store-pager"
import { Shell } from "@/components/shell"
import { StoreTabs } from "@/components/store-tabs"

interface StoreLayoutProps {
  children: React.ReactNode
  params: {
    storeId: string
  }
}

export default async function StoreLayout({
  children,
  params,
}: StoreLayoutProps) {
  const storeId = Number(params.storeId)

  const user = await currentUser()

  if (!user) {
    redirect("/signin")
  }

  const allStores = await db
    .select({
      id: stores.id,
      name: stores.name,
    })
    .from(stores)
    .where(eq(stores.userId, user.id))

  const store = allStores.find((store) => store.id === storeId)

  if (!store) {
    notFound()
  }

  return (
    <Shell layout="dashboard">
      <div className="flex items-center space-x-4">
        <Header title={store.name} size="sm" className="flex-1" />
        {allStores.length > 1 ? (
          <StorePager storeId={storeId} userId={user.id} />
        ) : null}
      </div>
      <div className="space-y-4 overflow-hidden">
        <StoreTabs storeId={storeId} />
        {children}
      </div>
    </Shell>
  )
}
