import { cn } from "@/lib/utils";

type StarRatingProps = {
    rating: number,
    totalStars?: number,
    size?: number,
    activeColor?: string,
    inactiveColor?: string,
    className?: string,
}

const STAR_PATH_DATA = "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z";

const starIds = {
    fullStar: "lucide-full-star",
    halfStar: "lucide-half-star",

}

export const GlobalStarDefs = () => (
    // 1. Hide the SVG visually and position it off-screen
    <svg
        className="absolute size-0 overflow-hidden"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
    >
        <defs>
            {/* 2. Define the full star shape */}
            <symbol id={starIds.fullStar} viewBox="0 0 24 24">
                <path d={STAR_PATH_DATA} />
            </symbol>

            {/* 3. Define the half star shape using a clip-path */}
            <symbol id={starIds.halfStar} viewBox="0 0 24 24">
                <clipPath id={"half-clip"}>
                    {/* Clip path covers the left half (0 to 12) of the 24x24 viewBox */}
                    <rect x="0" y="0" width="12" height="24" />
                </clipPath>
                <clipPath id={"half-clip-2"}>
                    {/* Clip path covers the right half (0 to 12) of the 24x24 viewBox */}
                    <rect x="12" y="0" width="12" height="24" />
                </clipPath>
                {/* Draw the full star, then apply the clip-path */}
                <path d={STAR_PATH_DATA} clipPath="url(#half-clip)" />
                <path d={STAR_PATH_DATA} clipPath="url(#half-clip-2)" fill="transparent" />
            </symbol>
        </defs>
    </svg>
);


export const StarRating = ({ rating, totalStars = 5, size = 20, className }: StarRatingProps) => {
    const stars = [];
    const actualStars = Math.round(rating * 2) / 2;
    const wholeStars = Math.floor(actualStars);
    const hasHalfStar = !Number.isInteger(actualStars);

    for (let i = 0; i < totalStars; i++) {
        let starId: keyof typeof starIds = "fullStar";
        let fillColor: string | undefined;

        if (i === wholeStars && hasHalfStar) {
            starId = "halfStar";
        } else if (i >= wholeStars) {
            fillColor = "transparent";
        }

        stars.push(
            <use key={i} href={`#${starIds[starId]}`}
                x={i * size}
                width={size}
                height={size}
                fill={fillColor} />
        );
    }

    // return <div className="flex items-center">{stars}</div>;
    return <svg
        width={size * totalStars}
        height={size}
        viewBox={`0 0 ${size * totalStars} ${size}`}
        className={cn("text-amber-400", className)}
        stroke="currentColor"
        fill="currentColor"
        strokeWidth={2.5}
        data-rating={rating}
    >
        <title>star rating</title>
        {stars}
    </svg>;
};