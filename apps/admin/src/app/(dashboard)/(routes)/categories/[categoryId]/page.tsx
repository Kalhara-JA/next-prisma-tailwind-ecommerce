import prisma from '@/lib/prisma'

import { CategoryForm } from './components/category-form'

const CategoryPage = async (
   props: {
      params: Promise<{ categoryId: string; id: string }>
   }
) => {
   const params = await props.params;
   const category = await prisma.category.findUnique({
      where: {
         id: params.categoryId,
      },
      include: {
         banners: true,
      },
   })

   const banners = await prisma.banner.findMany({
      where: {
         id: params.id,
      },
   })

   return (
      <div className="flex-col">
         <div className="flex-1 space-y-4 p-8 pt-6">
            <CategoryForm banners={banners} initialData={category} />
         </div>
      </div>
   )
}

export default CategoryPage
