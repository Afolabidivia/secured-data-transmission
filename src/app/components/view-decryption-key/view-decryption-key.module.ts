import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewDecryptionKeyComponent } from './view-decryption-key.component';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [ViewDecryptionKeyComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [ViewDecryptionKeyComponent]
})
export class ViewDecryptionKeyModule { }
