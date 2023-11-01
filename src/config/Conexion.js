const { initializeApp, getApps } = require("firebase/app");

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBxrcIKdwV9kLuCgy6HhhH7nVmnZhHWV5Q",
    authDomain: "notes-app-e2ea9.firebaseapp.com",
    projectId: "notes-app-e2ea9",
    storageBucket: "notes-app-e2ea9.appspot.com",
    messagingSenderId: "333211508078",
    appId: "1:333211508078:web:9cbd017db80b29d39d357f"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
module.exports = app; 
// Verificar la conexión a Firebase
if (getApps().length > 0) {
  console.log('Conexión de Firebase establecida exitosamente');
  // Puedes agregar código adicional aquí para interactuar con Firebase
} else {
  console.log('Error al conectarse a Firebase.');
}
