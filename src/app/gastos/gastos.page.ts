import { Component } from '@angular/core';
import { FireService } from '../services/fire.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.page.html',
  styleUrls: ['./gastos.page.scss'],
})
export class GastosPage {
  categoria: any;
  monto: any;
  fecha: any;

  constructor(private firestore: FireService,
              private toastController: ToastController) {}

  async guardarGasto() {
    if (!this.categoria || !this.monto || !this.fecha) {
      console.log('Por favor, complete todos los campos.');
      this.imprimirToast("Por favor, complete todos los campos.")
      return;
    }

    const usuarioId = await this.firestore.getUserUid();
    if (!usuarioId) {
      console.log('Usuario no autenticado.');
      return;
    }

    // Envía los datos del gasto a Firebase
    this.firestore.saveGasto(usuarioId, this.categoria, this.monto, this.fecha)
      .then((docId) => {
        console.log(`Gasto guardado en Firestore con ID: ${docId}`);
        this.imprimirToast("Se registró correctamente el gasto.");
        // Realiza cualquier otra acción que desees después de guardar el gasto.
      })
      .catch((error) => {
        console.error('Error al guardar el gasto en Firestore:', error);
      });
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
}
