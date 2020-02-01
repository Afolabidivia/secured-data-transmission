import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { AuthService } from '../services/auth.service';
import { PopoverController } from '@ionic/angular';
import { NewMessageComponent } from '../components/new-message/new-message.component';
import { Router } from '@angular/router';
import { DnaTestService } from '../services/dna-test.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  userId: string;
  isLoadingContacts = true;
  userContacts = [];
  userInfo$;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private popoverController: PopoverController,
    private router: Router,
    private DNAService: DnaTestService
  ) {}

  ngOnInit() {
    this.authService.userId.subscribe(val => {
      this.userId = val;
      this.firebaseService.userId.next(this.userId);
      // Get user info
      this.firebaseService.getUser(this.userId)
        .then(resp => {
          this.userInfo$ = resp.val();
          this.firebaseService.userContacts.subscribe(contacts => {
            this.isLoadingContacts = false;
            if (contacts) {
              this.userContacts = [];
              const tempContacts = Object.values(contacts);
              // tslint:disable-next-line: prefer-for-of
              for (let i = 0; i < tempContacts.length; i++) {
                // tslint:disable-next-line: no-string-literal
                this.userContacts.push(tempContacts[i]);
                this.decodeMessage(
                  i,
                  tempContacts[i]['last_message'].sender,
                  tempContacts[i]['last_message'].message);
              }
            }
          });
          this.firebaseService.userInfo.next(resp.val());
        });
      this.firebaseService.syncContacts(this.userId);
    });
  }

  async openNewMessageComponent() {
    const popover = await this.popoverController.create({
      component: NewMessageComponent,
      translucent: true
    });
    return await popover.present();
  }

  openChat(url: string) {
    this.router.navigateByUrl(`/home/${url}`);
  }

  decodeMessage(index: number, sender: string, message: string) {
    if (this.userInfo$) {
      if (sender === this.userId) {
        this.userContacts[index]['dec_message'] = this.DNAService.decryption(message, this.userInfo$.pub, false);
        // return this.DNAService.decryption(message, this.userInfo$.pub, false);
      } else {
        this.firebaseService.getContact(sender, this.userId).then(resp => {
          if (resp.val()) {
            if (resp.val().pk) {
              this.userContacts[index]['dec_message'] = this.DNAService.decryption(message, resp.val().pk, true);
              // return this.DNAService.decryption(message, resp.val().pk, true);
            } else {
              this.userContacts[index]['dec_message'] = message;
            }
          }
        });
      }
    }
  }

}
