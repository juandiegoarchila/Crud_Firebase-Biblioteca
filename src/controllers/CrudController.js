const { getFirestore, collection, addDoc, getDoc, deleteDoc, doc, getDocs, updateDoc } = require('firebase/firestore');
const app = require('../config/Conexion');
const multer = require('multer');
const db = getFirestore(app);
const fs = require('fs');
const path = require('path');

module.exports = {
  index: async function (req, res) {
    const crudCollection = collection(db, "CRUD"); 
    const CrudSnapshot = await getDocs(crudCollection); 
    const CRUD = CrudSnapshot.docs.map((doc) => {
      const data = doc.data();
      return { id: doc.id, nombre: data.nombre, imagen: data.imagen };
    });

    res.render('Crud/index', { CRUD: CRUD });
  },

  crear: function (req, res) {
    res.render('Crud/crear');
  },

  creardato: async function (req, res) {
    try {
      const { nombre } = req.body;
      let imagen = null;
  
      if (req.file) {
        imagen = req.file.filename;
      }
  
      if (!nombre && !imagen) {
        req.flash('error_msg', 'Debes proporcionar al menos un campo (nombre o archivo)');
        // Pasa el nombre ingresado por el usuario de vuelta al formulario
        return res.render('Crud/crear', { nombre, error_msg: req.flash('error_msg') });
      }
  
      const crudCollection = collection(db, "CRUD");
      const nuevodato = {
        nombre,
        imagen,
      };
  
      await addDoc(crudCollection, nuevodato);
  
      // Agrega un mensaje de éxito a los flash antes de redirigir
      req.flash('success_msg', 'Creación de un nuevo libro');
  
      res.redirect('/crud');
    } catch (error) {
      console.error("Error al agregar dato: ", error);
      res.status(500).send("Error al agregar dato: " + error.message);
    }
  }
  ,


  eliminar: async function (req, res) {
    try {
      const id = req.params.id; 
  
      const crudCollection = collection(db, "CRUD"); 
      const elementoRef = doc(crudCollection, id); 
  
      // Obtén el elemento y verifica si existe
      const elementoSnapshot = await getDoc(elementoRef);
  
      if (elementoSnapshot.exists()) {
        const elementoData = elementoSnapshot.data();
  
        // Verifica si hay una imagen antes de intentar eliminarla (si es aplicable)
        if (elementoData.imagen) {
          // Elimina el archivo de imagen si es necesario
          const imagePath = path.join(__dirname, '../public/imagenes', elementoData.imagen);
          fs.unlinkSync(imagePath);
        }
  
        // Luego, elimina el elemento en Firestore
        await deleteDoc(elementoRef);
  
        // Agrega un mensaje de éxito a los flash antes de redirigir
        req.flash('success_msg', 'Libro eliminado con éxito');
  
        res.redirect('/crud'); // Redirige a la página de lista de elementos después de la eliminación
      } else {
        res.status(404).send("El elemento no se encontró en la base de datos.");
      }
    } catch (error) {
      console.error("Error al eliminar elemento: ", error);
      res.status(500).send("Error al eliminar elemento: " + error.message);
    }
  },
  
  
  mostrarFormularioEdicion: async function (req, res) {
    const id = req.params.id;
    const crudCollection = collection(db, 'CRUD'); 
    const CrudRef = doc(crudCollection, id); 
    const CrudSnapshot = await getDoc(CrudRef);

    if (CrudSnapshot.exists()) {
      const CrudData = CrudSnapshot.data();
      res.render('Crud/editar', { Tabla: CrudData, id: id }); // Pasar el 'id' a la vista
    } else {
      res.status(404).send('El libro no se encontró en la base de datos.');
    }
  },

  actualizar: async function (req, res) {
    try {
      const id = req.body.id;
      const { nombre, imagen } = req.body;
  
      const crudCollection = collection(db, "CRUD"); 
      const CrudRef = doc(crudCollection, id); 
      const CrudSnapshot = await getDoc(CrudRef);
  
      if (CrudSnapshot.exists()) {
        const CrudData = CrudSnapshot.data();
  
        // Verifica si se ha subido una nueva imagen
        if (req.file) {
          // Procesa y guarda la nueva imagen en el servidor
          const nuevaImagen = req.file.filename;
  
          // Borra la imagen antigua del servidor si es necesario
          if (CrudData.imagen) {
            const imagePath = path.join(__dirname, '../public/imagenes', CrudData.imagen);
            fs.unlinkSync(imagePath);
          }
  
          // Actualiza el campo 'imagen' con el nombre de la nueva imagen
          CrudData.imagen = nuevaImagen;
        }
  
        // Actualiza el campo 'nombre'
        CrudData.nombre = nombre;
  
        // Actualiza el documento en Firestore
        await updateDoc(CrudRef, CrudData);
  
        // Agrega un mensaje de éxito a los flash antes de redirigir
        req.flash('success_msg', 'El libro fue actualizado con éxito');
  
        res.redirect("/crud");
      } else {
        console.log("Libro no encontrado en Firestore. Redireccionando...");
        res.status(404).send("El libro no se encontró en la base de datos.");
      }
    } catch (error) {
      console.error("Error al actualizar el libro: ", error);
      res.status(500).send("Error al actualizar el libro: " + error.message);
    }
  }
}  