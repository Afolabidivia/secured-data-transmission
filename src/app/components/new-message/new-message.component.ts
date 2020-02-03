import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { PopoverController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DnaTestService } from 'src/app/services/dna-test.service';

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss'],
})
export class NewMessageComponent implements OnInit {
  isChecked$ = false;
  userInfo$;
  userId$: string;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private popoverController: PopoverController,
    private router: Router,
    private alertCtrl: AlertController,
    private DNAService: DnaTestService
  ) { }

  ngOnInit() {
    this.firebaseService.userInfo.subscribe(value => {
      this.userInfo$ = value;
    });
    this.userId$ = this.authService.user.value.id;
  }

  onStartMessage(formData: NgForm) {
    const userEmail = formData.value.userEmail;
    const message = this.DNAService.encript(formData.value.message, this.userInfo$.pub);
    const isKeyShared = formData.value.shKey;

    this.firebaseService.getAllUsers()
      .then(userRec => {
        let users = [];
        let userEmails = [];
        let index;
        // tslint:disable-next-line: forin
        for (const user in userRec.val()) {
          const tempUser = {
            id: user,
            email: userRec.val()[user].email,
            name: userRec.val()[user].name
          };
          userEmails.push(userRec.val()[user].email);
          users.push(tempUser);
        }
        // check if user exist
        if (userEmails.indexOf(userEmail) < 0) {
          this.showAlert('Email does not exist!');
          return;
        } else {
          index = userEmails.indexOf(userEmail);
        }
        // check if user is not current user
        if (userEmail === this.userInfo$.email) {
          this.showAlert('This seems to be your email!');
          return;
        }

        this.firebaseService.getContact(this.userId$, users[index].id)
          .then(resp => {
            const userContact = resp.val();
            if (!userContact) {
              this.firebaseService.fetchChats()
                .then(chat => {
                  const chatId = (chat.val()) ? Object.keys(chat.val()).length + 1 : 1;
                  const lastMessage = {
                    sender: this.userId$,
                    message
                  };
                  let userCont = {
                    email: users[index].email,
                    id: users[index].id,
                    chat_id: chatId,
                    last_message: lastMessage,
                    name: users[index].name,
                  };
                  if (isKeyShared) {
                    // tslint:disable-next-line: no-string-literal
                    userCont['pk'] = this.userInfo$.priv;
                  }
                  this.firebaseService.startMessage({sender: this.userId$, message});
                  this.firebaseService.addContact(
                    this.userId$,
                    users[index].id,
                    userCont
                  );
                  this.firebaseService.addContact(
                    users[index].id,
                    this.userId$,
                    {
                      email: this.userInfo$.email,
                      id: this.userId$,
                      chat_id: chatId,
                      last_message: lastMessage,
                      name: this.userInfo$.name
                    }
                  );
                });
            } else {
              this.router.navigateByUrl(`home/${users[index].id}/${userContact.chat_id}`);
            }
            this.closePopover();
          });
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
