import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
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
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authSub: Subscription;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authSub = this.authService
      .getAuthStatusListner()
      .subscribe((authStatus) => {
        this.isLoading = false;
      });
  }

  onSignUp(form: NgForm): void {
    this.isLoading = true;
    this.authService.createUser(form.value.email, form.value.password);
  }
  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }
}
