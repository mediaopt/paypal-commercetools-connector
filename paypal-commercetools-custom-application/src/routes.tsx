import { lazy, ReactNode, Suspense } from 'react';
import { Route, BrowserRouter } from 'react-router-dom';
import { useLocation } from 'react-router';

// import Spacings from '@commercetools-uikit/spacings';
import Welcome from './components/welcome';

const Settings = lazy(
  () =>
    import('./components/settings/settings' /* webpackChunkName: "channels" */)
);

type ApplicationRoutesProps = {
  children?: ReactNode;
};
const ApplicationRoutes = (_props: ApplicationRoutesProps) => {
  const pathname = useLocation().pathname.split('/').slice(0, 3).join('/');

  console.log('pathname', pathname);
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
    <BrowserRouter>
      <Route path={`${pathname}/settings`}>
        <Suspense fallback={<></>}>
          <Settings component="Settings" />
        </Suspense>
      </Route>
      <Route path={`${pathname}/payPalCheckoutButtons`}>
        <Suspense>
          <Settings component="CheckoutButtons" />
        </Suspense>
      </Route>
      <Route path={`${pathname}/payPalPayLater`}>
        <Suspense>
          <Settings component="PayLater" />
        </Suspense>
      </Route>
      <Route path={`${pathname}/threeDS`}>
        <Suspense>
          <Settings component="ThreeDS" />
        </Suspense>
      </Route>
      <Route path={`${pathname}/ratePay`}>
        <Suspense>
          <Settings component="RatePay" />
        </Suspense>
      </Route>
      <Route path={`${pathname}/tracking`}>
        <Suspense>
          <Settings component="Tracking" />
        </Suspense>
      </Route>
      <Route path={`${pathname}/ccFields`}>
        <Suspense>
          <Settings component="CCFields" />
        </Suspense>
      </Route>
      <Route>
        <Suspense fallback={<>fallback</>}>
          <Welcome />
        </Suspense>
      </Route>
    </BrowserRouter>
  );
};
ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;
