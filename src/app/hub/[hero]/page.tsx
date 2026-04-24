import { redirect } from 'next/navigation'

export default function HubHeroRedirect({ params }: { params: { hero: string } }) {
  redirect('/heroes/' + params.hero)
}
