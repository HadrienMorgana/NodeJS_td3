// Dépendances native
const path = require('path')

// Dépendances 3rd party
const express = require('express')
const bodyParser = require('body-parser')
const sass = require('node-sass-middleware')
const db = require('sqlite')
const session = require('express-session')

// Constantes et initialisations
const PORT = process.PORT || 8080
const app = express()

// BODY PARSER
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

//Middleware de session
app.set('trust proxy', 1)
app.use(session({
 secret: 'topkek',
 resave: false,
 saveUninitialized: true,
 cookie: {
 maxAge: 1000 * 60 * 60,
 httpOnly: true
 }
}))
//DATABASE tableau promise
const tabPromises = () => {
  const listPromise = []

  listPromise.push(db.run('CREATE TABLE IF NOT EXISTS users (userid, pseudo, password, email, firstname, lastname, createdAt, updatedAt)'))
  listPromise.push(db.run('CREATE TABLE IF NOT EXISTS sessions (userid, accessToken, createdAt, expiresAt)'))

  return Promise.all(listPromise)

}


// DATABASE
db.open('expressapi.db').then(() => {
    return tabPromises()
  })
  /*db.run('CREATE TABLE IF NOT EXISTS users (userid, pseudo, password, email, firstname, lastname, createdAt, updatedAt)')
  .then(() => {
    console.log('> Database ready')
  })
    .then(() => {
      db.run('CREATE TABLE IF NOT EXISTS sessions (userid, accessToken, createdAt, expiresAt)')
    })*/
    .then(() => {
      console.log('> Databases ready')
    }).catch((err) => { // Si on a eu des erreurs
      console.error('ERR> ', err)
    })


// Enregistrer le token dans la session
//req.session.accessToken = monToken
// Récupérer le token
//console.log(req.session.accessToken)

// Mise en place des vues
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware pour parser le body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Préprocesseur sur les fichiers scss -> css
app.use(sass({
  src: path.join(__dirname, 'styles'),
  dest: path.join(__dirname, 'assets', 'css'),
  prefix: '/css',
  outputStyle: 'expanded'
}))

// On sert les fichiers statiques
app.use(express.static(path.join(__dirname, 'assets')))

// La liste des différents routeurs (dans l'ordre)
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))
app.use('/sessions', require('./routes/sessions'))

// Erreur 404
app.use(function(req, res, next) {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// Gestion des erreurs
// Notez les 4 arguments !!
app.use(function(err, req, res, next) {
  // Les données de l'erreur
  let data = {
    message: err.message,
    status: err.status || 500
  }

  // En mode développement, on peut afficher les détails de l'erreur
  if (app.get('env') === 'development') {
    data.error = err.stack
  }

  // On set le status de la réponse
  res.status(data.status)



  // Réponse multi-format
  res.format({
    html: () => { res.render('error', data) },
    json: () => { res.send(data) }
  })
})

app.listen(PORT, () => {
  console.log('Serveur démarré sur le port : ', PORT)
})
