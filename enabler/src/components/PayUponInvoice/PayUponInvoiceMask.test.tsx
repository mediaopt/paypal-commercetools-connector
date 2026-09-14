import { PayUponInvoiceMask } from "./PayUponInvoiceMask";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { usePayment } from "../../app/usePayment";

jest.mock("react-i18next", () => ({
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));
jest.mock("../../app/usePayment");

const fraudNetSessionId = "123";

const phoneLabel = "interface.phoneNumber";
const birthDateLabel = "interface.birthDate";

const validPhone = "+49 123456789";
const wrongFormatPhone = "+49123456 789";
const tooLongPhone = "+49 123456789999999999999";
const tooShortPhone = "+49";

const validBirthDate = "1990-05-12";
const tooEarlyBirthDate = "0001-05-12";
let currentDate = new Date();
const tooLateBirthDate = currentDate.toJSON().slice(0, 10);
currentDate.setFullYear(currentDate.getFullYear() - 18);
const eighteenToday = currentDate.toJSON().slice(0, 10);
currentDate.setFullYear(currentDate.getFullYear() + 1);
const belowEighteen = currentDate.toJSON().slice(0, 10);

const mockedHandler = jest.fn();
beforeEach(() => {
  (usePayment as jest.Mock).mockReturnValue({
    handleCreateOrder: () => {
      mockedHandler();
    },
  });
  render(<PayUponInvoiceMask fraudNetSessionId={fraudNetSessionId} />);
});

afterEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
  cleanup();
});

test("Mask is shown if dependencies provided", () => {
  expect(screen.getAllByRole("button").length).toEqual(1);
  expect(screen.getAllByText("invoice.invoiceBenefitsMessage").length).toEqual(
    1,
  );
  expect(screen.getAllByLabelText(phoneLabel).length).toEqual(1);
  expect(screen.getAllByLabelText(birthDateLabel).length).toEqual(1);
});

test("Custom message is shown if provided", () => {
  cleanup();
  render(
    <PayUponInvoiceMask
      fraudNetSessionId={fraudNetSessionId}
      invoiceBenefitsMessage={"Custom message"}
    />,
  );
  expect(screen.getAllByText("Custom message").length).toEqual(1);
});

test(`${validBirthDate} input value for birthdate for invoice payments is valid`, () => {
  const birthDate = screen.getByLabelText(birthDateLabel) as HTMLInputElement;
  fireEvent.change(birthDate, {
    target: { value: validBirthDate },
  });
  expect(birthDate).toBeValid();
});

test(`${validPhone} value for phone for invoice payment is valid`, () => {
  const phone = screen.getByLabelText(phoneLabel) as HTMLInputElement;
  fireEvent.change(phone, {
    target: { value: validPhone },
  });
  expect(phone).toBeValid();
});

test(`${wrongFormatPhone} input value for the phone is formatted to ${validPhone}`, () => {
  const phone = screen.getByLabelText(phoneLabel) as HTMLInputElement;
  fireEvent.change(phone, {
    target: { value: wrongFormatPhone },
  });
  expect(phone.value).toEqual(validPhone);
});

test(`${tooLongPhone} is invalid`, () => {
  const phone = screen.getByLabelText(phoneLabel) as HTMLInputElement;
  fireEvent.change(phone, {
    target: { value: tooLongPhone },
  });
  expect(phone).toBeInvalid();
});

test(`${tooShortPhone} is invalid`, () => {
  const phone = screen.getByLabelText(phoneLabel) as HTMLInputElement;
  fireEvent.change(phone, {
    target: { value: tooShortPhone },
  });
  expect(phone).toBeInvalid();
});

test(`${tooEarlyBirthDate} birth date is invalid`, async () => {
  const birthDate = screen.getByLabelText(birthDateLabel);
  fireEvent.change(birthDate, {
    target: { value: tooEarlyBirthDate },
  });
  expect(birthDate).toBeInvalid();
});

test(`${tooLateBirthDate} birth date is invalid`, async () => {
  const birthDate = screen.getByLabelText(birthDateLabel);
  fireEvent.change(birthDate, {
    target: { value: tooLateBirthDate },
  });
  expect(birthDate).toBeInvalid();
});

test(`${eighteenToday} birth date is valid`, async () => {
  const birthDate = screen.getByLabelText(birthDateLabel);
  fireEvent.change(birthDate, {
    target: { value: eighteenToday },
  });
  expect(birthDate).toBeValid();
});

test(`${belowEighteen} birth date is invalid`, async () => {
  const birthDate = screen.getByLabelText(birthDateLabel);
  fireEvent.change(birthDate, {
    target: { value: belowEighteen },
  });
  expect(birthDate).toBeInvalid();
});

test("Form with vailid input data is submitted", async () => {
  const phone = screen.getByLabelText(phoneLabel);
  fireEvent.change(phone, {
    target: { value: validPhone },
  });
  const birthDate = screen.getByLabelText(birthDateLabel);
  fireEvent.change(birthDate, {
    target: { value: validBirthDate },
  });
  fireEvent.submit(screen.getByText("Pay"));
  await waitFor(() => expect(mockedHandler).toHaveBeenCalled());
});

test("Form with invailid phone is not submitted", async () => {
  const phone = screen.getByLabelText(phoneLabel);
  fireEvent.change(phone, {
    target: { value: tooShortPhone },
  });
  fireEvent.submit(screen.getByText("Pay"));
  await waitFor(() => expect(mockedHandler).not.toHaveBeenCalled());
});
