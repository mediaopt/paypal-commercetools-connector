import { ShippingMethod, ShippingRate } from "@commercetools/platform-sdk";
import { CommercetoolsClient } from "@commercetools/connect-payments-sdk/dist/commercetools/types/api.type";
import { mapCommercetoolsMoneyToPayPalMoney } from "common-connect";
import { PayPalShippingOptionSchemaDTO } from "../dtos/paypal-payment.dto";
import { log } from "../libs/logger";

export type PayPalShippingOption = PayPalShippingOptionSchemaDTO; //Mirrors PayPal's own shipping_option schema

export const pickMatchingShippingRate = (
  method: ShippingMethod
): ShippingRate | undefined => {
  for (const zoneRate of method.zoneRates) {
    for (const shippingRate of zoneRate.shippingRates) {
      if (shippingRate.isMatching) {
        return shippingRate;
      }
    }
  }
  return undefined;
};

export const mapCommercetoolsShippingMethodToPayPalShippingOption = (
  method: ShippingMethod,
  selected: boolean
): PayPalShippingOption | undefined => {
  const matchingRate = pickMatchingShippingRate(method);
  if (!matchingRate) {
    return undefined;
  }

  return {
    id: method.id,
    label: method.localizedName
      ? Object.values(method.localizedName)[0]
      : method.name,
    type: "SHIPPING",
    amount: {
      currency_code: matchingRate.price.currencyCode,
      value: mapCommercetoolsMoneyToPayPalMoney(matchingRate.price),
    },
    selected,
  };
};

/** The commercetools-marked default method, falling back to the first result. */
const pickDefaultMethodId = (methods: ShippingMethod[]): string | undefined =>
  methods.find((m) => m.isDefault)?.id ?? methods[0]?.id;

const selectAndMapShippingOptions = (
  methods: ShippingMethod[],
  selectedMethodId?: string
): PayPalShippingOption[] => {
  const resolvedSelectedId = selectedMethodId ?? pickDefaultMethodId(methods);
  return methods
    .map((method) =>
      mapCommercetoolsShippingMethodToPayPalShippingOption(
        method,
        method.id === resolvedSelectedId
      )
    )
    .filter((option): option is PayPalShippingOption => option !== undefined);
};

export const fetchPayPalShippingOptionsForCart = async ({
  ctApiClient,
  cartId,
  currentMethodId,
}: {
  ctApiClient: CommercetoolsClient;
  cartId: string;
  currentMethodId?: string;
}): Promise<PayPalShippingOption[]> => {
  const response = await ctApiClient
    .shippingMethods()
    .matchingCart()
    .get({ queryArgs: { cartId } })
    .execute();

  const methods = response.body.results || [];
  if (!methods.length) {
    log.warn(`no shipping methods available for cart ${cartId}`);
    return [];
  }

  const options = selectAndMapShippingOptions(methods, currentMethodId);
  if (!options.length)
    log.warn(
      `no PayPal matching shipping for cart ${cartId}, even while commercetools ${methods.length} methods found`
    );
  return options;
};
