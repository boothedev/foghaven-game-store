import GameLibrary from '@/components/GameLibrary'
import Header from '@/components/Header'
import { createFileRoute } from '@tanstack/react-router'
import headerImage from '/header-game-list.webp';
import { gameFiltersSchema } from '@/validators';

export const Route = createFileRoute('/_main/store/')({
  component: RouteComponent,
  validateSearch: gameFiltersSchema,
})

function RouteComponent() {
  const gameFilters = Route.useSearch();

  return (
    <div className='flex flex-col'>
      <Header
        imageUrl={headerImage}
        imageAlt="Library header image"
        title="The Vault"
      />
      <GameLibrary gameFilters={gameFilters} />
    </div>
  )
}
