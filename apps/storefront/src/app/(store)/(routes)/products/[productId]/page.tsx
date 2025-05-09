import Carousel from '@/components/native/Carousel'
import prisma from '@/lib/prisma'
import { isVariableValid } from '@/lib/utils'
import { ChevronRightIcon } from 'lucide-react'
import type { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'

import { DataSection } from './components/data'

type Props = {
   params: Promise<{ productId: string }>
   searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
   const params = await props.params;
   const product = await prisma.product.findUnique({
      where: {
         id: params.productId,
      },
   })

   return {
      title: product.title,
      description: product.description,
      keywords: product.keywords,
      openGraph: {
         images: product.images,
      },
   }
}

export default async function Product(
   props: {
      params: Promise<{ productId: string }>
   }
) {
   const params = await props.params;
   const product = await prisma.product.findUnique({
      where: {
         id: params.productId,
      },
      include: {
         categories: true,
      },
   })

   if (isVariableValid(product)) {
      return (
         <>
            <Breadcrumbs product={product} />
            <div className="mt-6 grid grid-cols-1 gap-2 md:grid-cols-3">
               <ImageColumn product={product} />
               <DataSection product={product} />
            </div>
         </>
      )
   }
}

const ImageColumn = ({ product }) => {
   return (
      <div className="relative min-h-[50vh] w-full col-span-1">
         <Carousel images={product?.images} />
      </div>
   )
}

const Breadcrumbs = ({ product }) => {
   return (
      <nav className="flex text-muted-foreground" aria-label="Breadcrumb">
         <ol className="inline-flex items-center gap-2">
            <li className="inline-flex items-center">
               <Link
                  href="/"
                  className="inline-flex items-center text-sm font-medium"
               >
                  Home
               </Link>
            </li>
            <li>
               <div className="flex items-center gap-2">
                  <ChevronRightIcon className="h-4" />
                  <Link className="text-sm font-medium" href="/products">
                     Products
                  </Link>
               </div>
            </li>
            <li aria-current="page">
               <div className="flex items-center gap-2">
                  <ChevronRightIcon className="h-4" />
                  <span className="text-sm font-medium">{product?.title}</span>
               </div>
            </li>
         </ol>
      </nav>
   )
}
