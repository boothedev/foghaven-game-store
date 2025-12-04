import { useMemo, type Dispatch, type SetStateAction } from "react";
import MultipleSelector, {
  type Option,
} from "@/components/ui/multiple-selector";
import { useQuery } from "@tanstack/react-query";
import { genreQueries } from "@/api/genres.queries";
import { platformQueries } from "@/api/platforms.queries";

type GameFilterProps = {
  options: Option[];
  defaultOptionValues: Option[];
  placeholder: string;
  setValues: Dispatch<SetStateAction<number[]>>;
};

type GenreFilterProps = {
  defaultValues: number[];
  setValues: Dispatch<SetStateAction<number[]>>;
};

type PlatformFilterProps = GenreFilterProps;

function GameFilter({
  options,
  defaultOptionValues,
  setValues,
  placeholder,
}: GameFilterProps) {
  return (
    <MultipleSelector
      defaultOptions={options}
      value={defaultOptionValues}
      placeholder={placeholder}
      onChange={(values) =>
        setValues(values.map((value) => Number(value.value)))
      }
      maxSelected={10}
      badgeClassName="bg-card outline outline-card-foreground/20 text-accent-foreground"
      emptyIndicator={
        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
          no results found.
        </p>
      }
    />
  );
}

const genreParsing: (value: {
  id: number;
  name: string;
  icon: string | null;
}) => Option = ({ name, icon, id }) => ({
  label: `${icon ?? ""} ${name}`,
  value: String(id),
});

const platformParsing: (value: {
  id: number;
  name: string;
  value: string | null;
}) => Option = ({ name, id }) => ({
  label: name,
  value: String(id),
});

export function GenreFilter({ defaultValues, setValues }: GenreFilterProps) {
  const { data } = useQuery(genreQueries.all());
  const options: Option[] = useMemo(() => {
    if (data === undefined) return [];
    return Array.from(data.values(), genreParsing);
  }, [data]);
  const defaultOptionValues: Option[] = defaultValues
    .map((val) => data?.get(val))
    .filter((opt) => opt !== undefined)
    .map(genreParsing);

  return (
    <GameFilter
      options={options}
      defaultOptionValues={defaultOptionValues}
      setValues={setValues}
      placeholder="Select genres"
    />
  );
}

export function PlatformFilter({
  defaultValues,
  setValues,
}: PlatformFilterProps) {
  const { data } = useQuery(platformQueries.all());
  const defaultOptionValues: Option[] = defaultValues
    .map((val) => data?.get(val))
    .filter((opt) => opt !== undefined)
    .map(platformParsing);
  const options: Option[] = useMemo(() => {
    if (data === undefined) return [];
    return Array.from(data.values(), platformParsing);
  }, [data]);

  return (
    <GameFilter
      options={options}
      defaultOptionValues={defaultOptionValues}
      setValues={setValues}
      placeholder="Select platforms"
    />
  );
}
