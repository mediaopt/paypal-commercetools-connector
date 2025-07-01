/// <reference types="@commercetools-frontend/application-config/client" />

import EntryPoint from './components/entry-point';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('app');
const root = createRoot(container as Element);
root.render(<EntryPoint />);
