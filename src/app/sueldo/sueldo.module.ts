import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SueldoPageRoutingModule } from './sueldo-routing.module';

import { SueldoPage } from './sueldo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SueldoPageRoutingModule
  ],
  declarations: [SueldoPage]
})
export class SueldoPageModule {}
