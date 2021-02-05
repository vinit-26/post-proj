import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthData, AuthResponse } from './auth-data.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiURL;
  token: string | null;
  timer: NodeJS.Timer;
  private isAuth = false;
  private authStatusListner = new Subject<boolean>();
  private userId: string | null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastrService
  ) {}

  getToken(): string | null {
    return this.token;
  }
  getIsAuth(): boolean {
    return this.isAuth;
  }
  getUserId(): string | null {
    return this.userId;
  }
  getAuthStatusListner(): Observable<boolean> {
    return this.authStatusListner.asObservable();
  }
  createUser(email: string, password: string): void {
    const authData: AuthData = {
      email,
      password,
    };
    this.http.post(this.baseUrl + `/user/signup`, authData).subscribe(
      (result) => {
        this.toast.success('Signed Up Successfully, Please Login.', 'Success');
        this.router.navigate(['/signin']);
      },
      (error) => {
        this.authStatusListner.next(false);
      }
    );
  }
  login(email: string, password: string): void {
    const authData: AuthData = {
      email,
      password,
    };
    this.http
      .post<AuthResponse>(this.baseUrl + `/user/login`, authData)
      .subscribe(
        (result) => {
          this.token = result.token;
          if (this.token) {
            this.userId = result.userId;
            const expiresIn = result.expiresIn;
            this.setAuthTimer(expiresIn);
            const now = new Date();
            const expairyDate = new Date(now.getTime() + expiresIn * 1000);
            this.saveAuthData(this.token, expairyDate, result.userId);
            this.isAuth = true;
            this.authStatusListner.next(true);
            this.toast.success('You are Logged In', 'Success');
            this.router.navigate(['/post/list']);
          }
        },
        (error) => {
          this.authStatusListner.next(false);
        }
      );
  }

  autoAuthUser(): void {
    const authInfo = this.getAuthData();
    if (authInfo) {
      const now = new Date();
      const expiresIn = authInfo.expairyDate.getTime() - now.getTime();
      if (expiresIn > 0) {
        this.setAuthTimer(expiresIn / 1000);
        this.token = authInfo.token;
        this.isAuth = true;
        this.userId = authInfo.userId;
        this.authStatusListner.next(true);
      } else {
        return;
      }
    } else {
      return;
    }
  }

  private setAuthTimer(duration: number): void {
    this.timer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expairyDate: Date, userId: string): void {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('expairyDate', expairyDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('expairyDate');
    localStorage.removeItem('userId');
  }

  private getAuthData():
    | { token: string; expairyDate: Date; userId: string }
    | undefined {
    const accessToken = localStorage.getItem('accessToken');
    const expairationDate = localStorage.getItem('expairyDate');
    const storedUserId = localStorage.getItem('userId');
    if (accessToken && expairationDate && storedUserId) {
      return {
        token: accessToken,
        expairyDate: new Date(expairationDate),
        userId: storedUserId,
      };
    }
    return;
  }

  logout(): void {
    this.token = null;
    this.isAuth = false;
    this.userId = null;
    clearTimeout(this.timer);
    this.clearAuthData();
    this.authStatusListner.next(false);
    this.router.navigate(['/signin']);
  }
}
