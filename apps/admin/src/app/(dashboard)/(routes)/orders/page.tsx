import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'
import { format } from 'date-fns'
import type { Prisma } from '@prisma/client'

import { SortBy } from './components/options'
import type { OrderColumn } from './components/table'
import { OrderTable } from './components/table'

interface OrdersPageProps {
   searchParams: Promise<{
      userId?: string
      sort?: string
      isPaid?: string
      category?: string
      page?: string
      minPayable?: string
      maxPayable?: string
   }>
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
   const {
      userId,
      sort,
      isPaid,
      category,
      page = '1',
      minPayable,
      maxPayable,
   } = await searchParams

   const orderBy = getOrderBy(sort)

   // Build where clause dynamically
   const where: any = {}

   if (userId) where.userId = userId
   if (isPaid !== undefined) where.isPaid = isPaid === 'true'
   if (minPayable || maxPayable) {
      where.payable = {}
      if (minPayable) where.payable.gte = Number(minPayable)
      if (maxPayable) where.payable.lte = Number(maxPayable)
   }
   if (category) {
      where.orderItems = {
         some: {
            product: {
               categories: {
                  some: {
                     title: {
                        contains: category,
                        mode: 'insensitive',
                     },
                  },
               },
            },
         },
      }
   }

   const pageNumber = Number(page) || 1

   const orders = await prisma.order.findMany({
      where,
      include: {
         orderItems: {
            include: {
               product: true,
            },
         },
      },
      skip: (pageNumber - 1) * 12,
      take: 12,
      orderBy,
   })

   const formattedOrders: OrderColumn[] = orders.map((order) => ({
      id: order.id,
      number: `Order #${order.number}`,
      date: format(order.createdAt, 'MMMM do, yyyy'),
      payable: '$' + order.payable.toString(),
      isPaid: order.isPaid,
      createdAt: format(order.createdAt, 'MMMM do, yyyy'),
   }))

   return (
      <div className="block space-y-4 my-6">
         <Heading
            title={`Orders (${orders.length})`}
            description="Manage orders for your store"
         />
         <Separator />
         <div className="grid grid-cols-4 gap-2">
            <SortBy initialData={'highest_payable'} />
         </div>
         <OrderTable data={formattedOrders} />
      </div>
   )
}

function getOrderBy(sort?: string): Prisma.OrderOrderByWithRelationInput {
   switch (sort) {
      case 'highest_payable':
         return { payable: 'desc' }
      case 'lowest_payable':
         return { payable: 'asc' }
      default:
         return { createdAt: 'desc' }
   }
}
