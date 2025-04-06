import { Routes } from '@angular/router';
import {AppComponent} from './app.component';
import {MainComponent} from './components/main/main.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: '',
    component: MainComponent,
  },
  {
    path: '**',
    redirectTo: 'main',
    pathMatch: 'full',
  }
];
