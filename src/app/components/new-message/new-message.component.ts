import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { PopoverController } from '@ionic/angular';

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
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    this.authService.userData.subscribe(val => {
      this.userData = val;
    });
  }

  onStartMessage(formData: NgForm) {
    const userEmail = formData.value.userEmail;
    const message = formData.value.message;
    this.firebaseService.getAllUsers()
      .then(userRec => {
        const users = userRec.val();
        console.log(this.userData); return;
        
        const userIds = Object.keys(users);
        for (const user in users) {
          if (users[user].email === userEmail && (userEmail !== this.userData.email)) {
            this.popoverController.dismiss();
            this.firebaseService.fetchChats()
              .then(chat => {
                console.log(chat.val());
                const chatId = (chat.val()) ? Object.keys(chat.val()).length + 1 : 1;
                console.log(chatId);
                this.firebaseService.startMessage({sender: this.userData.id, message});
                this.firebaseService.addContact(
                  this.userData.id,
                  user,
                  {
                    email: users[user].email,
                    id: user,
                    chat_id: chatId,
                    last_message: message }
                );
                this.firebaseService.addContact(
                  user,
                  this.userData.id,
                  {
                    email: this.userData.email,
                    id: this.userData.id,
                    chat_id: chatId,
                    last_message: message }
                );
              });
            break;
          }
        }
      });
  }

  async closePopover() {
    await this.popoverController.dismiss();
  }

}
