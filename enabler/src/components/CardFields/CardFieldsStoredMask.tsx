import { useEffect, FC } from "react";

import { usePayment } from "../../app/usePayment";
import { useLoader } from "../../app/useLoader";
import { redirectTo } from "../../helpers/redirectTo";

import { FormComponentProps } from "../../types";

export type CardFieldsStoredMaskProps = Pick<
  FormComponentProps,
  "onRegisterSubmit"
> & {
  ppVaultTokenId: string;
};

/**
 * Checkout's own stored-payment-methods component already renders the saved card's
 * display/selection UI and only asks this component to charge it
 */
export const CardFieldsStoredMask: FC<CardFieldsStoredMaskProps> = ({
  onRegisterSubmit,
  ppVaultTokenId,
}) => {
  const { handleCreateOrder, orderDataLinks, orderId } = usePayment();
  const { isLoading } = useLoader();

  useEffect(() => {
    onRegisterSubmit?.(async () => {
      isLoading(true);
      await handleCreateOrder({
        paymentSource: "card",
        storeInVault: false,
        vaultId: ppVaultTokenId,
      });
      isLoading(false);
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
