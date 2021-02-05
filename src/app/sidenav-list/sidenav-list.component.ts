import { AuthService } from '../auth/auth.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  faUserPlus,
  faSignInAlt,
  faSignOutAlt,
  faRssSquare,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.css'],
})
export class SidenavListComponent implements OnInit {
  @Output() sideNavToggle = new EventEmitter<void>();
  isAuth = false;
  faUser = faUserPlus;
  faSignIn = faSignInAlt;
  faPost = faRssSquare;
  faLogout = faSignOutAlt;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isAuth = this.authService.getIsAuth();
    this.authService.getAuthStatusListner().subscribe((isAuth) => {
      if (isAuth) {
        this.isAuth = isAuth;
      } else {
        this.isAuth = false;
      }
    });
  }
  onClose(): void {
    this.sideNavToggle.emit();
  }
  onLogout(): void {
    this.onClose();
    this.authService.logout();
  }
}
