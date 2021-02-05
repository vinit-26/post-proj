import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoggedInAuthGuard } from './auth/loggedInAuth.guard';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/post/list',
    pathMatch: 'full',
  },
  {
    path: 'signin',
    component: LoginComponent,
    canActivate: [LoggedInAuthGuard],
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [LoggedInAuthGuard],
  },
  {
    path: 'post',
    loadChildren: () => import('./posts/post.module').then((m) => m.PostModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [LoggedInAuthGuard],
})
export class AppRoutingModule {}
