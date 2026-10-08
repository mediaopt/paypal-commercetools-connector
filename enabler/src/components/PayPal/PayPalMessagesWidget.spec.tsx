import { render } from "@testing-library/react";

let capturedProps: any;
const mockUsePayPalScriptReducer = jest.fn();
jest.mock("@paypal/react-paypal-js", () => ({
  PayPalMessages: (props: any) => {
    capturedProps = props;
    return null;
  },
  usePayPalScriptReducer: () => mockUsePayPalScriptReducer(),
}));
const mockUsePayment = jest.fn(() => ({ createsPaymentOnClick: false }));
jest.mock("../../app/usePayment", () => ({
  usePayment: () => mockUsePayment(),
}));

import { PayPalMessagesWidget } from "./PayPalMessagesWidget";

const paymentInfo = {
  countryCode: "DE",
  amountPlanned: { centAmount: 1000, currencyCode: "EUR", fractionDigits: 2 },
} as any;

describe("PayPalMessagesWidget eligibility guard", () => {
  const originalPaypal = (window as any).paypal;

  beforeEach(() => {
    capturedProps = undefined;
    mockUsePayPalScriptReducer.mockReset();
    (window as any).paypal = originalPaypal;
  });

  afterAll(() => {
    (window as any).paypal = originalPaypal;
  });

  it("does not render <PayPalMessages/> when the script hasn't resolved yet", () => {
    mockUsePayPalScriptReducer.mockReturnValue([
      { isResolved: false },
      jest.fn(),
    ]);
    (window as any).paypal = { Messages: jest.fn() };

    const { container } = render(
      <PayPalMessagesWidget
        paypalMessages={undefined}
        fundingSource="paypal"
        paymentInfo={paymentInfo}
        isExpress={false}
        messagesStyle={undefined}
      />
    );

    expect(container).toBeEmptyDOMElement();
    expect(capturedProps).toBeUndefined();
  });

  it("does not render <PayPalMessages/> when the script resolved but window.paypal.Messages is missing (e.g. express's 'messages' SDK component wasn't loaded) — avoids the 'window.paypal.Messages is undefined' crash", () => {
    mockUsePayPalScriptReducer.mockReturnValue([
      { isResolved: true },
      jest.fn(),
    ]);
    (window as any).paypal = {};

    const { container } = render(
      <PayPalMessagesWidget
        paypalMessages={undefined}
        fundingSource="paypal"
        paymentInfo={paymentInfo}
        isExpress
        messagesStyle={undefined}
      />
    );

    expect(container).toBeEmptyDOMElement();
    expect(capturedProps).toBeUndefined();
  });

  it("renders <PayPalMessages/> once the script resolved and window.paypal.Messages is available", () => {
    mockUsePayPalScriptReducer.mockReturnValue([
      { isResolved: true },
      jest.fn(),
    ]);
    (window as any).paypal = { Messages: jest.fn() };

    render(
      <PayPalMessagesWidget
        paypalMessages={undefined}
        fundingSource="paypal"
        paymentInfo={paymentInfo}
        isExpress
        messagesStyle={undefined}
      />
    );

    expect(capturedProps).toMatchObject({
      currency: "EUR",
      amount: "10.00",
      placement: "product",
    });
  });
});

describe("PayPalMessagesWidget PayPal Express before the click", () => {
  const originalPaypal = (window as any).paypal;
  // No Payment yet: PaymentInfoInitialObject-like
  const emptyPaymentInfo = {
    id: "",
    amountPlanned: { centAmount: 0, currencyCode: "", fractionDigits: 2 },
  } as any;
  const initialAmount = {
    centAmount: 2000,
    currencyCode: "EUR",
    fractionDigits: 2,
  };

  const renderWidget = (props: Record<string, unknown>) =>
    render(
      <PayPalMessagesWidget
        paypalMessages={undefined}
        fundingSource="paypal"
        paymentInfo={emptyPaymentInfo}
        isExpress
        messagesStyle={undefined}
        initialAmount={initialAmount}
        {...props}
      />
    );

  beforeEach(() => {
    capturedProps = undefined;
    mockUsePayment.mockReturnValue({ createsPaymentOnClick: true });
    mockUsePayPalScriptReducer.mockReturnValue([
      { isResolved: true },
      jest.fn(),
    ]);
    (window as any).paypal = { Messages: jest.fn() };
  });

  afterAll(() => {
    mockUsePayment.mockReturnValue({ createsPaymentOnClick: false });
    (window as any).paypal = originalPaypal;
  });

  it.each<[string, Record<string, unknown>, Record<string, unknown>]>([
    [
      "uses Checkout's initialAmount for a supported countryCode",
      { countryCode: "DE" },
      { currency: "EUR", amount: "20.00", placement: "product" },
    ],
    [
      "lets PayPal decide eligibility when Checkout passed no countryCode",
      {},
      { amount: "20.00", currency: "EUR" },
    ],
    [
      "switches to the cart's amount once the click created the Payment",
      { countryCode: "DE", paymentInfo: { ...paymentInfo, id: "payment-1" } },
      { amount: "10.00", currency: "EUR" },
    ],
  ])("%s", (_, props, expected) => {
    renderWidget(props);

    expect(capturedProps).toMatchObject(expected);
  });

  it.each<[string, Record<string, unknown>]>([
    ["renders nothing for an unsupported countryCode", { countryCode: "NL" }],
    [
      "switches to the cart's country once the click created the Payment",
      {
        countryCode: "DE",
        paymentInfo: { ...paymentInfo, id: "payment-1", countryCode: "NL" },
      },
    ],
  ])("%s", (_, props) => {
    renderWidget(props);

    expect(capturedProps).toBeUndefined();
  });

  it("ignores initialAmount for a component that doesn't create its Payment on click", () => {
    mockUsePayment.mockReturnValue({ createsPaymentOnClick: false });

    renderWidget({});

    expect(capturedProps).toBeUndefined();
  });
});
