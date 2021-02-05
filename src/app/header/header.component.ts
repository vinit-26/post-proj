import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {
  faUserPlus,
  faSignInAlt,
  faSignOutAlt,
  faRssSquare,
} from '@fortawesome/free-solid-svg-icons';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Output() sidenavToggle = new EventEmitter<void>();
  isAuthenticated = false;
  faUser = faUserPlus;
  faSignIn = faSignInAlt;
  faPost = faRssSquare;
  faLogout = faSignOutAlt;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.getIsAuth();
    this.authService.getAuthStatusListner().subscribe((isAuth) => {
      if (isAuth) {
        this.isAuthenticated = isAuth;
      } else {
        this.isAuthenticated = false;
      }
    });
  }
  onSidenavToggle(): void {
    this.sidenavToggle.emit();
  }
  onLogout(): void {
    this.authService.logout();
  }
}
