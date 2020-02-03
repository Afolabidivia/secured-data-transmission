import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Plugins } from '@capacitor/core';

import { environment } from 'src/environments/environment';
import { User } from '../auth/user.model';
import { FirebaseService } from './firebase.service';
import { NavController } from '@ionic/angular';

const { Storage } = Plugins;

export interface AuthResponseData {
   kind: string;
   idToken: string;
   email: string;
   refreshToken: string;
   localId: string;
   expiresIn: string;
   registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = new BehaviorSubject<User>(null);
  loginState = new BehaviorSubject<boolean>(false);
  token = new BehaviorSubject<string>(null);

  constructor(
    private http: HttpClient,
    private firebaseService: FirebaseService,
    private navCtrl: NavController
    ) { }

  async checkToken() {
    const ret = await Storage.get({ key: 'authData' });
    const user = JSON.parse(ret.value);
    if (user) {
      this.loginState.next(true);
      this.token.next(user.token);
      this.user.next(user);
      return;
    }
  }

  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${
          environment.firebaseConfig.apiKey
        }`,
        { email, password, returnSecureToken: true }
      )
      .pipe(tap(this.setUserData.bind(this)));
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${
          environment.firebaseConfig.apiKey
        }`,
        { email, password, returnSecureToken: true }
      )
      .pipe(tap(this.setUserData.bind(this)));
  }

  logout() {
    this.firebaseService.destroyContact();
    this.user.next(null);
    this.token.next(null);
    this.loginState.next(false);
    Plugins.Storage.remove({ key: 'authData' });
    this.navCtrl.navigateRoot('/auth');
  }

  private setUserData(userData: AuthResponseData) {
    const user = new User(
      userData.localId,
      userData.email,
      userData.idToken,
    );
    this.token.next(userData.idToken);
    this.loginState.next(true);
    this.user.next(user);
    this.storeAuthData(
      userData.localId,
      userData.idToken,
      userData.email
    );
  }

  async storeAuthData(
    id: string,
    token: string,
    email: string
  ) {
    const data = JSON.stringify({
      id,
      token,
      email
    });
    await Storage.set({
      key: 'authData',
      value: data
    });
  }
}
