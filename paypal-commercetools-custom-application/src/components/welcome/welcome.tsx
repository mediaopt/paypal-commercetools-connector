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

const Welcome = () => {
  return (
    <Constraints.Horizontal max={16}>
      <Spacings.Inset scale="m">
        <Spacings.Stack scale="m" alignItems="stretch">
          <Text.Headline as="h3" intlMessage={messages.title} />
          <Link isExternal={false} to="settings">
            PayPal general settings
          </Link>
          <Link isExternal={false} to="payPalCheckoutButtons">
            Checkout buttons settings
          </Link>
          <Link isExternal={false} to="payPalPayLater">
            PayLater settings
          </Link>
          <Link isExternal={false} to="threeDS">
            3D Secure settings
          </Link>
          <Link isExternal={false} to="ratePay">
            RatePay settings
          </Link>
          <Link isExternal={false} to="tracking">
            Parcel tracking settings
          </Link>
          <Link isExternal={false} to="ccFields">
            Credit card field settings
          </Link>
        </Spacings.Stack>
      </Spacings.Inset>
    </Constraints.Horizontal>
  );
};
Welcome.displayName = 'Welcome';

export default Welcome;
