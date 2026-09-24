import { useEffect, FC } from "react";

import { usePayment } from "../../app/usePayment";
import { useLoader } from "../../app/useLoader";
import { redirectTo } from "../../helpers/redirectTo";

import { CardFieldsProps, FormComponentProps } from "../../types";

export type CardFieldsStoredMaskProps = Pick<
  FormComponentProps,
  "onRegisterSubmit"
> &
  Pick<CardFieldsProps, "onError"> & {
    ppVaultTokenId: string;
  };

/**
 * Checkout's own stored-payment-methods component already renders the saved card's
 * display/selection UI and only asks this component to charge it
 */
export const CardFieldsStoredMask: FC<CardFieldsStoredMaskProps> = ({
  onRegisterSubmit,
  ppVaultTokenId,
  onError,
}) => {
  const { handleCreateOrder, orderDataLinks, orderId } = usePayment();
  const { isLoading } = useLoader();

  useEffect(() => {
    onRegisterSubmit?.(async () => {
      isLoading(true);
      try {
        // isCheckoutCard: rethrow instead of resolving "" — Checkout only has submit()'s promise
        // to tell a failed charge apart from a successful one
        await handleCreateOrder(
          {
            paymentSource: "card",
            storeInVault: false,
            vaultId: ppVaultTokenId,
          },
          true
        );
      } catch (error) {
        // handleCreateOrder already showed its own notification
        const message =
          error instanceof Error ? error.message : String(error);
        onError?.({ code: message, message });
        throw error;
      } finally {
        isLoading(false);
      }
    });
  }, []);

  // A stored-card charge can also come back PAYER_ACTION_REQUIRED (e.g. the saved token needs a fresh authentication) —
  // same handling as CardFieldsMask.tsx's
  useEffect(() => {
    const orderPayerAction = orderDataLinks?.filter(
      (orderDataLink) => orderDataLink.rel === "payer-action"
    );

    if (orderPayerAction && orderPayerAction[0]) {
      redirectTo(orderPayerAction[0].href);
    }
  }, [orderDataLinks, orderId]);

  return null;
};
