import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
export class HomePage implements OnInit, AfterViewInit {
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
    this.authService.user.subscribe(val => {
      if (val) {
        this.userId = val.id;
        this.firebaseService.syncContacts(this.userId);
        // Get user info
        this.firebaseService.getUser(this.userId)
          .then(resp => {
            this.userInfo$ = resp.val();
            this.firebaseService.userInfo.next(resp.val());
          });
      }
    });
  }

  ngAfterViewInit() {
    this.firebaseService.userContacts.subscribe(contacts => {
      this.isLoadingContacts = false;
      if (contacts) {
        this.userContacts = [];
        this.userContacts = Object.keys(contacts).map((el) => {
          this.decodeMessage(
            contacts[el]['last_message'].sender,
            contacts[el]['last_message'].message,
          );
          return contacts[el];
        });
      }
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

  decodeMessage(sender: string, message: string, index?: number ) {
    if (this.userInfo$) {
      if (sender === this.userId) {
        this.userContacts['dec_message'] = this.DNAService.decryption(message, this.userInfo$.pub, false);
        // this.userContacts[index]['dec_message'] = this.DNAService.decryption(message, this.userInfo$.pub, false);
        // return this.DNAService.decryption(message, this.userInfo$.pub, false);
      } else {
        this.userContacts['dec_message'] = message;
        // this.firebaseService.getContact(sender, this.userId).then(resp => {
        //   if (resp.val()) {
        //     if (resp.val().pk) {
        //       this.userContacts[index]['dec_message'] = this.DNAService.decryption(message, resp.val().pk, true);
        //       // return this.DNAService.decryption(message, resp.val().pk, true);
        //     } else {
        //       this.userContacts[index]['dec_message'] = message;
        //     }
        //   }
        // });
      }
    }
  }

}
