import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore, getDoc, getDocs, updateDoc, collectionData, doc, query, orderBy, where, QuerySnapshot, DocumentData, setDoc, QueryDocumentSnapshot, getFirestore} from
'@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';

interface Gasto {
  categoria: string;
  monto: number;
}


@Injectable({
  providedIn: 'root'
})
export class FireService {

  constructor(private firestore : Firestore, private afAuth: AngularFireAuth) { }

  public async logIn(email : string, password : string)
  {
    return await this.afAuth.signInWithEmailAndPassword(email, password);
  }
  
  public async logOut()
  {
    return await this.afAuth.signOut();
  }

  public async getSueldoYUmbral(usuario: string): Promise<{ sueldo: number, umbral: number }> {
    const sueldosCollection = collection(this.firestore, 'sueldos');
    const querySnapshot = await getDocs(query(sueldosCollection, where('usuario', '==', usuario)));
    

    // Supongo que solo habrá un documento para el usuario, pero puedes manejar múltiples documentos si es necesario
    const doc = querySnapshot.docs[0];

    const data = doc.data();
    const sueldo = data['sueldo'];
    const umbral = data['umbral'];

    return { sueldo, umbral };
  }
  
  public async saveSueldo(usuario: string, sueldo: number, umbral: number) {
    const db = getFirestore(); // Asegúrate de importar getFirestore desde 'firebase/firestore'

    // Define la referencia al documento
    const docRef = doc(db, 'sueldos', usuario);

    // Verifica si el documento ya existe
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
        // Si el documento existe, actualiza los datos
        await setDoc(docRef, {
            usuario: usuario,
            sueldo: sueldo,
            umbral: umbral
        }, { merge: true });
    } else {
        // Si el documento no existe, créalo
        await setDoc(docRef, {
            usuario: usuario,
            sueldo: sueldo,
            umbral: umbral
        });
    }
}

  public async getUserUid()
  {
    return new Promise<string | null>((resolve, reject) => 
    {
      this.afAuth.authState.subscribe(user => {
        if (user) {
          resolve(user.uid);
        } else {
          resolve(null); 
        }
      });
    });
  }

  public async saveGasto(usuarioId: string, categoria: string, monto: number, fecha: string) {
    const gastosCollection = collection(this.firestore, 'gastos');
    const usuarioDoc = doc(this.firestore, 'usuarios', usuarioId);

    // Guarda el gasto en la colección 'gastos'
    const gastoDocRef = await addDoc(gastosCollection, {
      usuarioId: usuarioId,
      categoria: categoria,
      monto: monto,
      fecha: fecha,
    });

    // Actualiza o crea el registro de gastos acumulados en la colección 'usuarios'
    const usuarioData = await getDoc(usuarioDoc);
    const usuarioGastosAcumulados = usuarioData.exists() ? usuarioData.data() : {};

    if (usuarioGastosAcumulados[categoria]) {
      usuarioGastosAcumulados[categoria] += monto;
    } else {
      usuarioGastosAcumulados[categoria] = monto;
    }

    // Actualiza los gastos acumulados en el documento del usuario
    await setDoc(usuarioDoc, usuarioGastosAcumulados);

    return gastoDocRef.id; // Devuelve el ID del gasto recién creado
  }

  // public async getGastosPorCategoria(usuarioId: string) {
  //   const gastosCollection = collection(this.firestore, 'gastos');
  //   const q = query(gastosCollection, where('usuarioId', '==', usuarioId));
  //   const querySnapshot = await getDocs(q);
  
  //   const gastosPorCategoria: Record<string, number> = {};
  
  //   querySnapshot.forEach((doc) => {
  //     const gasto = doc.data() as Gasto; // Asegura que el tipo de Gasto sea el adecuado
  //     const categoria = gasto.categoria;
  //     const monto = gasto.monto;
  
  //     if (!gastosPorCategoria[categoria]) {
  //       gastosPorCategoria[categoria] = 0;
  //     }
  
  //     gastosPorCategoria[categoria] += monto;
  //   });
  
  //   // Ahora tienes un objeto gastosPorCategoria que contiene las categorías y los montos acumulados
  //   // Puedes devolver este objeto si lo necesitas en otro lugar de tu aplicación
  
  //   return gastosPorCategoria;
  // }
  
  // public async getSueldos(usuarioId: string) {
  //   const sueldosCollection = collection(this.firestore, 'sueldos');
  //   const q = query(sueldosCollection, where('usuarioId', '==', usuarioId));
  //   const querySnapshot = await getDocs(q);
  
  //   const sueldos : any = [];
  
  //   querySnapshot.forEach((doc) => {
  //     const sueldo = doc.data();
  //     sueldos.push(sueldo);
  //   });
  
  //   return sueldos;
  // }

  // public async getGastosVsAhorro(usuarioId: string) {
  //   // Obtiene los gastos por categoría
  //   const gastosPorCategoria = await this.getGastosPorCategoria(usuarioId);
  
  //   // Obtiene los sueldos del usuario
  //   const sueldos = await this.getSueldos(usuarioId);
  
  //   // Calcula el ahorro anualizado
  //   let gastoAnualizado = 0;
  //   let sueldoAnualizado = 0;
  
  //   for (const sueldo of sueldos) {
  //     sueldoAnualizado += sueldo.sueldo;
  //   }
  
  //   for (const categoria in gastosPorCategoria) {
  //     gastoAnualizado += gastosPorCategoria[categoria];
  //   }
  
  //   const ahorroAnualizado = sueldoAnualizado - gastoAnualizado;
  
  //   // Puedes retornar los valores de gastoAnualizado, sueldoAnualizado y ahorroAnualizado
  //   return {
  //     gastoAnualizado,
  //     sueldoAnualizado,
  //     ahorroAnualizado,
  //   };
  // }

  async obtenerGastosPorCategoria(userId: string): Promise<any[]> {
    try {
      const gastosCollection = collection(this.firestore, 'gastos');
      const q = query(gastosCollection, where('usuarioId', '==', userId));
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
  
      const categorias: string[] = []; // Array para almacenar las categorías únicas
      const gastosPorCategoria: { categoria: string, total: number }[] = [];
  
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const gasto = doc.data() as Gasto;
        const categoria = gasto.categoria;
        const monto = gasto.monto;
  
        // Verificar si la categoría ya existe en el array
        const categoriaExistente = categorias.find((c) => c === categoria);
  
        if (!categoriaExistente) {
          categorias.push(categoria);
          gastosPorCategoria.push({ categoria, total: monto });
        } else {
          // Si la categoría ya existe, agregar el monto al total existente
          const categoriaIndex = categorias.indexOf(categoria);
          gastosPorCategoria[categoriaIndex].total += monto;
        }
      });
      console.log("Datos de gastos obtenidos:", gastosPorCategoria);

      return gastosPorCategoria;
    } catch (error) {
      // Manejar el error de alguna manera, por ejemplo, registrándolo o lanzando una excepción personalizada.
      console.error('Error al obtener los gastos por categoría:', error);
      throw error; // Lanzar una excepción si es apropiado para tu caso.
    }
  }
  
  

  //   const gastosCollection = collection(this.firestore, 'gastos');
  //   const q = query(gastosCollection, where('usuarioId', '==', usuarioId));
  //   const querySnapshot = await getDocs(q);

  public async getImages(beauty : boolean) {
    const imageCollection = collection(this.firestore, 'image');
  
    // Crea una consulta que ordena las imágenes por timestamp en orden descendente
    let q = null;
    if(beauty)
    {
      q = query(imageCollection, 
        where('Beauty', '==', true),
        orderBy('timestamp', 'desc')
      );
    }
    else{
       q = query(imageCollection, 
        where('Beauty', '==', false),
        orderBy('timestamp', 'desc')
      );
    }
  
    const querySnapshot = await getDocs(q);
    const images = querySnapshot.docs.map(doc => doc.data());
    return images;
  }  
  
  
  public async getUser()
  {
    const imageCollection = collection(this.firestore, 'image');
    const querySnapshot = await getDocs(imageCollection);
    const images = querySnapshot.docs.map(doc => doc.data());
    return images;
  }
  
  public async getUsers()
  {
    const imageCollection = collection(this.firestore, 'user');
    const querySnapshot = await getDocs(imageCollection);
    const images = querySnapshot.docs.map(doc => doc.data());
    console.log(images);
  }

  public async getUserNameByUID(UIDUser: string)
  {
    const userCollection = collection(this.firestore, 'users');
    const userDoc = doc(userCollection, UIDUser);
    const userDocSnapshot = await getDoc(userDoc);
    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data();
      return userData['perfil'];
    } 
    else 
    {
      console.log('Usuario no encontrado');
      return '';
    }
  }
  public async getImagesGrafico(beauty:boolean) {
    const imageCollection = collection(this.firestore, 'image');

    // Crea una consulta que obtiene las imágenes de tipo "Beauty"
    const q = query(imageCollection, where('Beauty', '==', beauty));

    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    
    const imagesWithUsernamesPromises = querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const usuario = await this.getUserNameByUID(data['UIDUser']);
      return {
        usuario: usuario,
        votos: data['votos'], // Reemplaza con el campo correcto de votos de tu imagen
      };
    });
  
    // Espera a que todas las promesas se completen
    return Promise.all(imagesWithUsernamesPromises);
  }
  public async obtenerGastosVsAhorroAnualizado(usuarioId: string): Promise<{ gastoAnualizado: number, sueldoAnualizado: number, ahorroAnualizado: number }> {
    try {
      // Realiza una consulta para obtener los gastos del usuario
      const gastosCollection = collection(this.firestore, 'gastos');
      const q = query(gastosCollection, where('usuarioId', '==', usuarioId));
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

      let gastoAnualizado = 0;

      querySnapshot.forEach((doc) => {
        const gasto = doc.data() as Gasto; // Asegura que el tipo de Gasto sea el adecuado
        gastoAnualizado += gasto.monto;
      });

      // Realiza una consulta para obtener los sueldos del usuario
      const sueldosCollection = collection(this.firestore, 'sueldos');
      const sueldosQuery = query(sueldosCollection, where('usuario', '==', usuarioId));
      const sueldosQuerySnapshot: QuerySnapshot<DocumentData> = await getDocs(sueldosQuery);

      let sueldoAnualizado = 0;
      let umbral = 0;
      sueldosQuerySnapshot.forEach((doc) => {
        const sueldo = doc.data();
        sueldoAnualizado += sueldo['sueldo'];
        umbral = sueldo['umbral'];
      });

      // Calcula el ahorro anualizado restando los gastos de los sueldos
      const ahorroAnualizado = sueldoAnualizado - umbral;

      return {
        gastoAnualizado,
        sueldoAnualizado,
        ahorroAnualizado,
      };
    } catch (error) {
      console.error('Error al obtener gastos vs. ahorro anualizado:', error);
      throw error;
    }
  }
}
