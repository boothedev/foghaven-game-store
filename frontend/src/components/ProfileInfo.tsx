import React, { useState, type ComponentProps, type FormEvent } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import type { PaymentCard, User } from "@/types";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  LucideAtSign,
  LucideCreditCard,
  LucideDollarSign,
  LucideFolderKanban,
  LucideGamepad2,
  LucidePlus,
  LucideTrash2,
  LucideUser,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import headerImage from "/header-profile.webp";
import { Switch } from "./ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  useCardAdd,
  useCardRemove,
  useUpdateAccount,
} from "@/api/auth.mutations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Field, FieldGroup, FieldLabel, FieldSet } from "./ui/field";
import { cardNumberFormat, centsToDollars, expFormat } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import type { VariantProps } from "class-variance-authority";

type ProfileInfoProps = ComponentProps<"div"> & {
  user: User;
};

type ButtonProps = VariantProps<typeof buttonVariants> & {
  asChild?: boolean;
};

type ProfileItem = {
  icon: React.ReactElement;
  label: string;
  value: string;
  ActionButton: React.FC<ButtonProps>;
};

type ActionDialogProps = ButtonProps & {
  label: string;
  popup: React.ReactElement;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

type AccountUpdateProps = {
  username: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type PaymentMethodProps = {
  cards: PaymentCard[];
};

type PaymentMethodManageProps = {
  cards: PaymentCard[];
  setState: React.Dispatch<React.SetStateAction<"manage" | "add">>;
};

type PaymentMethodAddProps = PaymentMethodManageProps;

type BalanceTopUpProps = {
  cards: PaymentCard[];
  balance: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function ActionDialog({
  label,
  popup,
  open,
  setOpen,
  ...props
}: ActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <Button {...props}>{label}</Button>
        </DialogTrigger>
        {popup}
      </form>
    </Dialog>
  );
}

function AccountUpdate({ username, setOpen }: AccountUpdateProps) {
  const mutation = useUpdateAccount();
  const [updatePassword, setUpdatePassword] = useState(false);

  const updateSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    let newUsername = data.get("new-username")?.toString();
    const newPassword = data.get("new-password")?.toString();
    const newPasswordConfirm = data.get("re-new-password")?.toString();
    const currentPassword = data.get("current-password")?.toString();

    if (newUsername === username) {
      newUsername = undefined;
    }

    if (newPassword !== newPasswordConfirm) {
      toast.warning("New passwords don't match");
      return;
    }

    const nothingToUpdate = [newPassword, newPasswordConfirm, username].every(
      (v) => v === undefined
    );
    if (nothingToUpdate) {
      return;
    }

    if (currentPassword === undefined || currentPassword.length === 0) {
      toast.warning("Missing current password");
      return;
    }
    mutation.mutate(
      {
        current_password: currentPassword,
        new_password: newPassword,
        new_username: newUsername,
      },
      {
        onSuccess: () => {
          toast.success("Updated user account");
          setOpen(false);
        },
      }
    );
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>
          Make changes to your profile. Click save when you&apos;re done.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={updateSubmitHandler} className="grid gap-4">
        <div className="grid gap-3">
          <Label htmlFor="new-username">Username</Label>
          <div className="relative h-fit">
            <Input
              id="new-username"
              name="new-username"
              placeholder="Username"
              defaultValue={username}
              autoComplete="username"
              className="pl-7 md:text-[1rem]"
            />
            <span className="absolute left-3 top-1/3">
              <LucideAtSign size={15} className="text-muted-foreground" />
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="update-password" onCheckedChange={setUpdatePassword} />
          <Label htmlFor="update-password">Change Password</Label>
        </div>
        {updatePassword && (
          <div className="grid gap-4 overflow-hidden border rounded-md p-4 animate-in fade-in duration-300">
            <div className="grid gap-3">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                name="new-password"
                placeholder="New Password"
                autoComplete="new-password"
                type="password"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="re-password">Re-enter New Password</Label>
              <Input
                id="re-new-password"
                name="re-new-password"
                placeholder="Re-enter New Password"
                autoComplete="new-password"
                type="password"
              />
            </div>
          </div>
        )}
        <div className="grid gap-3">
          <Label htmlFor="current-password">Current Password</Label>
          <Input
            id="current-password"
            name="current-password"
            placeholder="Current Password"
            autoComplete="current-password"
            type="password"
            required
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function BalanceTopUp({ cards, balance, setOpen }: BalanceTopUpProps) {
  const updateUserMutation = useUpdateAccount();
  const submitHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const fields = ["topup", "card-id", "password"];
    const inputData = fields.map((name) => formData.get(name)?.toString());
    const allFieldSet = inputData.every((value) => value !== undefined);
    if (!allFieldSet) {
      toast.warning("Some fields are missing");
      return;
    }
    const [topup, _cardId, password] = inputData;
    const data = {
      topup: Math.round(Number(topup) * 100),
      // cardId,
      current_password: password,
    };

    updateUserMutation.mutate(data, {
      onSuccess: () => {
        toast.success(`Added ${centsToDollars(data.topup)} to account`);
        setOpen(false);
      },
    });
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          Top up balance{" "}
          <span className="text-muted-foreground font-normal text-sm">
            ({balance})
          </span>
        </DialogTitle>
        <DialogDescription>
          Add money to your balance. Click process when you&apos;re done.
        </DialogDescription>
      </DialogHeader>
      {cards.length === 0 ? (
        <div className="text-muted-foreground text-sm self-center">
          The account doesn't have any payment card.
        </div>
      ) : (
        <form className="grid gap-4" onSubmit={submitHandler}>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="topup">Amount</Label>
              <div className="relative h-fit flex items-center">
                <Input
                  id="topup"
                  name="topup"
                  type="number"
                  placeholder="0.00"
                  defaultValue={10}
                  step={0.01}
                  min={0.01}
                  className="pl-7 md:text-[1rem]"
                  required
                />
                <span className="absolute left-3">
                  <LucideDollarSign
                    size={15}
                    className="text-muted-foreground"
                  />
                </span>
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="card-id">Payment Method</Label>
              <Select defaultValue={String(cards[0].id)} name="card-id">
                <SelectTrigger className="w-full font-mono" id="card-id">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cards.map(({ id, name, number, exp }) => (
                    <SelectItem
                      key={id}
                      value={String(id)}
                      className="font-mono"
                    >{`${`[${name}] `.padEnd(20, ".")} ${number} – ${exp}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Current Password</Label>
              <div className="relative h-fit flex items-center">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Process</Button>
          </DialogFooter>
        </form>
      )}
    </DialogContent>
  );
}

function PaymentMethod({ cards }: PaymentMethodProps) {
  const [state, setState] = useState<"manage" | "add">("manage");

  return (
    <DialogContent className="sm:max-w-[425px]">
      {state === "manage" && (
        <PaymentMethodManage cards={cards} setState={setState} />
      )}
      {state === "add" && (
        <PaymentMethodAdd cards={cards} setState={setState} />
      )}
    </DialogContent>
  );
}

function PaymentMethodManage({ cards, setState }: PaymentMethodManageProps) {
  const removeCardMutation = useCardRemove();
  const onRemoveCardHandler = ({ id, name, number, exp }: PaymentCard) =>
    removeCardMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`Card [${number}] has been removed`, {
          description: `${name} – ${exp}`,
        });
      },
    });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Manage Payment Methods</DialogTitle>
        <DialogDescription>
          Edit payments method. Click process when you&apos;re done.
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-72 w-full border-t border-b">
        <div className="p-4">
          {/* <h4 className="mb-4 text-sm leading-none font-medium">Tags</h4> */}

          <div className="flex w-full max-w-lg flex-col gap-6">
            {cards.length === 0 && (
              <div className="text-muted-foreground text-sm self-center">
                The account doesn't have any payment card.
              </div>
            )}
            {cards.map(({ id, name, number, exp }, index) => (
              <Item key={id} variant="outline">
                <ItemMedia
                  variant="icon"
                  className="text-lg text-muted-foreground font-medium"
                >
                  {cards.length - index}
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="tracking-wide">{name}</ItemTitle>
                  <ItemDescription className="font-mono">
                    {number} – {exp}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:text-destructive"
                    onClick={() => onRemoveCardHandler(cards[index])}
                  >
                    <LucideTrash2 />
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="sm:justify-between">
        <Button type="button" variant="ghost" onClick={() => setState("add")}>
          <LucidePlus />
          Add New Card
        </Button>
        {/* <DialogClose asChild>
          <Button variant="outline">Close</Button>
        </DialogClose> */}
      </DialogFooter>
    </>
  );
}

function PaymentMethodAdd({ setState }: PaymentMethodAddProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cvvNumber, setCvvNumber] = useState("");
  const addCardMutation = useCardAdd();

  const updateSubmitHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const values = [
      formData.get("card-name")?.toString(),
      formData.get("card-number")?.toString(),
      formData.get("exp-month")?.toString(),
      formData.get("exp-year")?.toString(),
      formData.get("card-cvv")?.toString(),
    ];

    const definedValues = values.filter((value) => value !== undefined);

    if (definedValues.length !== values.length) {
      return;
    }
    const [name, number, exp_month, exp_year, cvv] = definedValues;

    const newCard = {
      name,
      number: number.replaceAll(" ", ""),
      exp_month: Number(exp_month),
      exp_year: Number(exp_year),
      security_code: cvv,
    };
    addCardMutation.mutate(newCard, {
      onSuccess: () => {
        toast.success(`Card [${cardNumberFormat(number)}] has been added`, {
          description: `${name} – ${expFormat(newCard.exp_month, newCard.exp_year)}`,
        });
        setState("manage");
      },
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Payment Card</DialogTitle>
        <DialogDescription>
          Enter payments info. Click add when you&apos;re done.
        </DialogDescription>
      </DialogHeader>
      <div className="w-full max-w-md px-2">
        <form onSubmit={updateSubmitHandler}>
          <FieldGroup>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="card-name">Name on Card</FieldLabel>
                  <Input
                    id="card-name"
                    name="card-name"
                    placeholder="John Doe"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="card-number">Card Number</FieldLabel>
                  <Input
                    id="card-number"
                    name="card-number"
                    placeholder="1234 5678 9012 3456"
                    onInput={(e) =>
                      setCardNumber(
                        e.currentTarget.value
                          .replaceAll(/\D/g, "")
                          .replace(/(.{4})/g, "$1 ")
                          .trimEnd()
                      )
                    }
                    maxLength={16 + 3}
                    minLength={16 + 3}
                    value={cardNumber}
                    className="font-mono tracking-wider md:text-[1rem]"
                    autoComplete="cc-name"
                    required
                  />
                </Field>
                <div className="grid grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel htmlFor="exp-month">Month</FieldLabel>

                    <Select name="exp-month">
                      <SelectTrigger id="exp-month">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(12)].map((_, index) => {
                          const value = String(index + 1).padStart(2, "0");
                          return (
                            <SelectItem
                              key={value}
                              value={value}
                              className="font-mono"
                            >
                              {value}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="exp-year">Year</FieldLabel>
                    <Select name="exp-year">
                      <SelectTrigger id="exp-year">
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(7)].map((_, index) => {
                          const value = String(index + 2025).padStart(4, "0");
                          return (
                            <SelectItem
                              key={value}
                              value={value}
                              className="font-mono"
                            >
                              {value}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="card-cvv">CVV</FieldLabel>
                    <Input
                      id="card-cvv"
                      name="card-cvv"
                      placeholder="123"
                      minLength={3}
                      maxLength={3}
                      value={cvvNumber}
                      onInput={(e) =>
                        setCvvNumber(
                          e.currentTarget.value.replaceAll(/\D/g, "")
                        )
                      }
                      required
                    />
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>
            <DialogFooter className="sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setState("manage")}
              >
                <LucideFolderKanban />
                Manage Cards
              </Button>
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Submit</Button>
              </div>
            </DialogFooter>
          </FieldGroup>
        </form>
      </div>
    </>
  );
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const { username, balance, cards } = user;
  const [openUpdateAccount, setOpenUpdateAccount] = useState<boolean>(false);
  const [openBalance, setOpenBalance] = useState<boolean>(false);
  const items: ProfileItem[] = [
    {
      label: "Username",
      value: `@${username}`,
      icon: <LucideUser />,
      ActionButton: ({ ...props }) => (
        <ActionDialog
          label="Update"
          open={openUpdateAccount}
          setOpen={setOpenUpdateAccount}
          popup={
            <AccountUpdate username={username} setOpen={setOpenUpdateAccount} />
          }
          {...props}
        />
      ),
    },
    {
      label: "Game Library",
      value:
        user.owned === 0
          ? "Empty"
          : `${user.owned} game${user.owned === 1 ? "" : "s"}`,
      icon: <LucideGamepad2 />,
      ActionButton: ({ ...props }) => (
        <Button {...props}>
          <Link to="/store" search={{ owned: true }}>
            Explore
          </Link>
        </Button>
      ),
    },
    {
      label: "Balance",
      value: balance,
      icon: <LucideDollarSign />,
      ActionButton: ({ ...props }) => (
        <ActionDialog
          label="Top up"
          open={openBalance}
          setOpen={setOpenBalance}
          popup={
            <BalanceTopUp
              cards={cards}
              balance={balance}
              setOpen={setOpenBalance}
            />
          }
          {...props}
        />
      ),
    },
    {
      label: "Payment Methods",
      value:
        cards.length === 0
          ? "No payment card"
          : `${cards.length} item${cards.length === 1 ? "" : "s"}`,
      icon: <LucideCreditCard />,
      ActionButton: ({ ...props }) => (
        <ActionDialog
          label="Manage"
          popup={<PaymentMethod cards={cards} />}
          {...props}
        />
      ),
    },
  ];

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-muted relative lg:block grid place-content-center justify-items-center">
        <img
          src={headerImage}
          alt="My Arcana"
          className="absolute inset-0 size-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
        <h1 className="font-title block text-center absolute font-medium text-9xl text-background text-shadow-blue-300/70 text-shadow-md tracking-wide align-middle -translate-y-2/3 transition-all md:scale-100 lg:scale-120">
          My <br />
          Arcana
        </h1>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="flex w-full max-w-lg flex-col gap-6">
              {items.map(({ icon, label, value, ActionButton }) => (
                <Item key={label} variant="outline">
                  <ItemMedia variant="icon">{icon}</ItemMedia>
                  <ItemContent>
                    <ItemTitle className="tracking-wide">{label}</ItemTitle>
                    <ItemDescription>{value}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <ActionButton size="sm" variant="outline" />
                  </ItemActions>
                </Item>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
