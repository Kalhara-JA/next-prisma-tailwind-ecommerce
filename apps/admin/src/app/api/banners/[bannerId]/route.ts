import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request, props: { params: Promise<{ bannerId: string }> }) {
   const params = await props.params;
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const { bannerId } = params
      if (!bannerId) {
         return new NextResponse('Banner id is required', { status: 400 })
      }

      const banner = await prisma.banner.findUnique({
         where: { id: bannerId },
      })

      return NextResponse.json(banner)
   } catch (error) {
      console.error('[BANNER_GET]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function PATCH(req: Request, props: { params: Promise<{ bannerId: string }> }) {
   const params = await props.params;
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const { bannerId } = params
      if (!bannerId) {
         return new NextResponse('Banner id is required', { status: 400 })
      }

      const body = await req.json()
      const { label, image } = body

      if (!label) {
         return new NextResponse('Label is required', { status: 400 })
      }
      if (!image) {
         return new NextResponse('Image is required', { status: 400 })
      }

      const updatedBanner = await prisma.banner.update({
         where: { id: bannerId },
         data: { label, image },
      })

      return NextResponse.json(updatedBanner)
   } catch (error) {
      console.error('[BANNER_PATCH]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}

export async function DELETE(req: Request, props: { params: Promise<{ bannerId: string }> }) {
   const params = await props.params;
   try {
      const userId = req.headers.get('X-USER-ID')
      if (!userId) {
         return new NextResponse('Unauthorized', { status: 401 })
      }

      const { bannerId } = params
      if (!bannerId) {
         return new NextResponse('Banner id is required', { status: 400 })
      }

      const deletedBanner = await prisma.banner.delete({
         where: { id: bannerId },
      })

      return NextResponse.json(deletedBanner)
   } catch (error) {
      console.error('[BANNER_DELETE]', error)
      return new NextResponse('Internal error', { status: 500 })
   }
}
