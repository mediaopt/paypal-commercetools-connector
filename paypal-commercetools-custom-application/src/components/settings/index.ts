import { lazy } from 'react';

const Settings = lazy(
  () => import('./settings' /* webpackChunkName: "channels" */)
);

export default Settings;
