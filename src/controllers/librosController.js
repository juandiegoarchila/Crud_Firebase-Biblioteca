const { getFirestore, collection, addDoc, getDoc, deleteDoc, doc, getDocs, updateDoc } = require('firebase/firestore');
const app = require('../config/Conexion');
const multer = require('multer');
const db = getFirestore(app);
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/imagenes');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

module.exports = {
  index: async function (req, res) {
    const librosCollection = collection(db, "libros");
    const librosSnapshot = await getDocs(librosCollection);
    const libros = librosSnapshot.docs.map((doc) => {
      const data = doc.data();
      return { id: doc.id, nombre: data.nombre, imagen: data.imagen };
    });

    res.render('libros/index', { libros: libros });
  },



  crear: function (req, res) {
    res.render('libros/crear');
  },

  crearLibro: async function (req, res) {
    try {
      const { nombre } = req.body;
      let imagen = null; // Inicializa imagen como null
  
      if (req.file) {
        // Si se ha subido una imagen, asigna el nombre del archivo a la variable imagen
        imagen = req.file.filename;
      }
  
      const librosCollection = collection(db, "libros");
      const nuevoLibro = {
        nombre,
        imagen,
      };
  
      await addDoc(librosCollection, nuevoLibro);
  
      res.redirect('/crud'); // Redirige al CRUD después de guardar el libro
    } catch (error) {
      console.error("Error al agregar libro: ", error);
      res.status(500).send("Error al agregar libro: " + error.message);
    }
  }
  ,

  eliminarLibro: async function (req, res) {
    try {
      const id = req.params.id; // Obtén el ID del libro a eliminar
  
      const librosCollection = collection(db, "libros");
      const libroRef = doc(librosCollection, id);
  
      // Obtén el documento y verifica si existe
      const libroSnapshot = await getDoc(libroRef);
  
      if (libroSnapshot.exists()) {
        const libroData = libroSnapshot.data();
        const imagenFileName = libroData.imagen;
  
        // Verifica si hay una imagen antes de intentar eliminarla
        if (imagenFileName) {
          // Elimina el archivo de imagen
          const imagePath = path.join(__dirname, '../public/imagenes', imagenFileName);
          fs.unlinkSync(imagePath);
        }
  
        // Luego, elimina el documento en Firestore
        await deleteDoc(libroRef);
  
        res.redirect('/crud'); // Redirige a la página de lista de libros después de la eliminación
      } else {
        res.status(404).send("El libro no se encontró en la base de datos.");
      }
    } catch (error) {
      console.error("Error al eliminar libro: ", error);
      res.status(500).send("Error al eliminar libro: " + error.message);
    }
  },
  
  mostrarFormularioEdicion: async function (req, res) {
    const id = req.params.id;
    const librosCollection = collection(db, 'libros');
    const libroRef = doc(librosCollection, id);
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
  
      const librosCollection = collection(db, "libros");
      const libroRef = doc(librosCollection, id);
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
  
  
  
  
}