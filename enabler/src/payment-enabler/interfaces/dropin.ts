import { PaymentComponent } from "./enabler";

export type DropinType = string;

export interface PaymentDropinBuilder {
  componentHasSubmit: boolean;
  build(): PaymentComponent;
}
