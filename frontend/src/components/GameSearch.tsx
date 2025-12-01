import { Input } from "./ui/input";
import { useDebounceValue } from "@/hooks/use-debounce-value";
import { useQuery } from "@tanstack/react-query";
import { gameQueries } from "@/api/games.queries";
import { StarRating } from "./StarRating";
import { Link } from "@tanstack/react-router";
import { LucideSearch } from "lucide-react";
import { PreloadImage } from "./ui/preload-image";

export function GameSearch() {
  const [keywords, setKeywords] = useDebounceValue("", 1000);
  const { data: games } = useQuery(gameQueries.search({ search: keywords }));

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="pb-3 w-sm self-center relative h-fit flex items-center">
        <Input
          className="pl-10"
          placeholder="Enter keywords"
          onChange={(e) => setKeywords(e.target.value)}
          autoFocus
        />
        <span className="absolute left-3">
          <LucideSearch size={18} />
        </span>
      </div>
      {/* {games.length === 0 && (
        <div className="text-muted-foreground self-center">No result found</div>
      )} */}
      {games.map(({ id, landscape, name, price, rating, release_date }) => (
        <Link
          key={id}
          to="/store/$gameId"
          params={{ gameId: String(id) }}
          className="flex bg-card border shadow rounded-md overflow-hidden"
        >
          <PreloadImage src={landscape} alt={name} className="h-22 w-auto" />
          <div className="p-2 w-full flex flex-col justify-between">
            <div className="flex justify-between gap-4">
              <h3 className="font-bold line-clamp-2">{name}</h3>
              <span className="shrink-0">{release_date}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex gap-1 text-sm text-muted-foreground items-center justify-center">
                <StarRating rating={rating} />
                <span>({rating.toFixed(2)})</span>
              </div>
              <span>{price}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
