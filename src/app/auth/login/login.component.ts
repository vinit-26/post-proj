import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

import { AuthService } from './../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('divState', [
      state(
        'in',
        style({
          opacity: 1,
          transform: 'translateX(0)',
        })
      ),
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'translateX(-50px)',
        }),
        animate(300),
      ]),
    ]),
  ],
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;
  authSub: Subscription;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authSub = this.authService
      .getAuthStatusListner()
      .subscribe((authStatus) => {
        this.isLoading = false;
      });
  }

  onLogin(form: NgForm): void {
    this.isLoading = true;
    this.authService.login(form.value.email, form.value.password);
  }
  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }
}
