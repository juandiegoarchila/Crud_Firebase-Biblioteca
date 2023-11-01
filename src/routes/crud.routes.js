const express = require('express');
const crudRouter = express.Router();
const Crud = require('../controllers/librosController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/public/imagenes');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const cargar = multer({ storage: storage });
crudRouter.get('/', Crud.index);
crudRouter.get('/crear', Crud.crear);
crudRouter.post('/crear', cargar.single('imagen'), Crud.crearLibro);
crudRouter.post('/eliminar/:id', Crud.eliminarLibro);

// Ahora debería reconocer las rutas relacionadas con la edición
crudRouter.get('/editar/:id', Crud.mostrarFormularioEdicion);

crudRouter.post("/actualizar", cargar.single('imagen'), Crud.actualizar);


module.exports = crudRouter;
