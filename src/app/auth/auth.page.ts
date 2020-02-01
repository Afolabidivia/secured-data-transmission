import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { LoadingController, AlertController, NavController } from '@ionic/angular';

import { AuthService, AuthResponseData } from '../services/auth.service';
import { Observable } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { DnaTestService } from '../services/dna-test.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private firebaseService: FirebaseService,
    private DNAService: DnaTestService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
  }

  authenticate(email: string, password: string, name?: string, pubKey?: string, privKey?: string) {
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: 'Logging in...' })
      .then(loadingEl => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData>;
        if (this.isLogin) {
          authObs = this.authService.login(email, password);
        } else {
          authObs = this.authService.signup(email, password);
        }
        authObs.subscribe(
          resData => {
            if (!this.isLogin) {
              const userData = {
                email: resData.email,
                name,
                pub: pubKey,
                priv: privKey
              };
              this.firebaseService.addUser(resData.localId, userData);
            }
            this.isLoading = false;
            loadingEl.dismiss();
            this.navCtrl.navigateRoot('/home');
            // this.router.navigateByUrl('/home');
          },
          errRes => {
            loadingEl.dismiss();
            const code = errRes.error.error.message;
            let message = 'Could not sign you up, please try again.';
            if (code === 'EMAIL_EXISTS') {
              message = 'This email address exists already!';
            } else if (code === 'EMAIL_NOT_FOUND') {
              message = 'E-Mail address could not be found.';
            } else if (code === 'INVALID_PASSWORD') {
              message = 'This password is not correct.';
            }
            this.showAlert(message);
          }
        );
      });
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    if (!this.isLogin) {
      const name = form.value.userName;
      const pk = form.value.pubKey;
      const privKey = this.DNAService.privateKey(pk);
      this.authenticate(email, password, name, pk, privKey);
    } else {
      this.authenticate(email, password);
    }
    form.reset();
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Authentication failed',
        message,
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }

}
