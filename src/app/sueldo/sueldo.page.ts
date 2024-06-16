import { Component, OnInit } from '@angular/core';
import { FireService } from '../services/fire.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sueldo',
  templateUrl: './sueldo.page.html',
  styleUrls: ['./sueldo.page.scss'],
})
export class SueldoPage implements OnInit {

  sueldo :any;
  umbralGasto:any;
  usuarioId: any;
  porcentaje : any;
  sueldoAnterior :any;
  umbralAnterior: any;
  constructor(private firestore : FireService,
    public toastController : ToastController,
    private router: Router) { }

  async ngOnInit() {

    const usuario = await this.firestore.getUserUid() || "";
    const result = await this.firestore.getSueldoYUmbral(usuario);

    if (result) {
      this.sueldoAnterior = result.sueldo;
      this.umbralAnterior = result.umbral;
      console.log( this.sueldoAnterior,this.umbralAnterior)
    } else {
      // Manejar el caso en el que no se encontró ningún documento para el usuario
      // Puedes mostrar un mensaje de error o realizar alguna otra acción.
    }
  }

  async guardarSueldoYTope() {
    if (this.sueldo && this.porcentaje) {
      if (this.porcentaje > 100) {
        this.imprimirToast('El umbral no puede ser mayor al 100%');
        return;
      }

      this.usuarioId = await this.firestore.getUserUid(); // Espera a que getUserUid() se complete      
      if (this.usuarioId) {
        this.umbralGasto = this.sueldo * this.porcentaje / 100;
        this.firestore.saveSueldo(this.usuarioId, this.sueldo, this.umbralGasto)
          .then(async (docId) => {
            console.log(`Datos guardados exitosamente en Firestore con ID: ${docId}`);
            // Realiza cualquier otra acción que desees después de guardar los datos.
            const usuario = await this.firestore.getUserUid() || "";
            const result = await this.firestore.getSueldoYUmbral(usuario);
            this.sueldoAnterior = result.sueldo;
            this.umbralAnterior = result.umbral;
          })
          .catch((error) => {
            console.error('Error al guardar datos en Firestore:', error);
          });
      } else {
        console.log('Usuario no autenticado.');
      }
    } else {
      this.imprimirToast('Por favor, complete todos los campos.');
    }
  }

  async imprimirToast(mensaje:string)
  {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom'
    })
    await toast.present();
  }

  agregarGasto()
  {
    this.router.navigateByUrl("/gastos")
  }

  verGraficos()
  {
    this.router.navigateByUrl("/graficos")
  }
  logout()
  {
    this.firestore.logOut();
    this.router.navigateByUrl("/login");
  }
}
