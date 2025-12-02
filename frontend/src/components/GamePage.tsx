import { StarRating } from "@/components/StarRating";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { preloadImage, ratingText, userRatingText } from "@/lib/utils";
import type {
  Achievement,
  Game,
  Movie,
  PlatformListExtended,
  Screenshot,
} from "@/types";

import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { LucideGamepad2, LucideShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useGamePurchase, useGameRate } from "@/api/auth.mutations";
import { useCookieUpdate } from "@/hooks/use-cookie-update";
import { Rating, RatingButton } from "./ui/shadcn-io/rating";

type HeaderTabsProps = {
  game: Game;
};
type OverviewTabProps = {
  game: Game;
};
type RequirementsTabProps = {
  min_requirements: string | null;
  rec_requirements: string | null;
};
type RequirementsTabsProps = {
  platforms: PlatformListExtended;
};
type ScreenshotTabProps = {
  screenshots: Screenshot[];
};
type MoviesTabProps = {
  movies: Movie[];
};
type AchievementsTabProps = {
  achievements: Achievement[];
};
type GamePageProps = {
  game: Game;
};

function OverviewTab({ game }: OverviewTabProps) {
  return (
    <div className="flex flex-col justify-between h-full">
      <section
        className="text-md"
        dangerouslySetInnerHTML={{ __html: game.introduction }}
      ></section>
      <section className="flex gap-2 flex-col">
        {/* <strong>Genres:</strong> */}
        <div className="flex gap-2 flex-wrap">
          {game.genres.map((genre) => (
            <Badge
              key={genre.id}
              variant="secondary"
              className="text-accent-foreground cursor-pointer text-sm tracking-wide font-semibold bg-card/80 hover:bg-card/50 outline-1 outline-foreground/40"
              asChild
            >
              <Link to="/store" search={{ genres: genre.id }}>
                {genre.icon} {genre.name}
              </Link>
            </Badge>
          ))}
        </div>
      </section>
    </div>
  );
}

