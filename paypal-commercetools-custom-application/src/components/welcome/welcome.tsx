import type { ReactNode } from 'react';
import { useRouteMatch } from 'react-router-dom';
import Constraints from '@commercetools-uikit/constraints';
import Grid from '@commercetools-uikit/grid';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import PrimaryButton from '@commercetools-uikit/primary-button';
import Link from '@commercetools-uikit/link';

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
  const match = useRouteMatch();

  return (
    <Constraints.Horizontal max={16}>
      <Grid
        gridGap="16px"
        gridAutoColumns="1fr"
        gridTemplateColumns="1fr 3fr 2fr"
      >
        <Grid.Item>PP-LOGO HERE</Grid.Item>
        <Grid.Item>
          <Text.Headline as="h1" intlMessage={messages.title} />
          <PrimaryButton
            as={Link}
            isExternal={false}
            to={`${match.url}/settings`}
            label={'Settings'}
          />
        </Grid.Item>
        <Grid.Item>PAYMENT LOGOS HERE</Grid.Item>
      </Grid>
    </Constraints.Horizontal>
  );
};
Welcome.displayName = 'Welcome';

export default Welcome;
