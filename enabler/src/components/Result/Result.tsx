import { FC } from "react";
import { ERROR_TEXT_STYLE, SUCCESS_TEXT_STYLE } from "../../styles";

type ResultProps = {
  success?: boolean;
  message?: string;
};

export const Result: FC<React.PropsWithChildren<ResultProps>> = ({
  success = true,
  message,
  children,
}) => {
  return (
    <div className={!success ? ERROR_TEXT_STYLE : SUCCESS_TEXT_STYLE}>
      {message ??
        (success
          ? "Thank you for your purchase!"
          : "Something went wrong, please try again")}

      <div>{children}</div>
    </div>
  );
};
