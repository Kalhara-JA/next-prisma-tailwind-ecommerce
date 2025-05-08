// app/api/products/[productId]/route.ts
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
   req: Request,
   { params }: { params: { productId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const { productId } = params
      if (!productId) {
         return new NextResponse('Product id is required', { status: 400 })
      }

      const product = await prisma.product.findUniqueOrThrow({
         where: { id: productId },
      })

      return NextResponse.json(product)
   } catch (error) {
      console.error('[PRODUCT_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(
   req: Request,
   { params }: { params: { productId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const { productId } = params

      await prisma.product.delete({
         where: { id: productId },
      })

      return NextResponse.json({ message: 'Product deleted' })
   } catch (error) {
      console.error('[PRODUCT_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function PATCH(
   req: Request,
   { params }: { params: { productId: string } }
) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const { productId } = params
      if (!productId) {
         return new NextResponse('Product Id is required', { status: 400 })
      }

      // pull fields directly from the JSON body
      const {
         title,
         images,
         price,
         discount = 0,
         stock = 0,
         categoryId,
         isFeatured = false,
         isAvailable = false,
      } = await req.json()

      const product = await prisma.product.update({
         where: { id: productId },
         data: {
            title,
            images, // string[]
            price,
            discount,
            stock,
            isFeatured,
            isAvailable,
         },
      })

      return NextResponse.json(product)
   } catch (error) {
      console.error('[PRODUCT_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
