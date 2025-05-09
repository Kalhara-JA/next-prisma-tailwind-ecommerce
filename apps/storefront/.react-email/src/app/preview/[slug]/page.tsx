import { render } from '@react-email/render'
import { promises as fs } from 'fs'
import { dirname, join as pathJoin } from 'path'

import { CONTENT_DIR, getEmails } from '../../../utils/get-emails'
import Preview from './preview'

export const dynamicParams = true

export async function generateStaticParams() {
   const { emails } = await getEmails()

   const paths = emails.map((email) => {
      return { slug: email }
   })

   return paths
}

export default async function Page(props) {
   const params = await props.params;
   const { emails, filenames } = await getEmails()
   const template = filenames.filter((email) => {
      const [fileName] = email.split('.')
      return params.slug === fileName
   })

   const Email = (await import(`../../../../../src/emails/${params.slug}`))
      .default
   const markup = await render(<Email />, { pretty: true })
   const plainText = await render(<Email />, { plainText: true })
   const basePath = pathJoin(process.cwd(), CONTENT_DIR)
   const path = pathJoin(basePath, template[0])

   // the file is actually just re-exporting the default export of the original file. We need to resolve this first
   const reactMarkup: string = await fs.readFile(path, {
      encoding: 'utf-8',
   })

   return (
      <Preview
         navItems={emails}
         slug={params.slug}
         markup={markup}
         reactMarkup={reactMarkup}
         plainText={plainText}
      />
   )
}

export async function generateMetadata(props) {
   const params = await props.params;
   return { title: `${params.slug} — React Email` }
}
