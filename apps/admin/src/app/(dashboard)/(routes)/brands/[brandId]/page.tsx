import prisma from '@/lib/prisma'

import { BrandForm } from './components/brand-form'

const BrandPage = async (props: { params: Promise<{ brandId: string }> }) => {
   const params = await props.params;
   const brand = await prisma.brand.findUnique({
      where: {
         id: params.brandId,
      },
   })

   return (
      <div className="flex-col">
         <div className="flex-1 space-y-4 p-8 pt-6">
            <BrandForm initialData={brand} />
         </div>
      </div>
   )
}

export default BrandPage
