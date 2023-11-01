const { getFirestore, collection, addDoc, getDoc, deleteDoc, doc, getDocs, updateDoc } = require('firebase/firestore');
const app = require('../config/Conexion');
const multer = require('multer');
const db = getFirestore(app);
const fs = require('fs');
const path = require('path');

module.exports = {
  index: async function (req, res) {
    const crudCollection = collection(db, "CRUD"); 
    const librosSnapshot = await getDocs(crudCollection); 
    const libros = librosSnapshot.docs.map((doc) => {
      const data = doc.data();
      return { id: doc.id, nombre: data.nombre, imagen: data.imagen };
    });

    res.render('libros/index', { libros: libros });
  },

  crear: function (req, res) {
    res.render('libros/crear');
  },

  creardato: async function (req, res) {
    try {
      const { nombre } = req.body;
      let imagen = null; // Inicializa imagen como null

      if (req.file) {
        // Si se ha subido una imagen, asigna el nombre del archivo a la variable imagen
        imagen = req.file.filename;
      }

      const crudCollection = collection(db, "CRUD"); 
      const nuevodato = {
        nombre,
        imagen,
      };

      await addDoc(crudCollection, nuevodato); 

      res.redirect('/crud'); // Redirige al CRUD después de guardar el libro
    } catch (error) {
      console.error("Error al agregar libro: ", error);
      res.status(500).send("Error al agregar libro: " + error.message);
    }
  },

  eliminar: async function (req, res) {
    try {
      const id = req.params.id; // Obtén el ID del elemento a eliminar
  
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
    const libroRef = doc(crudCollection, id); 
    const libroSnapshot = await getDoc(libroRef);

    if (libroSnapshot.exists()) {
      const libroData = libroSnapshot.data();
      res.render('libros/editar', { libro: libroData, id: id }); // Pasar el 'id' a la vista
    } else {
      res.status(404).send('El libro no se encontró en la base de datos.');
    }
  },

  actualizar: async function (req, res) {
    try {
      const id = req.body.id;
      const { nombre, imagen } = req.body;

      const crudCollection = collection(db, "CRUD"); 
      const libroRef = doc(crudCollection, id); 
      const libroSnapshot = await getDoc(libroRef);

      if (libroSnapshot.exists()) {
        const libroData = libroSnapshot.data();

        // Verifica si se ha subido una nueva imagen
        if (req.file) {
          // Procesa y guarda la nueva imagen en el servidor
          const nuevaImagen = req.file.filename;

          // Borra la imagen antigua del servidor si es necesario
          if (libroData.imagen) {
            const imagePath = path.join(__dirname, '../public/imagenes', libroData.imagen);
            fs.unlinkSync(imagePath);
          }

          // Actualiza el campo 'imagen' con el nombre de la nueva imagen
          libroData.imagen = nuevaImagen;
        }

        // Actualiza el campo 'nombre'
        libroData.nombre = nombre;

        // Actualiza el documento en Firestore
        await updateDoc(libroRef, libroData);

        console.log("Libro actualizado en Firestore.");
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
};
