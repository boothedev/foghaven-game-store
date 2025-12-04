import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LucideChevronsDown,
  LucideChevronsUp,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import FoggyScreen from "@/components/FoggyScreen";
import { cn } from "@/lib/utils";
import landing from "/landing.webp";
import landingAuthors from "/landing-authors.svg";
import landingIntro from "/landing-intro.svg";
import landingTitle from "/landing-title.svg";

type ReactNode = React.ReactNode;
type ReactSetState<T> = React.Dispatch<React.SetStateAction<T>>;

type SectionProps = {
  isVisible: boolean;
  children: ReactNode;
};

type TopSectionProps = {
  children: ReactNode;
};

type BottomSectionProps = {
  children: ReactNode;
};

type SwitchProps = {
  Icon: LucideIcon;
  isVisible: boolean;
  setIsOnTop: ReactSetState<boolean>;
};

type BackgroundProps = {
  isOnTop: boolean;
};

type RootProps = {
  children: ReactNode;
  setIsOnTop: ReactSetState<boolean>;
};

export const Route = createFileRoute("/")({
  component: App,
});

function TopSection({ children }: TopSectionProps) {
  return (
    <div className="absolute top-8 flex w-full flex-col items-center justify-center gap-8 md:gap-14">
      {children}
    </div>
  );
}

function BottomSection({ children }: BottomSectionProps) {
  return (
    <div className="absolute bottom-6 flex w-full flex-col items-center justify-center">
      {children}
    </div>
  );
}

function Content({ children }: BottomSectionProps) {
  return (
    <div className="relative h-full w-7/10 min-w-xs md:w-3/5">{children}</div>
  );
}

function Switch({ Icon, isVisible, setIsOnTop }: SwitchProps) {
  return (
    <button
      className={cn("animate-bounce drop-shadow-cyan-300/30 drop-shadow-lg", {
        "cursor-pointer": isVisible,
      })}
      type="button"
      onClick={() => isVisible && setIsOnTop((prev) => !prev)}
    >
      <Icon color="white" className="size-0 lg:size-20" />
    </button>
  );
}

function Section({ isVisible, children }: SectionProps) {
  return (
    <div
      className={cn(
        "pointer-events-none flex size-full justify-center opacity-0 transition-opacity",
        {
          "pointer-events-auto opacity-100 duration-1000 md:delay-800 md:duration-500":
            isVisible,
        }
      )}
    >
      {children}
    </div>
  );
}

function Background({ isOnTop }: BackgroundProps) {
  return (
    <img
      src={landing}
      alt="landing background"
      className={cn(
        "absolute h-screen w-screen object-cover object-[50%_0] transition-[object-position] duration-1000 ease-in-out",
        {
          "object-[50%_100%]": !isOnTop,
        }
      )}
    />
  );
}

function Root({ children, setIsOnTop }: RootProps) {
  return (
    <div
      className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden"
      onWheel={(e) => e.deltaY && setIsOnTop(e.deltaY < 0)}
    >
      {children}
    </div>
  );
}

function App() {
  const [isOnTop, setIsOnTop] = useState(true);

  return (
    // Page root with scroll detector
    <Root setIsOnTop={setIsOnTop}>
      {/* Background */}
      <Background isOnTop={isOnTop} />
      <FoggyScreen />

      <Content>
        {/* Top section */}
        <Section isVisible={isOnTop}>
          <TopSection>
            <div className="lg:h-24"></div>
            <img src={landingTitle} alt={"Foghaven"} />
            <div className="flex flex-col items-center gap-2 font-semibold text-white text-xl uppercase tracking-wider antialiased md:text-2xl lg:text-4xl lg:tracking-wide">
              <p>Your sanctuary in the clouds</p>
              <p> Discover. Connect. Play.</p>
            </div>
            <div className="h-1"></div>
            <Link
              to="/store"
              className="flex h-14 w-60 items-center justify-center border-3 border-white bg-white/5 font-bold text-2xl text-white uppercase shadow-emerald-200 transition-all hover:border-6 hover:border-emerald-300/80 hover:bg-emerald-500/40 hover:font-extrabold hover:text-emerald-100 hover:shadow-2xl md:h-22 md:w-80"
              preload="render"
            >
              Explore
            </Link>
          </TopSection>
          <BottomSection>
            <Switch
              Icon={LucideChevronsDown}
              isVisible={isOnTop}
              setIsOnTop={setIsOnTop}
            />
          </BottomSection>
        </Section>

        {/* Bottom section */}
        <Section isVisible={!isOnTop}>
          <TopSection>
            <Switch
              Icon={LucideChevronsUp}
              isVisible={!isOnTop}
              setIsOnTop={setIsOnTop}
            />
            <img src={landingIntro} alt="game store project" />
          </TopSection>
          <BottomSection>
            <img src={landingAuthors} alt="Eric Cun and Quang Pham" />
          </BottomSection>
        </Section>
      </Content>
    </Root>
  );
}
