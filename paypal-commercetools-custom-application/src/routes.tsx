import { lazy, ReactNode, Suspense } from 'react';
import { Route, BrowserRouter } from 'react-router-dom';
import { useLocation } from 'react-router';

import Spacings from '@commercetools-uikit/spacings';
import Welcome from './components/welcome';
import { entryPointUriPath } from './constants';
import { SettingsPropComponent } from './components/settings/types';

const Settings = lazy(
  () =>
    import('./components/settings/settings' /* webpackChunkName: "channels" */)
);

type ApplicationRoutesProps = {
  children?: ReactNode;
};

const INDIVIDUAL_COMPONENTS: SettingsPropComponent[] = [
  'Settings',
  'CheckoutButtons',
  'PayLater',
  'ThreeDS',
  'RatePay',
  'Tracking',
  'CCFields',
];

const ComponentRoutes = (parentPath: string) =>
  INDIVIDUAL_COMPONENTS.map((component) => (
    <Route path={`${parentPath}/${component}`}>
      <Suspense fallback={<>Loading...</>}>
        <Settings component={`${component}`} />
      </Suspense>
    </Route>
  ));

const ApplicationRoutes = (_props: ApplicationRoutesProps) => {
  const parentPath = `${
    useLocation().pathname.split(`${entryPointUriPath}`)[0]
  }${entryPointUriPath}`;

  /**
   * When using routes, there is a good chance that you might want to
   * restrict the access to a certain route based on the user permissions.
   * You can evaluate user permissions using the `useIsAuthorized` hook.
   * For more information see https://docs.commercetools.com/custom-applications/development/permissions
   *
   * NOTE that by default the Custom Application implicitly checks for a "View" permission,
   * otherwise it won't render. Therefore, checking for "View" permissions here
   * is redundant and not strictly necessary.
   */

  return (
    <Spacings.Inset scale="l">
      <BrowserRouter>
        <Route exact path={parentPath}>
          <Suspense fallback={<>Loading...</>}>
            <Welcome />
          </Suspense>
        </Route>
        {ComponentRoutes(parentPath)}
      </BrowserRouter>
    </Spacings.Inset>
  );
};
ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;
