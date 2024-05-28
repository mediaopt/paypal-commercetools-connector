import { mapResourceAccessToAppliedPermissions } from '@commercetools-frontend/application-shell/test-utils';
import {
  renderApplication,
  renderApplicationWithRedux,
  renderApplicationWithRoutes,
  renderApplicationWithRoutesAndRedux,
} from '../src/test-utils';
import { entryPointUriPath, PERMISSIONS } from '../src/constants';
import ApplicationRoutes from '../src/routes';

const route = `/my-project/${entryPointUriPath}`;

const withEmptyOptions = {
  route,
  project: {
    allAppliedPermissions: mapResourceAccessToAppliedPermissions([
      PERMISSIONS.View,
    ]),
  },
};

test('should render welcome page', async () => {
  const { history } = renderApplication(
    <ApplicationRoutes />,
    withEmptyOptions
  );
  expect(history.location.pathname).toEqual('/my-project/paypal-payment-panel');

  const historyWithRedux = renderApplicationWithRedux(
    <ApplicationRoutes />,
    withEmptyOptions
  ).history;
  expect(historyWithRedux.location.pathname).toEqual(
    '/my-project/paypal-payment-panel'
  );
  const historyWithRoutes =
    renderApplicationWithRoutes(withEmptyOptions).history;
  expect(historyWithRoutes.location.pathname).toEqual(
    '/my-project/paypal-payment-panel'
  );
  const historyWithRoutesAndRedux =
    renderApplicationWithRoutesAndRedux(withEmptyOptions).history;
  expect(historyWithRoutesAndRedux.location.pathname).toEqual(
    '/my-project/paypal-payment-panel'
  );
});
