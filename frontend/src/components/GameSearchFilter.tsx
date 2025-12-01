import {
  useRef,
  useState,
  type Dispatch,
  type FormEventHandler,
  type SetStateAction,
} from "react";
import { GenreFilter, PlatformFilter } from "./GameFilter";
import { Button } from "./ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import type { Option } from "./ui/multiple-selector";
import { GameSearch } from "./GameSearch";
import { Label } from "./ui/label";
import { LucideRefreshCw } from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { gameFilterSearchSchema, paramIntArraySchema } from "@/validators";
import type { GameFilterSearch } from "@/types";
import { Switch } from "./ui/switch";
import { useCookieUpdate } from "@/hooks/use-cookie-update";
import { Input } from "./ui/input";

type Props = {
  setState: Dispatch<SetStateAction<"search" | "filter">>;
};

type FilterSelectProps = {
  setValue: Dispatch<SetStateAction<string>>;
  defaultValue: string;
  options: Option[];
};

function FilterSelect({ setValue, defaultValue, options }: FilterSelectProps) {
  useRef(null);
  return (
    <Select defaultValue={defaultValue} onValueChange={setValue}>
      <SelectTrigger className="min-w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map(({ label, value }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

const sortOptions: Option[] = [
  {
    label: "Popularity",
    value: "rater_count",
  },
  {
    label: "Rating",
    value: "rating",
  },
];

const orderOptions: Option[] = [
  {
    label: "Descending",
    value: "desc",
  },
  {
    label: "Ascending",
    value: "asc",
  },
];

function Filter({ setState }: Props) {
  const navigate = useNavigate();
  const isLogin = useCookieUpdate();
  const { sort, order, genres, platforms, owned } = useSearch({
    from: "/_main/store/",
  });
  const defaultGenreValues = paramIntArraySchema.optional().parse(genres) ?? [];
  const defaultPlatformValues =
    paramIntArraySchema.optional().parse(platforms) ?? [];

  const [ownedValue, setOwnedValue] = useState(owned);
  const [genreValues, setGenreValues] = useState(defaultGenreValues);
  const [platformValues, setPlatformValues] = useState(defaultPlatformValues);
  const [sortValue, setSortValue] = useState<string>(sort);
  const [orderValue, setOrderValue] = useState<string>(order);

  const onSubmitHandler: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const newSearchParams: GameFilterSearch = gameFilterSearchSchema.parse({
      genres: genreValues.sort(),
      platforms: platformValues.sort(),
      owned: ownedValue,
      sort: sortValue,
      order: orderValue,
    });
    navigate({
      to: "/store",
      search: newSearchParams,
    });
  };

  return (
    <>
      <form
        className="flex flex-col gap-6 w-full px-6 py-2"
        onSubmit={onSubmitHandler}
      >
        <DialogHeader>
          <DialogTitle>Game Filters</DialogTitle>
          <DialogDescription>
            Filtering games that align with your favorite genres and platforms!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label>Genres:</Label>
          <GenreFilter
            setValues={setGenreValues}
            defaultValues={defaultGenreValues}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Platforms:</Label>
          <PlatformFilter
            setValues={setPlatformValues}
            defaultValues={defaultPlatformValues}
          />
        </div>
        <div className="flex w-full justify-between">
          <div className="flex flex-col gap-2">
            <Label>Sort By:</Label>
            <FilterSelect
              defaultValue={sort}
              setValue={setSortValue}
              options={sortOptions}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Sort Order:</Label>
            <FilterSelect
              defaultValue={order}
              setValue={setOrderValue}
              options={orderOptions}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setState("search")}
          >
            <LucideRefreshCw />
            Search Mode
          </Button>
          {isLogin && (
            <div className="flex items-center space-x-2 w-full justify-center">
              <Switch
                id="owned-only"
                defaultChecked={owned === true}
                onCheckedChange={setOwnedValue}
              />
              <Label htmlFor="owned-only">In library</Label>
            </div>
          )}
          <DialogClose asChild>
            <Button autoFocus type="submit">
              Apply Filters
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </>
  );
}

function Search({ setState }: Props) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Game Search</DialogTitle>
        <DialogDescription>
          Know your favorite game name? Try searching fot it!
        </DialogDescription>
      </DialogHeader>
      <GameSearch />
      <DialogFooter className="sm:justify-start">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setState("filter")}
        >
          <LucideRefreshCw />
          Filter Mode
        </Button>
      </DialogFooter>
    </>
  );
}

export function GameSearchFilter() {
  const [state, setState] = useState<"search" | "filter">("search");

  return (
    <DialogContent className="min-w-xl">
      {state === "search" && <Search setState={setState} />}
      {state === "filter" && <Filter setState={setState} />}
    </DialogContent>
  );
}
