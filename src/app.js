const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session'); // Importa express-session

const app = express();

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});


// Importa la configuración de Firebase
const firebaseApp = require('./config/Conexion');

// Importa 'crudRouter' después de inicializar 'app'
const crudRouter = require('./routes/crud.routes');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Establece la carpeta de vistas y el motor de vistas EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Rutas para el CRUD 
app.use('/crud', crudRouter); // Asegúrate de que la ruta '/crud' coincida con la que estás utilizando en tus definiciones de rutas

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server on port ${port}`);
});
