import { FC } from "react";

import { usePayment } from "../../app/usePayment";
import { CardFieldsMask } from "./CardFieldsMask";
import { CardFieldsProps } from "../../types";

export const CardFieldsButton: FC<CardFieldsProps> = ({
  enableVaulting,
  onRegisterSubmit,
  onRegisterValidation,
}) => {
  const { paymentInfo, vaultOnly } = usePayment();

  // onRegisterSubmit/onRegisterValidation are only ever supplied in Checkout mode (see
  // PayPalComponent.mount() in PayPalBuilder.ts) — self-hosted merchants never set either, so this
  // leaves that mode's enableVaulting contract untouched. A vaulted card can only be found again
  // via a commercetools customer (see getStoredPaymentMethods()'s ctCustomerId-based lookup), so in
  // Checkout mode specifically, force vaulting off for an anonymous shopper rather than offering to
  // save a card with no way to ever retrieve it.
  const isCheckout = !!(onRegisterSubmit || onRegisterValidation);
  const resolvedEnableVaulting =
    isCheckout && !paymentInfo.ctCustomerId ? false : enableVaulting;

  return paymentInfo.id || vaultOnly ? (
    <CardFieldsMask
      enableVaulting={resolvedEnableVaulting}
      onRegisterSubmit={onRegisterSubmit}
      onRegisterValidation={onRegisterValidation}
    />
  ) : (
    <></>
  );
};
