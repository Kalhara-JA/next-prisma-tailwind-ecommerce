'use client'

import { AlertModal } from '@/components/modals/alert-modal'
import { Button } from '@/components/ui/button'
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/components/ui/form'
import { Heading } from '@/components/ui/heading'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { Banner, Category } from '@prisma/client'
import { Trash } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

// import your MultiSelect
import { MultiSelect } from '@/components/ui/multi-select'

// schema expects array of banner IDs
const formSchema = z.object({
   title: z.string().min(2),
   description: z.string().min(1),
   bannerIds: z.string().array().min(1),
})

type CategoryFormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
   initialData: (Category & { banners: Banner[] }) | null
   banners: Banner[]
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
   initialData,
   banners,
}) => {
   const params = useParams()
   const router = useRouter()
   const [open, setOpen] = useState(false)
   const [loading, setLoading] = useState(false)

   const title = initialData ? 'Edit category' : 'Create category'
   const descriptionText = initialData ? 'Edit a category.' : 'Add a new category'
   const toastMessage = initialData ? 'Category updated.' : 'Category created.'
   const action = initialData ? 'Save changes' : 'Create'

   const form = useForm<CategoryFormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
         title: initialData?.title ?? '',
         description: initialData?.description ?? '',
         bannerIds: initialData?.banners.map(b => b.id) ?? [],
      },
   })

   const onSubmit = async (data: CategoryFormValues) => {
      try {
         setLoading(true)
         const url = initialData
            ? `/api/categories/${params.categoryId}`
            : '/api/categories'
         const method = initialData ? 'PATCH' : 'POST'

         await fetch(url, {
            method,
            body: JSON.stringify({
               title: data.title,
               description: data.description,
               bannerIds: data.bannerIds,
            }),
            cache: 'no-store',
         })

         router.refresh()
         router.push('/categories')
         toast.success(toastMessage)
      } catch (error: any) {
         toast.error('Something went wrong.')
      } finally {
         setLoading(false)
      }
   }

   const onDelete = async () => {
      try {
         setLoading(true)
         await fetch(`/api/categories/${params.categoryId}`, {
            method: 'DELETE',
            cache: 'no-store',
         })
         router.refresh()
         router.push('/categories')
         toast.success('Category deleted.')
      } catch (error: any) {
         toast.error(
            'Make sure you removed all products using this category first.'
         )
      } finally {
         setLoading(false)
         setOpen(false)
      }
   }

   // prepare options for MultiSelect
   const bannerOptions = banners.map(b => ({
      label: b.label,
      value: b.id,
   }))

   return (
      <>
         <AlertModal
            isOpen={open}
            onClose={() => setOpen(false)}
            onConfirm={onDelete}
            loading={loading}
         />
         <div className="flex items-center justify-between">
            <Heading title={title} description={descriptionText} />
            {initialData && (
               <Button
                  disabled={loading}
                  variant="destructive"
                  size="sm"
                  onClick={() => setOpen(true)}
               >
                  <Trash className="h-4" />
               </Button>
            )}
         </div>
         <Separator />
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
               <div className="md:grid md:grid-cols-3 gap-8">
                  <FormField
                     control={form.control}
                     name="title"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Name</FormLabel>
                           <FormControl>
                              <Input disabled={loading} placeholder="Category name" {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="description"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Description</FormLabel>
                           <FormControl>
                              <Input
                                 disabled={loading}
                                 placeholder="Category description"
                                 {...field}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
                  <FormField
                     control={form.control}
                     name="bannerIds"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Banners</FormLabel>
                           <FormControl>
                              <MultiSelect
                                 options={bannerOptions}
                                 defaultValue={field.value}
                                 onValueChange={field.onChange}
                                 placeholder="Select banners"
                                 maxCount={5}
                                 animation={0.5}
                              />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />
               </div>
               <Button disabled={loading} className="ml-auto" type="submit">
                  {action}
               </Button>
            </form>
         </Form>
      </>
   )
}