function RequirementsTabs({ platforms }: RequirementsTabsProps) {
  return (
    <div className="w-full">
      <Tabs defaultValue={platforms[0].value} className="gap-2">
        <TabsList className="h-full">
          {platforms.map(({ id, name, value }) => (
            <TabsTrigger
              key={id}
              value={value}
              className="flex items-center gap-1 px-2.5 sm:px-3 w-fit cursor-pointer"
              aria-label="tab-trigger"
            >
              <img src={`/${value}.svg`} alt={name} />
              {name}
            </TabsTrigger>
          ))}
        </TabsList>

        {platforms.map(({ id, value, min_requirements, rec_requirements }) => (
          <TabsContent key={id} value={value}>
            <RequirementsTab
              min_requirements={min_requirements}
              rec_requirements={rec_requirements}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function RequirementsTab({
  min_requirements,
  rec_requirements,
}: RequirementsTabProps) {
  return (
    <div className="flex gap-6 justify-between items-stretch text-sm leading-relaxed">
      {min_requirements && (
        <section className="flex-1">
          <div
            className="line-clamp-11"
            dangerouslySetInnerHTML={{
              __html: min_requirements,
            }}
          ></div>
        </section>
      )}
      {rec_requirements && (
        <section className="flex-1">
          <div
            className="line-clamp-11"
            dangerouslySetInnerHTML={{
              __html: rec_requirements,
            }}
          ></div>
        </section>
      )}
    </div>
  );
}

function ScreenshotsTab({ screenshots }: ScreenshotTabProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  return (
    <div>
      <Carousel
        setApi={setApi}
        className="mx-auto w-lg flex justify-center items-center -my-1"
      >
        <CarouselContent className="w-full">
          {screenshots.map(({ id, thumbnail, content: _ }) => {
            return (
              <CarouselItem key={id} className="aspect-video rounded-sm h-full">
                <img
                  src={thumbnail}
                  alt=""
                  className="size-full object-cover rounded-sm"
                />
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="text-muted-foreground mt-2 text-center text-sm">
        Image {current} of {count}
      </div>
    </div>
  );
}

function MoviesTab({ movies }: MoviesTabProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  return (
    <div>
      <Carousel
        setApi={setApi}
        className="mx-auto w-lg flex justify-center items-center -my-1"
      >
        <CarouselContent className="w-full">
          {movies.map(({ id, thumbnail, content_sd }, index) => {
            return (
              <CarouselItem key={id} className="aspect-video rounded-sm h-full">
                {current === index + 1 ? (
                  <video
                    className="size-full object-cover rounded-sm"
                    poster={thumbnail}
                    autoPlay
                    controls
                  >
                    <source src={content_sd} />
                  </video>
                ) : (
                  <img
                    src={thumbnail}
                    alt=""
                    className="size-full object-cover rounded-sm"
                  />
                )}
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="text-muted-foreground mt-2 text-center text-sm">
        Movie {current} of {count}
      </div>
    </div>
  );
}

function AchievementsTab({ achievements }: AchievementsTabProps) {
  return (
    <div className="grid grid-cols-2 col-gap gap-x-4 gap-y-2 mx-2">
      {achievements.map(({ id, name, thumbnail }) => (
        <div
          key={id}
          className="flex gap-2 border rounded-md overflow-hidden hover:bg-foreground/10 transition-colors duration-300"
        >
          <img src={thumbnail} alt={name} className="size-12" />
          <p>{name}</p>
        </div>
      ))}
    </div>
  );
}

function HeaderTabManager({ game }: HeaderTabsProps) {
  const tabs = [
    {
      name: "Overview",
      value: "overview",
      content: <OverviewTab game={game} />,
    },
    {
      name: "Screenshots",
      value: "screenshots",
      content: <ScreenshotsTab screenshots={game.screenshots} />,
      disabled: game.screenshots.length <= 0,
      preload: () =>
        game.screenshots.forEach(({ thumbnail }) => preloadImage(thumbnail)),
    },
    {
      name: "Movies",
      value: "movies",
      content: <MoviesTab movies={game.movies} />,
      disabled: game.movies.length <= 0,
      preload: () =>
        game.movies.forEach(({ thumbnail }) => preloadImage(thumbnail)),
    },
    {
      name: "System Requirements",
      value: "requirements",
      content: <RequirementsTabs platforms={game.platforms} />,
      disabled: game.platforms.length <= 0,
    },
    {
      name: "Achievements",
      value: "achievements",
      content: <AchievementsTab achievements={game.achievements} />,
      disabled: game.achievements.length <= 0,
      preload: () =>
        game.achievements.forEach(({ thumbnail }) => preloadImage(thumbnail)),
    },
  ];

  return (
    <Tabs defaultValue="overview" className="gap-4 h-full">
      <TabsList className="bg-background rounded-none border-b p-0 gap-5">
        {tabs
          .filter((tab) => !tab.disabled)
          .map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              onMouseEnter={tab.preload}
              className="bg-background data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none hover:border-primary/10 cursor-pointer"
            >
              {tab.name}
            </TabsTrigger>
          ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

type ButtonPurchaseProps = {
  id: number;
  name: string;
  price: string;
  landscape: string;
  className: string;
};
function ButtonPurchase({
  id,
  name,
  landscape,
  price,
  className,
  ...props
}: ButtonPurchaseProps) {
  const purchaseGameMutation = useGamePurchase();
  const { isAuthenticated } = useCookieUpdate();
  const [open, setOpen] = useState(false);
  const purchaseHandler = () => {
    purchaseGameMutation.mutate(
      { id },
      {
        onSettled: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className} {...props}>
          <LucideShoppingCart className="size-5" />
          {price}
        </Button>
      </DialogTrigger>
      {isAuthenticated ? (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Order Transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <img
              src={landscape}
              alt={name}
              className="rounded-md overflow-hidden"
            />
            <p>
              Ready to add the{" "}
              <strong className="text-lg underline decoration-emerald-200 decoration-2">
                {name}
              </strong>{" "}
              to your inventory? Your account will be charged{" "}
              <strong className="text-lg underline decoration-emerald-200 decoration-2">
                {price}
              </strong>{" "}
              upon confirmation.
            </p>
            <p className="text-sm text-muted-foreground">
              Click <strong>Process</strong> to complete this transaction.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="font-bold"
              onClick={purchaseHandler}
            >
              Process ( – {price} )
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>

          <div>You need to login to process a transaction.</div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button className="font-bold" asChild>
              <Link
                to="/login"
                search={{
                  redirect: location.pathname,
                }}
              >
                Login
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}

type ButtonLaunchGameProps = {
  gameId: number;
  className: string;
};
function ButtonLaunchGame({
  gameId,
  className,
  ...props
}: ButtonLaunchGameProps) {
  return (
    <Button className={className} {...props} asChild>
      <a href={`steam://launch/${gameId}`}>
        <LucideGamepad2 className="size-5" />
        Play Now
      </a>
    </Button>
  );
}

type ButtonRatingGameProps = {
  gameId: number;
  stars?: number;
};

function ButtonRatingGame({ gameId, stars }: ButtonRatingGameProps) {
  const [open, setOpen] = useState(false);
  const [starValue, setStarValue] = useState(stars);
  const gameRateMutation = useGameRate();
  const rateHandler = () => {
    if (stars === starValue) setOpen(false);

    gameRateMutation.mutate(
      {
        id: gameId,
        stars: starValue === 0 ? undefined : starValue,
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="cursor-pointer font-bold text-accent-foreground bg-card/80 group-hover:bg-card group-hover:text-accent-foreground hover:bg-amber-200"
          size="sm"
        >
          Rate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate this game</DialogTitle>
          <DialogDescription>How do you feel about it?</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-1">
          <Rating value={starValue ?? 0} onValueChange={setStarValue}>
            {Array.from({ length: 5 }).map((_, index) => (
              <RatingButton className="text-yellow-500" key={index} size={40} />
            ))}
          </Rating>
          <span className="text-lg text-muted-foreground">
            {userRatingText(starValue) ?? "🤔"}
          </span>
        </div>
        <DialogFooter className="md:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStarValue(undefined)}
          >
            Clear
          </Button>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button type="button" className="font-bold" onClick={rateHandler}>
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function GamePage({ game }: GamePageProps) {
  const {
    id,
    name,
    portrait,
    landscape,
    price,
    owned,
    background,
    description,
    rater_count,
    rating,
  } = game;

  return (
    <div className="size-full">
      <div className="inset-0 w-screen h-screen -z-1 fixed bg-[url('/header-game-list.webp')] brightness-150">
        <img
          src={background}
          alt={`${name} background`}
          className="size-full"
          onError={(e) => e.currentTarget.remove()}
        />
      </div>
      <div className="w-3xl mx-auto xl:w-5xl">
        <header className="flex drop-shadow-sm drop-shadow-card/50 rounded-xl overflow-hidden my-10 size-full aspect-7/3 backdrop-blur-lg bg-card">
          <div className="relative aspect-2/3 group">
            <img src={portrait} alt={name} className="object-cover size-full" />
            <div className="group transition-all hover:bg-foreground/80 absolute inset-0 text-white text-lg w-full">
              <div className="absolute bottom-0 py-2 bg-foreground/70 w-full group-hover:bg-transparent">
                <div className="transition-all translate-x-4 group-hover:translate-x-0 flex group-hover:flex-col gap-2 items-center justify-center group-hover:scale-140 group-hover:-translate-y-1/2">
                  <div className="hidden group-hover:block text-xs tracking-wide">
                    {rater_count.toLocaleString("en-US")} raters -{" "}
                    {rating.toFixed(1)}⭐
                  </div>{" "}
                  <StarRating
                    size={20}
                    rating={rating}
                    raterCount={rater_count}
                  />
                  <div className="hidden group-hover:block">
                    {ratingText(rating)}
                  </div>
                  {owned && (
                    <ButtonRatingGame stars={owned.stars} gameId={game.id} />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="p-8 text-lg flex flex-col h-full aspect-5/3 gap-1.5">
            <section className="flex gap-2 items-center justify-between">
              <div className="flex gap-2 items-center w-full">
                <h1 className="text-3xl font-black">{name}</h1>
              </div>
              {owned ? (
                <ButtonLaunchGame
                  gameId={id}
                  className="font-semibold text-lg cursor-pointer min-w-35 shrink-0"
                />
              ) : (
                <ButtonPurchase
                  className="font-semibold text-lg cursor-pointer min-w-35 shrink-0"
                  id={id}
                  name={name}
                  price={price}
                  landscape={landscape}
                />
              )}
            </section>
            <HeaderTabManager game={game} />
          </div>
        </header>
        <div className="mx-auto flex flex-col items-center justify-center border rounded-xl px-10 py-15 my-10 shadow-sm bg-card/80 backdrop-blur-lg">
          <h2 className="font-medium font-title text-7xl text-foreground/90 text-shadow-blue-300/70 text-shadow-md tracking-wide mb-10">
            ABOUT THE GAME
          </h2>
          <div
            className="prose prose-sm sm:prose-base lg:prose-xl xl:prose-2xl dark:prose-invert marker:text-foreground"
            dangerouslySetInnerHTML={{ __html: description }}
          ></div>
        </div>
      </div>
    </div>
  );
}
