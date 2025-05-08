import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
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

      const category = await prisma.category.create({
         data: {
            title,
            description,
            banners: {
               connect: bannerIds.map((id: string) => ({ id })),
            },
         },
         include: { banners: true },
      })

      return NextResponse.json(category)
   } catch (error) {
      console.error('[CATEGORIES_POST]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function GET(req: Request) {
   try {
      const categories = await prisma.category.findMany({
         include: { banners: true },
      })
      return NextResponse.json(categories)
   } catch (error) {
      console.error('[CATEGORIES_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
