import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { AuthService } from '../services/auth.service';
import { PopoverController } from '@ionic/angular';
import { NewMessageComponent } from '../components/new-message/new-message.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  userId: string;
  isLoadingContacts: boolean;
  userContacts;

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private popoverController: PopoverController,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoadingContacts = true;
    this.authService.userId.subscribe(val => {
      this.userId = val;
      this.isLoadingContacts = false;
      this.firebaseService.syncContacts(this.userId);
    });
    this.firebaseService.userContacts.subscribe(contacts => {
      if (contacts) {
        this.userContacts = Object.values(contacts);
        // console.log(Object.values(this.userContacts));
      }
    });
    // this.firebaseService.syncContacts();
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

}
