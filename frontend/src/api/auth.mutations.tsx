import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addPaymentCard,
  login,
  logout,
  purchaseGame,
  removePaymentCard,
  updateUser,
} from "./auth.requests";
import { toast } from "sonner";
import { gameQueries } from "./games.queries";
import { authQueries } from "./auth.queries";

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: authQueries.currentUser().queryKey,
      });
    },
    onError: ({ message }) => {
      toast.warning("Unable to process", {
        description: message,
      });
    },
  });
};

export const useLogIn = () => {
  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      toast.success("Login successfully!");
    },
    onError: ({ message }) => {
      toast.warning("Unable to login", {
        description: message,
      });
    },
  });
};

export const useLogOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast.success("Logout successfully!");
      queryClient.invalidateQueries({
        queryKey: authQueries.currentUser().queryKey,
      });
    },
    onError: ({ message }) => {
      toast.warning("Unable to logout", {
        description: message,
      });
    },
  });
};

export const useCardRemove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removePaymentCard,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: authQueries.currentUser().queryKey,
      });
    },
    onError: ({ message }) => {
      toast.warning("Unable to remove payment card", {
        description: message,
      });
    },
  });
};

export const useCardAdd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPaymentCard,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: authQueries.currentUser().queryKey,
      });
    },
    onError: ({ message }) => {
      toast.warning("Unable to add payment card", {
        description: message,
      });
    },
  });
};

export const useGamePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseGame,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: authQueries.currentUser().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: gameQueries.one(variables).queryKey,
      });
      toast.success("Purchase Successful!");
    },
    onError: ({ message }) => {
      toast.warning("Unable to purchase", {
        description: message,
      });
    },
  });
};
