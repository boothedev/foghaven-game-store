import { gameQueries } from "@/api/games.queries";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Game, Movie, PlatformListExtended, Screenshot } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_main/store/$gameId")({
  component: RouteComponent,
});

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

function OverviewTab({ game }: OverviewTabProps) {
  return (
    <>
      <section
        className="text-md"
        dangerouslySetInnerHTML={{ __html: game.introduction }}
      ></section>
      <Separator className="my-3" />
      <section className="flex gap-1 flex-wrap">
        {game.genres.map((genre) => (
          <Badge key={genre.id} variant="outline" asChild>
            <Link
              to="/store"
              search={{ genres: genre.id }}
              className="cursor-pointer"
            >
              {genre.icon} {genre.name}
            </Link>
          </Badge>
        ))}
      </section>
      <Separator className="my-3" />
    </>
  );
}

function RequirementsTabs({ platforms }: RequirementsTabsProps) {
  return (
    <div className="w-full">
      <Tabs defaultValue={platforms[0].value} className="gap-4">
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

function ScreenshotTab({ screenshots }: ScreenshotTabProps) {
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
                    src={content_sd}
                    className="size-full object-cover rounded-sm"
                    autoPlay
                    controls
                  ></video>
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

function HeaderTabs({ game }: HeaderTabsProps) {
  const tabs = [
    {
      name: "Overview",
      value: "overview",
      content: <OverviewTab game={game} />,
    },
    {
      name: "Screenshots",
      value: "screenshots",
      content: <ScreenshotTab screenshots={game.screenshots} />,
    },
    {
      name: "Movies",
      value: "movies",
      content: <MoviesTab movies={game.movies} />,
    },
    {
      name: "System Requirements",
      value: "requirements",
      content: <RequirementsTabs platforms={game.platforms} />,
    },
  ];

  return (
    <Tabs defaultValue="overview" className="gap-4">
      <TabsList className="bg-background rounded-none border-b p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
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

function RouteComponent() {
  const { gameId } = Route.useParams();
  const {
    data: game,
    isPending,
    error,
  } = useQuery(gameQueries.one({ id: Number(gameId) }));

  if (isPending) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  return (
    <div className="w-3xl mx-auto xl:w-5xl">
      <header className="flex border rounded-xl overflow-hidden my-10 bg-card shadow-sm size-full aspect-7/3">
        <img
          src={game.portrait}
          alt={game.name}
          className="object-cover aspect-2/3"
        />
        <div className="p-8 text-lg flex flex-col h-full aspect-5/3">
          <section className="flex gap-4 items-center">
            <h1 className="text-3xl font-black">{game.name}</h1>
            <div className="flex gap-1">
              <StarRating rating={game.rating} />
              <p className="text-muted-foreground text-sm">
                ({game.rater_count.toLocaleString("en-US")} raters)
              </p>
            </div>
          </section>
          <HeaderTabs game={game} />
        </div>
      </header>
      <div className="mx-auto flex flex-col items-center justify-center border rounded-xl py-5 my-10 bg-card shadow-sm">
        <h2 className="font-medium font-title text-7xl text-foreground/90 text-shadow-blue-300/70 text-shadow-md tracking-wide my-10">
          ABOUT THE GAME
        </h2>
        <div
          className="prose prose-sm sm:prose-base lg:prose-xl xl:prose-2xl dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: game.description }}
        ></div>
      </div>
    </div>
  );
}
