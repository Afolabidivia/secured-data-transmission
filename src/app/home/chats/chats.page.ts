import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit, AfterViewInit, OnDestroy {
  userId: string;
  chatId;
  userInfo;
  userData;
  messages;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService,
    private authService: AuthService
    ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('userId') && !paramMap.has('chatId')) {
        this.router.navigateByUrl('/');
        return;
      }
      this.userId = paramMap.get('userId');
      this.chatId = paramMap.get('chatId');

      this.firebaseService.getUser(this.userId)
        .then(user => {
          this.userInfo = user.val();
        });

      this.authService.userData.subscribe(val => {
        this.userData = val;
      });

      this.firebaseService.syncMessages(this.chatId);
    });
  }

  ngAfterViewInit() {
    this.firebaseService.messages.subscribe(resp => {
      if (resp) {
        this.messages = Object.values(resp);
        return;
      }
    });
  }

  submitMessage(form: NgForm) {
    const message = form.value.chatMessage;
    const sender = this.userData.id;
    console.log(form.value);
    console.log(this.userData);
    this.firebaseService.addMessage(sender, this.userId, {message, sender});
    form.reset();
  }

  ngOnDestroy() {
    this.firebaseService.destroyMessages();
  }

}
