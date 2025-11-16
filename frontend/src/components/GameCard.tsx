import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { GameListItem } from '@/types';
import { StarRating } from './StarRating';

type GameCardProps = {
  game: GameListItem;
  className?: string;
  style?: React.CSSProperties;
};

type GameCardPrimaryProps = {
  image: string,
  name: string,
  rating: number,
};

type GameCardOverlayProps = {
  introduction: string,
  price: string,
  releaseDate: string
};

type PreloadImageProps = {
  src: string,
  alt: string,
}

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

  return (
    <img
      src={src}
      loading="eager"
      alt={alt}
      {...props}
    />
  );
};

export function GameCardPrimary({ image, name, rating }: GameCardPrimaryProps) {
  return (
    <div className="flex size-full flex-col group-hover:brightness-50">
      <PreloadImage
        src={image}
        alt={name}
      />
      <div className="flex h-full items-center justify-between px-2">
        <p className="line-clamp-1 font-semibold">{name}</p>
        <StarRating rating={rating} className="shrink-0" />
      </div>
    </div>
  );
}

export function GameCardOverlay({ introduction, price, releaseDate }: GameCardOverlayProps) {
  return (
    <div className="fade-in absolute inset-0 hidden size-full animate-in flex-col gap-1 bg-foreground/30 p-5 text-accent text-shadow-lg backdrop-blur-lg group-hover:flex">
      <div className="flex-1">
        <p className="line-clamp-4">{introduction}</p>
      </div>
      <div>
        <strong>Genres:</strong>
      </div>
      <div className="flex justify-between">
        <div>{price}</div>
        <div>{releaseDate}</div>
      </div>
    </div>
  );
}

export function GameCard({ game, className, style }: GameCardProps) {
  const { id: gameId, name, rating, introduction, price, releaseDate, landscape } = game;
  return (
    <Link
      to="/store/$gameId"
      params={{ gameId: gameId.toString() }}
      className={cn(
        'group top-0 left-0 aspect-video overflow-hidden rounded-lg border bg-card text-card-foreground text-lg leading-8 shadow-sm',
        className,
      )}
      style={style}
    >
      <GameCardPrimary image={landscape} name={name} rating={rating} />
      <GameCardOverlay introduction={introduction} price={price} releaseDate={releaseDate} />
    </Link>
  );
}
