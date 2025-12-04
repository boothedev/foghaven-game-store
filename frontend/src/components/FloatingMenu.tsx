import { Link, type LinkProps, useLocation } from "@tanstack/react-router";
import {
  type LucideIcon,
  LucideKeyRound,
  LucideLogOut,
  LucideMenu,
  LucideSearch,
  LucideStore,
  LucideUser,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { GameSearchFilter } from "./GameSearchFilter";
import { useCookieUpdate } from "@/hooks/use-cookie-update";
import { useLogOut } from "@/api/auth.mutations";

type ReactNode = React.ReactNode;

type LabelProps = {
  children: ReactNode;
};
type ButtonIconProps = {
  Icon: LucideIcon;
};

type ActionInfoProps = {
  label: string;
  className?: string;
  Icon: LucideIcon;
};

type LinkTo = LinkProps["to"];

type ActionButtonProps = ActionInfoProps & {
  onClick: () => void;
};

type ActionLinkProps = ActionInfoProps & {
  to: LinkTo;
};

type ActionDialogProps = ActionInfoProps & {
  Content: typeof DialogContent;
};

type ButtonWrapperProps = {
  children: ReactNode;
  className?: string;
  asChild?: boolean | undefined;
};

type AllActionProps = {
  pathname: LinkTo;
  isAuth: boolean;
};

type ActionName = "profile" | "store" | "login" | "logout" | "game_search";

type ActionFunction = (props: AllActionProps) => boolean;

type AllActionsMap = Record<ActionName, ActionFunction>;

function Label({ children }: LabelProps) {
  return (
    <div className="-left-4 -translate-x-full absolute hidden text-balance rounded-2xl bg-foreground/80 px-4 py-2 font-bold text-background drop-shadow-background/30 drop-shadow-sm group-hover:block">
      {children}
    </div>
  );
}

function ButtonIcon({ Icon }: ButtonIconProps) {
  return <Icon className="pointer-events-none size-6" />;
}

function ActionLink({ to, label, Icon, className }: ActionLinkProps) {
  return (
    <ButtonWrapper className={className} asChild>
      <Link to={to}>
        <Label>{label}</Label>
        <ButtonIcon Icon={Icon} />
      </Link>
    </ButtonWrapper>
  );
}

function ActionDialog({ label, className, Icon, Content }: ActionDialogProps) {
  return (
    <Dialog>
      <ButtonWrapper className={className} asChild>
        <DialogTrigger>
          <Label>{label}</Label>
          <ButtonIcon Icon={Icon} />
        </DialogTrigger>
      </ButtonWrapper>
      <Content />
    </Dialog>
  );
}

function ActionButton({ label, Icon, ...props }: ActionButtonProps) {
  return (
    <ButtonWrapper {...props}>
      <Label>{label}</Label>
      <ButtonIcon Icon={Icon} />
    </ButtonWrapper>
  );
}

function ButtonWrapper({
  children,
  asChild,
  className,
  ...props
}: ButtonWrapperProps) {
  return (
    <Button
      className={cn(
        "group relative cursor-pointer rounded-full ease-in hover:my-1",
        className
      )}
      type="button"
      asChild={asChild}
      {...props}
    >
      {children}
    </Button>
  );
}

function ProfileElement({ ...props }) {
  return (
    <ActionLink
      key="profile"
      to="/profile"
      Icon={LucideUser}
      label="Profile"
      {...props}
    />
  );
}

function StoreElement({ ...props }) {
  return (
    <ActionLink
      key="store"
      to="/store"
      Icon={LucideStore}
      label="Store"
      {...props}
    />
  );
}

function LogInElement({ ...props }) {
  return (
    <ActionLink
      key="login"
      to="/login"
      Icon={LucideKeyRound}
      label="Login/Register"
      {...props}
    />
  );
}

function GameSearchElement({ ...props }) {
  return (
    <ActionDialog
      key="game_search"
      label="Search"
      Icon={LucideSearch}
      Content={GameSearchFilter}
      {...props}
    />
  );
}

function LogOutElement({ ...props }) {
  const logoutMutation = useLogOut();
  const logoutHandler = () => {
    logoutMutation.mutate();
  };
  return (
    <ActionButton
      key="logout"
      Icon={LucideLogOut}
      label="Logout"
      onClick={logoutHandler}
      {...props}
    />
  );
}

const ACTION_MAP: AllActionsMap = {
  logout: ({ isAuth }) => isAuth,
  login: ({ pathname, isAuth }) =>
    pathname !== "/login" && pathname !== "/register" && !isAuth,
  profile: ({ pathname, isAuth: isAuth }) => pathname !== "/profile" && isAuth,
  store: ({ pathname }) => pathname !== "/store",
  game_search: ({ pathname }) => pathname === "/store",
};

type Element = ({ ...props }: { [x: string]: any }) => React.JSX.Element;
type ActionElementMap = Record<ActionName, Element>;

const ACTION_ELEMENT_MAP: ActionElementMap = {
  logout: LogOutElement,
  login: LogInElement,
  profile: ProfileElement,
  store: StoreElement,
  game_search: GameSearchElement,
};

const ALL_ACTION_NAMES = Object.keys(ACTION_MAP) as ActionName[];

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = useLocation({
    select: (location) => location.pathname as LinkProps["to"],
  });
  const { isAuthenticated } = useCookieUpdate();

  const actions = useMemo(
    () =>
      ALL_ACTION_NAMES.filter((name) =>
        ACTION_MAP[name]({ pathname, isAuth: isAuthenticated })
      ).map((name) => ({
        name,
        ActionElement: ACTION_ELEMENT_MAP[name],
      })),
    [pathname, isAuthenticated]
  );

  return (
    <nav>
      <ul
        className={cn(
          "fixed right-4 bottom-4 flex flex-col items-center justify-center gap-1 rounded-t-full rounded-b-full p-2 font-bold transition-all duration-500",
          {
            "bg-sidebar-primary-foreground/80": isOpen,
            "bg-transparent": !isOpen,
          }
        )}
        onBlur={() => setIsOpen(false)}
      >
        {actions.map(({ name, ActionElement }) => (
          <li
            key={name}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={() => setIsOpen(false)}
          >
            <ActionElement
              className={cn({
                "pointer-events-auto size-16 opacity-100": isOpen,
                "pointer-events-none translate-y-full opacity-0": !isOpen,
              })}
            />
          </li>
        ))}
        <li>
          <Button
            className={cn("cursor-pointer rounded-full shadow-md", {
              "size-0": isOpen,
              "size-16": !isOpen,
            })}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <LucideMenu
              className={cn("size-6", {
                "text-transparent": isOpen,
                "text-current": !isOpen,
              })}
            />
          </Button>
        </li>
      </ul>
    </nav>
  );
}
