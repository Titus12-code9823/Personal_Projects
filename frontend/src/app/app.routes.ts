import { Routes } from '@angular/router';
import { PostListComponent } from './components/posts/post-list/post-list';
import { PostDetailComponent } from './components/posts/post-detail/post-detail';
import { PostFormComponent } from './components/posts/post-form/post-form';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'posts' },
  { path: 'posts', component: PostListComponent },
  { path: 'posts/new', component: PostFormComponent },
  { path: 'posts/:id', component: PostDetailComponent },
  { path: '**', redirectTo: 'posts' }
];
