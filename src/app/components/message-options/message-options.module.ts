import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MessageOptionsComponent } from './message-options.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [MessageOptionsComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [MessageOptionsComponent]
})
export class MessageOptionsModule { }
