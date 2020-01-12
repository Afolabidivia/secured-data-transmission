import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { NewMessageComponent } from '../components/new-message/new-message.component';
import { NewMessageModule } from '../components/new-message/new-message.module';
import { ChatsPage } from './chats/chats.page';
import { ProfilePage } from './profile/profile.page';

@NgModule({
  entryComponents: [
    NewMessageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewMessageModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage,
        pathMatch: 'full'
      },
      {
        path: ':userId/:chatId',
        component: ChatsPage
      },
      {
        path: 'profile',
        component: ProfilePage
      }
    ])
  ],
  declarations: [HomePage, ChatsPage, ProfilePage]
})
export class HomePageModule {}
