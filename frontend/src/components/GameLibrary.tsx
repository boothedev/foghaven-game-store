import { useInfiniteQuery } from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState } from "react";
import { gameQueries } from "@/api/games.queries";
import { GameCard } from "@/components/GameCard";
import type { GameFilterSearch, GameListItem } from "@/types";
import { gameFilterSchema } from "@/validators";
import { preloadImage } from "@/lib/utils";

const GAP = 14;

type GameLibraryProps = {
  gameFilterSearch: GameFilterSearch;
};

type Breakpoint = {
  min: number;
  scaleFactor: number;
  columnCount: number;
  itemWidth: number;
  itemHeight: number;
};

const BREAKPOINTS: Breakpoint[] = [
  {
    min: 1536,
    scaleFactor: 29,
    columnCount: 3,
  },
  {
    min: 1280,
    scaleFactor: 25,
    columnCount: 3,
  },
  {
    min: 1024,
    scaleFactor: 20,
    columnCount: 3,
  },
  {
    min: 768,
    scaleFactor: 23,
    columnCount: 2,
  },
  {
    min: 672,
    scaleFactor: 40,
    columnCount: 1,
  },
  {
    min: 576,
    scaleFactor: 30,
    columnCount: 1,
  },
  {
    min: 512,
    scaleFactor: 25,
    columnCount: 1,
  },
  {
    min: 320,
    scaleFactor: 20,
    columnCount: 1,
  },
]
  .map((item) => ({
    ...item,
    itemWidth: item.scaleFactor * 16,
    itemHeight: item.scaleFactor * 9,
  }))
  .sort((bp1, bp2) => bp2.min - bp1.min);

function getBreakpoint() {
  // SSR Check
  if (typeof window === "undefined") {
    return BREAKPOINTS[BREAKPOINTS.length - 1];
  }
  const windowWidth = window.innerWidth;
  const searchIdx = BREAKPOINTS.findIndex((br) => windowWidth >= br.min);
  const finalIdx = searchIdx !== -1 ? searchIdx : BREAKPOINTS.length - 1;
  return BREAKPOINTS[finalIdx];
}

function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getBreakpoint());

  useEffect(() => {
    const listener = () => setBreakpoint(getBreakpoint());
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, []);

  return breakpoint;
}

function dimensionsCalc(breakpoint: Breakpoint, gap: number, gamesLen: number) {
  const { itemHeight: height, itemWidth: width, columnCount } = breakpoint;
  const rowCount = Math.ceil(gamesLen / columnCount);
  const totalHeight = rowCount * (height + gap) - gap;
  const totalWidth = columnCount * (width + gap) - gap;
  return {
    rowCount,
    columnCount,
    totalHeight,
    totalWidth,
  };
}

function rowStyle(rowIndex: number, itemHeight: number): React.CSSProperties {
  const yStart = rowIndex * itemHeight + GAP * rowIndex;
  return {
    height: `${itemHeight}px`,
    transform: `translateY(${yStart}px)`,
    gap: GAP,
  };
}

function columnStyle(
  columnIndex: number,
  itemWidth: number
): React.CSSProperties {
  const xStart = columnIndex * itemWidth + GAP * columnIndex;
  return {
    width: `${itemWidth}px`,
    transform: `translateX(${xStart}px)`,
  };
}

function scrollBoxStyle({
  totalHeight,
  totalWidth,
}: ReturnType<typeof dimensionsCalc>) {
  return {
    height: `${totalHeight}px`,
    width: `${totalWidth}px`,
  };
}

export default function GameLibrary({ gameFilterSearch }: GameLibraryProps) {
  // Data fetching
  const gameFilters = gameFilterSchema.parse(gameFilterSearch);
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(gameQueries.infinitePages(gameFilters));
  const gamesMemo = useMemo<GameListItem[]>(
    () => (data ? data.pages.flat() : []),
    [data]
  );
  const gamesLen = gamesMemo.length;

  // Config
  const breakpoint = useBreakpoint();
  const scrollParentRef = useRef<HTMLDivElement>(null);
  const { columnCount, itemHeight, itemWidth } = breakpoint;
  const dimensions = useMemo(
    () => dimensionsCalc(breakpoint, GAP, gamesLen),
    [breakpoint, gamesLen]
  );

  // Virtualizers
  const rowVirtualizer = useWindowVirtualizer({
    count: Math.ceil(gamesLen / columnCount),
    scrollMargin: scrollParentRef.current?.offsetTop ?? 0,
    estimateSize: () => itemHeight,
    gap: GAP,
    overscan: 5,
  });
  const rowItems = rowVirtualizer.getVirtualItems();

  // Triggers
  useEffect(() => {
    if (rowItems.length === 0) return;

    const lastRow = rowItems[rowItems.length - 1];
    if (!lastRow) return;

    const lastVisibleIndex = lastRow.index * columnCount + (columnCount - 1);

    if (
      lastVisibleIndex >= gamesLen - columnCount &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage().then(({ data }) => {
        if (data && data.pages.length > 0) {
          data.pages[data.pages.length - 1].forEach(({ landscape }) =>
            preloadImage(landscape)
          );
        }
      });
    }
  }, [
    hasNextPage,
    fetchNextPage,
    gamesLen,
    isFetchingNextPage,
    rowItems,
    columnCount,
  ]);

  return (
    <div ref={scrollParentRef} className="mx-auto h-screen w-full py-4">
      <div className="relative mx-auto" style={scrollBoxStyle(dimensions)}>
        {rowItems.map((vRow) => {
          return (
            <div
              key={vRow.key}
              className="absolute w-full"
              style={rowStyle(vRow.index, itemHeight)}
            >
              {[...Array(columnCount)].map((_, columnIndex) => {
                const index = vRow.index * columnCount + columnIndex;
                if (index >= gamesLen) return null;
                return (
                  <GameCard
                    key={index}
                    game={gamesMemo[index]}
                    className="absolute"
                    style={columnStyle(columnIndex, itemWidth)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
