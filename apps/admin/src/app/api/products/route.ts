// app/api/products/route.ts
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      // parse all form fields directly
      const {
         title,
         images,
         price,
         discount,
         stock,
         categoryIds,
         isFeatured,
         isAvailable,
         description,
         keywords,
         metadata,
      } = await req.json()

      if (!title || !Array.isArray(categoryIds) || categoryIds.length === 0) {
         return new NextResponse('Missing title or categories', { status: 400 })
      }

      // actually create the product
      const product = await prisma.product.create({
         data: {
            title,
            images,
            price,
            discount,
            stock,
            categories: {
               connect: categoryIds.map((id: string) => ({ id })),
            },
            isFeatured,
            isAvailable,
            description,
            keywords,
            metadata,
         },
      })

      return NextResponse.json(product)
   } catch (error) {
      console.error('[PRODUCTS_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function GET(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const { searchParams } = new URL(req.url)
      const categoryId = searchParams.get('categoryId') || undefined
      const isFeaturedParam = searchParams.get('isFeatured')

      // build a dynamic where object
      const where: any = {}
      if (categoryId) where.categoryId = categoryId
      if (isFeaturedParam !== null) {
         where.isFeatured = isFeaturedParam === 'true'
      }

      const products = await prisma.product.findMany({
         where,
         orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json(products)
   } catch (error) {
      console.error('[PRODUCTS_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
