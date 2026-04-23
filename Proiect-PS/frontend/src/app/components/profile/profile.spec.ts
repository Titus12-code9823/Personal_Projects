import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PostService } from '../../services/post/post.service';
import { UserService } from '../../services/user/user';
import { AuthService } from '../../services/auth/auth';

import { Profile } from './profile';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideRouter([]),
        { provide: PostService, useValue: { getAllPosts: () => of([]) } },
        {
          provide: UserService,
          useValue: {
            getCurrentUser: () => of({
              id: 1,
              username: 'test-user',
              email: 'test@example.com',
              phoneNumber: '',
              avatarUrl: null,
              description: '',
              score: 0,
              isModerator: false,
              isBlocked: false,
              createdAt: '2026-01-01T00:00:00'
            })
          }
        },
        { provide: AuthService, useValue: { logout: () => {}, isLoggedIn: () => true } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
