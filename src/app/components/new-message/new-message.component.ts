import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { PopoverController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss'],
})
export class NewMessageComponent implements OnInit {
  userData;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private popoverController: PopoverController,
    private router: Router,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.authService.userData.subscribe(val => {
      this.userData = val;
    });
  }

  onStartMessage(formData: NgForm) {
    const userEmail = formData.value.userEmail;
    const message = formData.value.message;
    let senderName;


    this.firebaseService.getUser(this.userData.id)
      .then(val => {
        senderName = val.val().name;
      });
    this.firebaseService.getAllUsers()
      .then(userRec => {
        const users = userRec.val();
        const userIds = Object.keys(users);
        for (const user in users) {
          if (users[user].email === userEmail && (userEmail !== this.userData.email)) {
            this.popoverController.dismiss();
            this.firebaseService.getContact(this.userData.id, user)
              .then(resp => {
                const userContact = resp.val();
                if (!userContact) {
                  this.firebaseService.fetchChats()
                    .then(chat => {
                      const chatId = (chat.val()) ? Object.keys(chat.val()).length + 1 : 1;
                      this.firebaseService.startMessage({sender: this.userData.id, message});
                      this.firebaseService.addContact(
                        this.userData.id,
                        user,
                        {
                          email: users[user].email,
                          id: user,
                          chat_id: chatId,
                          last_message: message,
                          name: users[user].name
                        }
                      );
                      this.firebaseService.addContact(
                        user,
                        this.userData.id,
                        {
                          email: this.userData.email,
                          id: this.userData.id,
                          chat_id: chatId,
                          last_message: message,
                          name: senderName
                        }
                      );
                    });
                } else {
                  this.router.navigateByUrl(`home/${user}/${userContact.chat_id}`);
                }
              });
          } else {
            this.showAlert('Email does not exist!');
          }
        }
      });
  }

  async closePopover() {
    await this.popoverController.dismiss();
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Invalid Email',
        message,
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }

}
