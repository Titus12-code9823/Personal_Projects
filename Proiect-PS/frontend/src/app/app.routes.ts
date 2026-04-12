import { Routes } from '@angular/router';
import { PostListComponent } from './components/posts/post-list/post-list';
import { PostDetailComponent } from './components/posts/post-detail/post-detail';
import { PostFormComponent } from './components/posts/post-form/post-form';
import { Profile } from './components/profile/profile';
import { Login } from './components/login/login';
import { ForgotPasswordComponent } from './components/login/forgot-password';
import { ResetPasswordComponent } from './components/login/reset-password';
import { profileAuthGuard, startupRedirectGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [startupRedirectGuard], component: Login },
  { path: 'login', component: Login },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'posts', component: PostListComponent },
  { path: 'posts/new', component: PostFormComponent },
  { path: 'posts/:id', component: PostDetailComponent },
  { path: 'profile', component: Profile, canActivate: [profileAuthGuard] },
  { path: '**', redirectTo: '' }
];
