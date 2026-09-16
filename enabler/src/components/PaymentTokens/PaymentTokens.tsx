// LEGACY_STANDALONE_CLIENT_ONLY: unreachable from commercetools Checkout. This is the
// list/select/delete UI from the discontinued standalone paypal-commercetools-client — Checkout's
// stored-payment-method component is PayPalStoredBuilder/CardFieldsStored instead (Checkout owns
// the saved-card display/selection UI itself, so that component renders nothing). This component
// itself is untouched/working — kept for self-hosting merchants who mount these components
// directly outside Checkout (see enabler/README.md). Please open an issue if you are interested
// in wiring this into the Checkout SDK path.

import { FC } from "react";

import { PayPalContextProvider } from "../PayPalContextProvider";
import { PaymentTokensList } from "./PaymentTokensList";

import { SmartComponentsProps } from "../../types";

export const PaymentTokens: FC<SmartComponentsProps> = ({
  options,

  createPaymentUrl,
  getSettingsUrl,
  createOrderUrl,
  onApproveUrl,
  authorizeOrderUrl,
  getUserInfoUrl,
  removePaymentTokenUrl,

  requestHeader,
  shippingMethodId,
  cartInformation,
  purchaseCallback,
  enableVaulting,
  paymentMethodType,
  builderType,
  processorUrl,
}) => {
  return (
    <PayPalContextProvider
      options={options}
      requestHeader={requestHeader}
      shippingMethodId={shippingMethodId}
      cartInformation={cartInformation}
      createPaymentUrl={createPaymentUrl}
      createOrderUrl={createOrderUrl}
      onApproveUrl={onApproveUrl}
      getSettingsUrl={getSettingsUrl}
      purchaseCallback={purchaseCallback}
      authorizeOrderUrl={authorizeOrderUrl}
      getUserInfoUrl={getUserInfoUrl}
      enableVaulting={enableVaulting}
      removePaymentTokenUrl={removePaymentTokenUrl}
      paymentMethodType={paymentMethodType}
      builderType={builderType}
      processorUrl={processorUrl}
    >
      <PaymentTokensList />
    </PayPalContextProvider>
  );
};
