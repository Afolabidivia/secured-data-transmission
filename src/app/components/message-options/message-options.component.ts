import { Component, OnInit } from '@angular/core';
import { AlertController, PopoverController, NavParams } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-message-options',
  templateUrl: './message-options.component.html',
  styleUrls: ['./message-options.component.scss'],
})
export class MessageOptionsComponent implements OnInit {
  passedData;
  userId$: string;
  senderId$: string;
  isDecryptOpen: boolean;
  userPrivateKey: string;
  senderPrivateKey: string;

  constructor(
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private popoverCtrl: PopoverController,
    private authService: AuthService,
    private firebaseService: FirebaseService
  ) { }

  ngOnInit() {
    this.userPrivateKey = this.firebaseService.userInfo.value.priv;
    this.isDecryptOpen = false;
    this.userId$ = this.authService.user.value.id;
    this.passedData = this.navParams.data;
    this.firebaseService.getContact(this.passedData.sender, this.userId$).then(resp => {
      if (resp.val()) {
        if (resp.val().pk) {
          this.senderPrivateKey = resp.val().pk;
        } else {
          this.closePopover();
        }
      }
    });
  }

  async confirmDeleteMessage() {
    this.closePopover();
    const alert = await this.alertCtrl.create({
      header: 'Delete Message',
      // tslint:disable-next-line: max-line-length
      message: 'Are you sure you want to delete this message?',
      buttons: [
        {
          text: 'YES',
          handler: () => {
            this.onDeleteMessage();
          }
        },
        {
          text: 'CANCEL',
        }
      ]
    });
    await alert.present();
  }

  onDeleteMessage() {
    this.firebaseService.deleteMessage(this.passedData.chatId, this.passedData.messageId).then(
      data => {
        console.log(data);
      }
    ).catch(
      error => {
        console.log(error);
      }
    );
  }

  onDecryptClicked() {
    this.isDecryptOpen = !this.isDecryptOpen;
  }

  onDecryptMessage(form: NgForm) {
    if (form.value.decKey !== this.senderPrivateKey) {
      this.showAlert('Invalid decryption Key');
      return;
    }
    this.closePopover({ dec: form.value.decKey });
  }

  async closePopover(data?) {
    await this.popoverCtrl.dismiss(data);
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
