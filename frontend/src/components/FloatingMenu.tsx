import {
  Link,
  type LinkProps,
  useLocation,
  useNavigate,
  type UseNavigateResult,
} from "@tanstack/react-router";
import {
  type LucideIcon,
  LucideKeyRound,
  LucideLogOut,
  LucideMenu,
  LucideSearch,
  LucideStore,
  LucideUser,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { GameSearchFilter } from "./GameSearchFilter";
import { useLoggedIn } from "@/hooks/use-login-check";
import { logout } from "@/api/auth.requests";
import { toast } from "sonner";

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

type ActionElementProps = {
  action: ActionName;
  className?: string;
};

function logoutHandler(navigate: UseNavigateResult<string>) {
  logout()
    .then(() => {
      toast.success("Logout successfully");
      navigate({
        to: "/",
      });
    })
    .catch((errorMsg) => {
      toast.error("Unable to logout", {
        description: errorMsg,
      });
    });
}

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

const ActionElement = ({ action, className }: ActionElementProps) => {
  const navigate = useNavigate();
  switch (action) {
    case "profile":
      return (
        <ActionLink
          key="profile"
          to="/profile"
          Icon={LucideUser}
          label="Profile"
          className={className}
        />
      );
    case "store":
      return (
        <ActionLink
          key="store"
          to="/store"
          Icon={LucideStore}
          label="Store"
          className={className}
        />
      );
    case "login":
      return (
        <ActionLink
          key="login"
          to="/login"
          Icon={LucideKeyRound}
          label="Login/Register"
          className={className}
        />
      );
    case "logout":
      return (
        <ActionButton
          key="logout"
          Icon={LucideLogOut}
          label="Logout"
          className={className}
          onClick={logoutHandler.bind(null, navigate)}
        />
      );
    case "game_search":
      return (
        <ActionDialog
          key="game_search"
          label="Search"
          Icon={LucideSearch}
          Content={GameSearchFilter}
          className={className}
        />
      );
  }
};

type AllActionProps = {
  pathname: LinkTo;
  isLogin: boolean;
};

type ActionName = "profile" | "store" | "login" | "logout" | "game_search";

type ActionFunction = (props: AllActionProps) => boolean;

type AllActionsMap = Record<ActionName, ActionFunction>;

const ACTION_MAP: AllActionsMap = {
  logout: ({ isLogin }) => !!isLogin,
  login: ({ pathname, isLogin }) =>
    pathname !== "/login" && pathname !== "/register" && !isLogin,
  profile: ({ pathname, isLogin }) => pathname !== "/profile" && isLogin,
  store: ({ pathname }) => pathname !== "/store",
  game_search: ({ pathname }) => pathname === "/store",
};

const ALL_ACTION_NAMES = Object.keys(ACTION_MAP) as ActionName[];

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = useLocation({
    select: (location) => location.pathname as LinkProps["to"],
  });
  const isLogin = useLoggedIn();
  const actions = useMemo(
    () =>
      ALL_ACTION_NAMES.filter((action) =>
        ACTION_MAP[action]({ pathname, isLogin })
      ),
    [pathname, isLogin]
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
        {actions.map((action) => (
          <li
            key={action}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={() => setIsOpen(false)}
          >
            <ActionElement
              action={action}
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
