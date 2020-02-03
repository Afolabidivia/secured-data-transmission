import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment } from '@angular/router';
import { Observable, of } from 'rxjs';
import { take, tap, switchMap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { NavController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  constructor(
    private authService: AuthService,
    private navCtrl: NavController
    ) {}

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.loginState.pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          this.navCtrl.navigateRoot('/auth');
        } else {
          return of(isAuthenticated);
        }
      })
    );
  }
}
