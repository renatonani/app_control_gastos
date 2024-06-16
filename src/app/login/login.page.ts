import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { FireService } from '../services/fire.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = '';
  password: string = '';
  formSubmitted: boolean = false; 

  constructor(
  private afAuth: FireService,
  private router: Router,  
  public toastController : ToastController) {}

  async login() {  
    if(this.ValidarDatos())
    {
      try {
        const userCredential = await this.afAuth.logIn(
          this.email,
          this.password
        );
  
        if (userCredential.user) {
          // Autenticación exitosa, redirige al usuario a la página principal
          this.router.navigate(['/sueldo']);
        }
        
      } catch (error:any) {
        // Autenticación fallida, muestra un mensaje de error al usuario
        this.imprimirToast("¡Los datos son incorrectos!");
      }      
    }    
  }   

  ValidarDatos() 
  {
    if(this.email == "" || this.password == "")
    {
      //llamar a toast con el parametro que diga que algun dato esta incompleto
      this.imprimirToast("¡Falta completar el correo o la contraseña!");
      return false;
    }
    if(!(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(this.email))) 
    {
      // La variable 'email' NO tiene un formato válido de correo electrónico
      this.imprimirToast("¡El formato del correo no es válido!");
      return false;
    }
    if(this.password.length < 6)
    {
      //llamar al toast diciendo que la contraseña tiene que tener como minimo 6 caracteres.
      this.imprimirToast("¡La contraseña debe contener al menos 6 caracteres!");
      return false;
    }

    //Los datos son válidos.
    return true;
  }

  AutoRellenar(correo :string, contraseña :string)
  {
    this.email = correo;
    this.password = contraseña;
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






