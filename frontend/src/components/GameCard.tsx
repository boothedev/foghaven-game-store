import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { GameListItem, Genre } from "@/types";
import { StarRating } from "./StarRating";
import { Badge } from "./ui/badge";
import { useQuery } from "@tanstack/react-query";
import { genreQueries } from "@/api/genres.queries";
import { platformQueries } from "@/api/platforms.queries";

type GameCardProps = {
  game: GameListItem;
  className?: string;
  style?: React.CSSProperties;
};

type GameCardPrimaryProps = {
  image: string;
  name: string;
  rating: number;
};

type GameCardOverlayProps = {
  introduction: string;
  price: string;
  releaseDate: string;
  genreIds: number[];
  platformIds: number[];
};

type PreloadImageProps = {
  src: string;
  alt: string;
};

const PreloadImage = ({ src, alt, ...props }: PreloadImageProps) => {
  const [isDecoded, setIsDecoded] = useState(false);

  useEffect(() => {
    if (!src) return;
    setIsDecoded(false);
    const img = new Image();

    img.src = src;
    img.onload = () => {
      setIsDecoded(true);
    };
    img.onerror = (err) => {
      console.error(`Failed to load image: ${src}`, err);
      setIsDecoded(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (!isDecoded) {
    return null;
  }

  return <img src={src} loading="eager" alt={alt} {...props} />;
};

export function GameCardPrimary({ image, name, rating }: GameCardPrimaryProps) {
  return (
    <div className="flex size-full flex-col group-hover:brightness-50">
      <PreloadImage src={image} alt={name} />
      <div className="flex h-full items-center justify-between px-2">
        <p className="line-clamp-1 font-semibold">{name}</p>
        <StarRating rating={rating} className="shrink-0" />
      </div>
    </div>
  );
}

export function GameCardOverlay({
  introduction,
  price,
  releaseDate,
  genreIds,
  platformIds,
}: GameCardOverlayProps) {
  const { data: genres } = useQuery(genreQueries.all());
  const { data: platforms } = useQuery(platformQueries.all());

  return (
    <div className="fade-in absolute inset-0 hidden size-full animate-in flex-col gap-1 bg-foreground/30 p-5 pb-3 text-accent text-shadow-lg backdrop-blur-lg group-hover:flex">
      <div className="flex-1">
        <p className="line-clamp-3">{introduction}</p>
      </div>
      <div className="flex gap-1 line-clamp-2 flex-wrap mb-1">
        {genres &&
          genreIds.map((id) => {
            const genre = genres.get(id);
            if (!genre) {
              return null;
            }
            return (
              <Badge
                key={genre.id}
                variant="outline"
                className="text-background text-sm"
              >
                {genre.icon} {genre.name}
              </Badge>
            );
          })}
      </div>
      <div className="grid grid-cols-3 w-full">
        <div className="">{releaseDate}</div>
        <div className="flex gap-1">
          {platforms &&
            [...platforms.values()].map((platform) => {
              return (
                <Badge
                  key={platform.id}
                  variant={
                    platformIds.includes(platform.id) ? "secondary" : "outline"
                  }
                  className="text-background"
                >
                  <img src={`/${platform.value}.svg`} alt={platform.name} />
                </Badge>
              );
            })}
        </div>
        <div className="place-self-end font-bold">{price}</div>
      </div>
    </div>
  );
}

export function GameCard({ game, className, style }: GameCardProps) {
  const {
    id: gameId,
    name,
    rating,
    introduction,
    price,
    release_date: releaseDate,
    landscape,
    genre_ids: genreIds,
    platform_ids: platformIds,
  } = game;
  return (
    <Link
      to="/store/$gameId"
      params={{ gameId: gameId.toString() }}
      className={cn(
        "group top-0 left-0 aspect-video overflow-hidden rounded-lg border bg-card text-card-foreground text-lg leading-8 shadow-sm",
        className
      )}
      style={style}
    >
      <GameCardPrimary image={landscape} name={name} rating={rating} />
      <GameCardOverlay
        introduction={introduction}
        price={price}
        releaseDate={releaseDate}
        genreIds={genreIds}
        platformIds={platformIds}
      />
    </Link>
  );
}
