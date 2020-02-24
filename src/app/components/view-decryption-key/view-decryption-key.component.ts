import { Component, OnInit } from '@angular/core';
import { NavParams, AlertController, PopoverController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AuthService } from 'src/app/services/auth.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-view-decryption-key',
  templateUrl: './view-decryption-key.component.html',
  styleUrls: ['./view-decryption-key.component.scss'],
})
export class ViewDecryptionKeyComponent implements OnInit {
  passedData;
  showDecKey: boolean;

  constructor(
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
    private authService: AuthService,
    private firebaseService: FirebaseService
  ) { }

  ngOnInit() {
    this.showDecKey = false;
    this.passedData = this.navParams.data;
  }

  onSubmit(form: NgForm) {
    console.log(this.firebaseService.userInfo.value.pw);
    
    if (form.value.pw === this.firebaseService.userInfo.value.pw) {
      this.showDecKey = true;
    } else {
      this.showAlert('Invalid Password! Please try again.');
    }
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Invalid',
        message,
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }

}
