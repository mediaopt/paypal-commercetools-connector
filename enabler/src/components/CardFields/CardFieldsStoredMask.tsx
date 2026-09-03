import { useEffect, FC } from "react";

import { usePayment } from "../../app/usePayment";
import { useLoader } from "../../app/useLoader";

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
  const { handleCreateOrder } = usePayment();
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

  return null;
};
