import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SueldoPage } from './sueldo.page';

const routes: Routes = [
  {
    path: '',
    component: SueldoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SueldoPageRoutingModule {}
