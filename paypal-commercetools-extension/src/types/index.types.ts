import { UpdateAction } from '@commercetools/sdk-client-v2';

export type Message = {
  code: string;
  message: string;
  referencedBy: string;
};

export type ValidatorCreator = (
  path: string[],
  message: Message,
  overrideConfig?: object
) => [string[], [[(o: object) => boolean, string, [object]]]];

export type ValidatorFunction = (o: object) => boolean;

export type Wrapper = (
  validator: ValidatorFunction
) => (value: object) => boolean;

export type UpdateActions = Array<UpdateAction>;

export type StringOrObject = string | object;

export type ClientTokenRequest = {
  customerId?: string;
  merchantAccountId?: string;
  options?: {
    failOnDuplicatePaymentMethod?: boolean;
    makeDefault?: boolean;
    verifyCard?: boolean;
  };
  version?: string;
};
