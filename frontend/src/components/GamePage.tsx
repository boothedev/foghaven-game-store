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
import { preloadImage } from "@/lib/utils";
import type {
  Achievement,
  Game,
  Movie,
  PlatformListExtended,
  Screenshot,
} from "@/types";

import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

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
        <strong>Genres:</strong>
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
            dangerouslySetInnerHTML={{
              __html: min_requirements,
            }}
          ></div>
        </section>
      )}
      {rec_requirements && (
        <section className="flex-1">
          <div
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
      disabled: game.movies.length > 0,
      preload: () =>
        game.movies.forEach(({ thumbnail }) => preloadImage(thumbnail)),
    },
    {
      name: "System Requirements",
      value: "requirements",
      content: <RequirementsTabs platforms={game.platforms} />,
      disabled: game.platforms.length > 0,
    },
    {
      name: "Achievements",
      value: "achievements",
      content: <AchievementsTab achievements={game.achievements} />,
      disabled: game.achievements.length > 0,
      preload: () =>
        game.achievements.forEach(({ thumbnail }) => preloadImage(thumbnail)),
    },
  ];

  return (
    <Tabs defaultValue="overview" className="gap-4 h-full">
      <TabsList className="bg-background rounded-none border-b p-0 gap-5">
        {tabs.map((tab) => (
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

export function GamePage({ game }: GamePageProps) {
  return (
    <div className="size-full">
      <div className="inset-0 w-screen h-screen -z-1 fixed bg-[url('/header-game-list.webp')] brightness-150">
        <img
          src={game.background}
          alt={`${game.name} background`}
          className="size-full"
          onError={(e) => e.currentTarget.remove()}
        />
      </div>
      <div className="w-3xl mx-auto xl:w-5xl">
        <header className="flex drop-shadow-sm drop-shadow-card/50 rounded-xl overflow-hidden my-10 size-full aspect-7/3 backdrop-blur-lg bg-card">
          <img
            src={game.portrait}
            alt={game.name}
            className="object-cover aspect-2/3"
          />
          <div className="p-8 text-lg flex flex-col h-full aspect-5/3 gap-1.5">
            <section className="flex gap-4 items-center">
              <h1 className="text-3xl font-black">{game.name}</h1>
              <div className="flex gap-1 shrink-0">
                <StarRating rating={game.rating} />
                <p className="text-muted-foreground text-sm">
                  ({game.rater_count.toLocaleString("en-US")} raters)
                </p>
              </div>
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
            dangerouslySetInnerHTML={{ __html: game.description }}
          ></div>
        </div>
      </div>
    </div>
  );
}
