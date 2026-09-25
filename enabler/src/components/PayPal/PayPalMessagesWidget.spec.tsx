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
