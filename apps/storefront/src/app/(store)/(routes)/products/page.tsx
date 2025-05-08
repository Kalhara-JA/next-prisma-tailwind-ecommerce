import { ProductGrid, ProductSkeletonGrid } from '@/components/native/Product'
import { Heading } from '@/components/native/heading'
import { Separator } from '@/components/native/separator'
import prisma from '@/lib/prisma'
import { isVariableValid } from '@/lib/utils'
import { Prisma } from '@prisma/client'
import type { ProductWithCategories } from '@/components/native/Product'

import {
   AvailableToggle,
   CategoriesCombobox,
   SortBy,
} from './components/options'

interface ProductsPageProps {
  searchParams?: {
    sort?: string
    isAvailable?: string
    category?: string
    page?: string | number
  }
}

export default async function Products(props: ProductsPageProps) {
   const searchParams = props.searchParams ?? {}
   const { sort, isAvailable, category, page = 1 } = searchParams
   const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page

   const orderBy = getOrderBy(sort)

   const categories = await prisma.category.findMany()
   const products = await prisma.product.findMany({
      where: {
         isAvailable: isAvailable === 'true' ? true : undefined,
         categories: category
           ? {
               some: {
                 title: {
                   contains: category,
                   mode: 'insensitive',
                 },
               },
             }
           : undefined,
      },
      orderBy,
      skip: (pageNumber - 1) * 12,
      take: 12,
      include: {
         categories: true,
      },
   })

   return (
      <>
         <Heading
            title="Products"
            description="Below is a list of products you have in your cart."
         />
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
            <SortBy initialData={sort} />
            <CategoriesCombobox
               initialCategory={category}
               categories={categories}
            />
            <AvailableToggle initialData={isAvailable} />
         </div>
         <Separator />
         {isVariableValid(products) ? (
            <ProductGrid products={products as ProductWithCategories[]} />
         ) : (
            <ProductSkeletonGrid />
         )}
      </>
   )
}

type Sort = string | undefined

function getOrderBy(sort: Sort): Prisma.ProductOrderByWithRelationInput {
   switch (sort) {
      case 'featured':
         return {
            orders: {
               _count: 'desc',
            },
         }
      case 'most_expensive':
         return {
            price: 'desc',
         }
      case 'least_expensive':
         return {
            price: 'asc',
         }
      default:
         return {
            orders: {
               _count: 'desc',
            },
         }
   }
}
