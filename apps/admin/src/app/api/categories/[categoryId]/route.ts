import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, props: { params: Promise<{ categoryId: string }> }) {
   const params = await props.params;
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }
      const { categoryId } = params
      if (!categoryId) {
         return new NextResponse('Category id is required', { status: 400 })
      }

      const category = await prisma.category.findUnique({
         where: { id: categoryId },
         include: { banners: true },
      })
      return NextResponse.json(category)
   } catch (error) {
      console.error('[CATEGORY_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function PATCH(req: Request, props: { params: Promise<{ categoryId: string }> }) {
   const params = await props.params;
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const { categoryId } = params
      if (!categoryId) {
         return new NextResponse('Category id is required', { status: 400 })
      }

      const body = await req.json()
      const { title, description, bannerIds } = body

      if (!title) {
         return new NextResponse('Name is required', { status: 400 })
      }
      if (!description) {
         return new NextResponse('Description is required', { status: 400 })
      }
      if (!Array.isArray(bannerIds) || bannerIds.length === 0) {
         return new NextResponse('At least one Banner ID is required', {
            status: 400,
         })
      }

      const updatedCategory = await prisma.category.update({
         where: { id: categoryId },
         data: {
            title,
            description,
            banners: {
               // replace existing set with the new selection
               set: bannerIds.map((id: string) => ({ id })),
            },
         },
         include: { banners: true },
      })

      return NextResponse.json(updatedCategory)
   } catch (error) {
      console.error('[CATEGORY_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(req: Request, props: { params: Promise<{ categoryId: string }> }) {
   const params = await props.params;
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }
      const { categoryId } = params
      if (!categoryId) {
         return new NextResponse('Category id is required', { status: 400 })
      }

      const deleted = await prisma.category.delete({
         where: { id: categoryId },
      })
      return NextResponse.json(deleted)
   } catch (error) {
      console.error('[CATEGORY_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
