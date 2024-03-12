import type { ReactNode } from 'react';
import Constraints from '@commercetools-uikit/constraints';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import Link from '@commercetools-uikit/link';
import Spacings from '@commercetools-uikit/spacings';

type TWrapWithProps = {
  children: ReactNode;
  condition: boolean;
  wrapper: (children: ReactNode) => ReactNode;
};
const WrapWith = (props: TWrapWithProps) => (
  <>{props.condition ? props.wrapper(props.children) : props.children}</>
);
WrapWith.displayName = 'WrapWith';

const entryPointUriPath = '${env:ENTRY_POINT_URI_PATH}';

const Welcome = () => {
  return (
    <Constraints.Horizontal max={16}>
      <Spacings.Inset scale="m">
        <Spacings.Stack scale="m" alignItems="stretch">
          <Text.Headline as="h3" intlMessage={messages.title} />
          <Link isExternal={false} to={`${entryPointUriPath}/settings`}>
            PayPal general settings
          </Link>
          <Link
            isExternal={false}
            to={`${entryPointUriPath}/payPalCheckoutButtons`}
          >
            Checkout buttons settings
          </Link>
          <Link isExternal={false} to={`${entryPointUriPath}/payPalPayLater`}>
            PayLater settings
          </Link>
          <Link isExternal={false} to={`${entryPointUriPath}/threeDS`}>
            3D Secure settings
          </Link>
          <Link isExternal={false} to={`${entryPointUriPath}/ratePay`}>
            RatePay settings
          </Link>
          <Link isExternal={false} to={`${entryPointUriPath}/tracking`}>
            Parcel tracking settings
          </Link>
          <Link isExternal={false} to={`${entryPointUriPath}/ccFields`}>
            Credit card field settings
          </Link>
        </Spacings.Stack>
      </Spacings.Inset>
    </Constraints.Horizontal>
  );
};
Welcome.displayName = 'Welcome';

export default Welcome;
