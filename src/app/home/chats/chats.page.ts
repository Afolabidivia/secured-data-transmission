import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { DnaTestService } from 'src/app/services/dna-test.service';
import { NavController, PopoverController, AlertController } from '@ionic/angular';
import { MessageOptionsComponent } from 'src/app/components/message-options/message-options.component';
import { ViewDecryptionKeyComponent } from 'src/app/components/view-decryption-key/view-decryption-key.component';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit, AfterViewInit, OnDestroy {
  contactId$: string;
  userId$: string;
  chatId;
  userInfo$;
  userContact$;
  messages;
  isKeyShared: boolean;
  isUserKeyshared: boolean;
  decryptionKey: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private DNAService: DnaTestService,
    private navCtrl: NavController,
    private popoverController: PopoverController,
    private alertCtrl: AlertController
    ) { }

  ngOnInit() {
    this.userId$ = this.authService.user.value.id;
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('userId') && !paramMap.has('chatId')) {
        this.router.navigateByUrl('/');
        return;
      }
      this.contactId$ = paramMap.get('userId');
      this.chatId = paramMap.get('chatId');

      this.firebaseService.getUser(this.contactId$)
        .then(user => {
          if (!user) {
            this.navCtrl.navigateRoot('/home');
            return;
          }
          this.userContact$ = user.val();
        });

      this.firebaseService.userInfo.subscribe(val => {
        if (!val) {
          this.navCtrl.navigateRoot('/home');
          return;
        }
        this.userInfo$ = val;
        this.firebaseService.getContact(this.userId$, this.contactId$).then(resp => {
          if (resp.val()) {
            if (resp.val().pk) {
              this.isKeyShared = true;
              return;
            }
            this.isKeyShared = false;
          }
        });
      });

      this.firebaseService.getContact(this.contactId$, this.userId$).then(resp => {
        if (resp.val()) {
          if (resp.val().pk) {
            this.decryptionKey = resp.val().pk;
            this.isUserKeyshared = true;
            return;
          }
          this.isUserKeyshared = false;

        }
      });

      this.firebaseService.syncMessages(this.chatId);
    });
  }

  ngAfterViewInit() {
    this.firebaseService.messages.subscribe(resp => {
      if (resp) {
        this.messages = [];
        const tempMessage = Object.values(resp);
        // this.messages = Object.values(resp);
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < tempMessage.length; i++) {
          this.messages.push(tempMessage[i]);
          this.decodeMessage(
            i,
            // tslint:disable-next-line: no-string-literal
            tempMessage[i]['sender'],
            // tslint:disable-next-line: no-string-literal
            tempMessage[i]['message']
          );
        }
        return;
      }
    });
  }

  submitMessage(form: NgForm) {
    const message = this.DNAService.encript(form.value.chatMessage, this.userInfo$.pub);
    const sender = this.userId$;
    this.firebaseService.addMessage(sender, this.contactId$, {message, sender});
    form.reset();
  }

  decodeMessage(index: number, sender: string, message: string) {
    if (sender === this.userId$) {
      // tslint:disable-next-line: no-string-literal
      this.messages[index]['dec_message'] = this.DNAService.decryption(message, this.userInfo$.pub, false);
      // return this.DNAService.decryption(message, this.userInfo.pub, false);
    } else {
      this.messages[index]['dec_message'] = message;
      // this.firebaseService.getContact(this.contactId$, this.userId$).then(resp => {
      //   if (resp.val()) {
      //     if (resp.val().pk) {
      //       // tslint:disable-next-line: no-string-literal
      //       this.messages[index]['dec_message'] = this.DNAService.decryption(message, resp.val().pk, true);
      //       return;
      //       // return this.DNAService.decryption(message, resp.val().pk, true);
      //     } else {
      //       // tslint:disable-next-line: no-string-literal
      //       this.messages[index]['dec_message'] = message;
      //     }
      //   }
      // });
    }
  }

  async openMessageOption(ev: any, msgId: number, sender: string, index: number) {
    const popover = await this.popoverController.create({
      component: MessageOptionsComponent,
      // translucent: true,
      event: ev,
      componentProps: {
        chatId: this.chatId,
        messageId: msgId,
        sender
      }
    });
    popover.onDidDismiss().then(res => {
      if (res.data) {
        this.messages[index]['dec_message'] = this.DNAService.decryption(this.messages[index].message, res.data.dec, true);
      }
    });
    return await popover.present();
  }

  // decryptMessage() {

  // }

  onShareKey() {
    this.firebaseService.updateContact(this.userId$, this.contactId$, this.userInfo$.priv)
      .then(resp => {
        this.isKeyShared = true;
      });
  }

  async openDecryptionKeyComponent() {
    if (!this.isUserKeyshared) {
      this.showAlert('This user does not share his/her decryption key wit you');
      return;
    }
    const popover = await this.popoverController.create({
      component: ViewDecryptionKeyComponent,
      componentProps: {
        decKey: this.decryptionKey
      }
    });
    return await popover.present();
  }

  ngOnDestroy() {
    this.firebaseService.destroyMessages();
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: 'Alert',
        message,
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }

}
