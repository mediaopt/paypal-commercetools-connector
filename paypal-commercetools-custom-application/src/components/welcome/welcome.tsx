import type { ReactElement, ReactNode } from 'react';
import Constraints from '@commercetools-uikit/constraints';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import Link from '@commercetools-uikit/link';
import Spacings from '@commercetools-uikit/spacings';
import { entryPointUriPath } from '../../constants';
import { PAYMENT_TITLES } from '../constants';

type TWrapWithProps = {
  children: ReactNode;
  condition: boolean;
  wrapper: (children: ReactNode) => ReactNode;
};
const WrapWith = (props: TWrapWithProps) => (
  <>{props.condition ? props.wrapper(props.children) : props.children}</>
);
WrapWith.displayName = 'WrapWith';

const Welcome = (): ReactElement => {
  return (
    <Constraints.Horizontal max={16}>
      <Spacings.Inset scale="m">
        <Spacings.Stack scale="m" alignItems="stretch">
          <Text.Headline as="h3" intlMessage={messages.title} />
          {Object.entries(PAYMENT_TITLES).map(([link, title]) => (
            <Link isExternal={false} to={`${entryPointUriPath}/${link}`}>
              {title}
            </Link>
          ))}
        </Spacings.Stack>
      </Spacings.Inset>
    </Constraints.Horizontal>
  );
};
Welcome.displayName = 'Welcome';

export default Welcome;
