import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';
import { NewMessageComponent } from './new-message.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [NewMessageComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [NewMessageComponent]
})
export class NewMessageModule { }
