import type { PayPalCardFieldsStateObject } from "@paypal/paypal-js";
import type {
  FieldComponentName,
  RegisteredFields,
} from "@paypal/react-paypal-js";

// No fixed height here: the actual field content is a PayPal-hosted zoid iframe injected inside
// this wrapper at a height PayPal's own SDK controls (not exposed via any prop or style option we
// can set) — pinning a height on the wrapper just clips it. Leaving height unset lets the wrapper
// size itself to whatever PayPal renders, so nothing overflows regardless of what that turns out
// to be. A merchant who wants a specific height instead can still override it themselves.
export const CARD_FIELDS_INPUTS: string =
  "w-full mt-1.5 mb-4 text-base text-neutral-700";

export const CARD_FIELDS_PAY_BUTTON: string =
  "h-11 sm:h-14 my-2 mr-2 text-center w-full whitespace-nowrap border-2 inline-block font-normal align-middle select-none cursor-pointer text-base rounded py-1.5 px-3 border-sky-500 text-white bg-sky-500";

export const CARD_FIELDS_INVALID: string = "border-2 border-rose-600";

// Maps the per-field keys PayPalCardFieldsStateObject.fields uses to the FieldComponentName keys
// usePayPalCardFields()'s field registry uses for that same field.
export const STATE_FIELD_TO_REGISTRY_FIELD: Record<
  keyof PayPalCardFieldsStateObject["fields"],
  FieldComponentName
> = {
  cardNumberField: "NumberField",
  cardCvvField: "CVVField",
  cardExpiryField: "ExpiryField",
  cardNameField: "NameField",
};

// Toggles CARD_FIELDS_INVALID on each hosted field's own SDK-managed container, based on the
// field's validity reported by PayPalCardFieldsComponent.getState().
export const applyFieldValidationClasses = (
  state: PayPalCardFieldsStateObject,
  fields: RegisteredFields
): void => {
  (
    Object.keys(STATE_FIELD_TO_REGISTRY_FIELD) as Array<
      keyof PayPalCardFieldsStateObject["fields"]
    >
  ).forEach((stateKey) => {
    const fieldState = state.fields[stateKey];
    const isFieldValid =
      (fieldState.isValid || fieldState.isPotentiallyValid) &&
      !fieldState.isEmpty;
    const field = fields[STATE_FIELD_TO_REGISTRY_FIELD[stateKey]];
    if (isFieldValid) {
      field?.removeClass(CARD_FIELDS_INVALID);
    } else {
      field?.addClass(CARD_FIELDS_INVALID);
    }
  });
};

const ACTIONS: Record<string, string> = {
  YYPOSSIBLE: "threeDSAction_1",
  YYYES: "threeDSAction_2",
  YNNO: "threeDSAction_3",
  YRNO: "threeDSAction_4",
  YAPOSSIBLE: "threeDSAction_5",
  YUUNKNOWN: "threeDSAction_6",
  YUNO: "threeDSAction_7",
  YCUNKNOWN: "threeDSAction_8",
  YNO: "threeDSAction_9",
  NNO: "threeDSAction_10",
  UNO: "threeDSAction_11",
  UUNKNOWN: "threeDSAction_12",
  BNO: "threeDSAction_13",
  UNKNOWN: "threeDSAction_14",
};

export const getActionIndex = (
  enrollmentStatus: string,
  authenticationStatus: string,
  liabilityShift: string
): string => {
  const selector = enrollmentStatus.concat(
    authenticationStatus,
    liabilityShift
  );
  return ACTIONS[selector];
};
