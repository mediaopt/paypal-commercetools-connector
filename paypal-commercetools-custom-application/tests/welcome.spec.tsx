import {
  mapResourceAccessToAppliedPermissions,
  type TRenderAppWithReduxOptions,
} from '@commercetools-frontend/application-shell/test-utils';
import { renderApplicationWithRedux } from '../src/test-utils';
import { entryPointUriPath, PERMISSIONS } from '../src/constants';
import ApplicationRoutes from '../src/routes';

const renderApp = (options: Partial<TRenderAppWithReduxOptions> = {}) => {
  const route = options.route || `/my-project/${entryPointUriPath}`;
  const { history } = renderApplicationWithRedux(<ApplicationRoutes />, {
    route,
    project: {
      allAppliedPermissions: mapResourceAccessToAppliedPermissions([
        PERMISSIONS.View,
      ]),
    },
    ...options,
  });
  return { history };
};

it('should render welcome page', async () => {
  const result = renderApp();
  expect(result.history.location.pathname).toEqual(
    '/my-project/paypal-payment-panel'
  );
});
