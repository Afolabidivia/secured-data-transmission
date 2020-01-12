import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  userId;
  userData;
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private firebaseService: FirebaseService
  ) { }

  ngOnInit() {
    this.isLoading = true;
    
    this.authService.userId.subscribe(val => {
      this.userId = val;
      console.log(this.userId);
      
      this.firebaseService.getUser(this.userId)
        .then(resp => {
          this.isLoading = false;
          this.userData = resp.val();
          console.log(resp.val());
          
        });
    });
  }

}
