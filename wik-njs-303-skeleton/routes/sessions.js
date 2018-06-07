const router = require('express').Router()
const db = require('sqlite')
const bodyParser = require('body-parser')

router.get('/', (req, res, next) => {
  res.format({
    html: () => {
      res.render('sessions/login', {
        title: 'Log in',
        user: {},
        action: '/'
      })
    },
    json: () => {
      next(new Error('Bad request'))
    }
  })
})

router.post('/', (req, res, next) => {
  if(!req.body.pseudo || !req.body.password){
    next(new Error('All fields must be given.'))
  }
    Userid = `SELECT userid FROM users WHERE pseudo= ${req.body.pseudo}`
    // Enregistrer le token dans la session
     monToken = req.session.accessToken
    // Récupérer le token
    db.run("INSERT INTO sessions VALUES (?, ?, ?, ?)", Userid, monToken, new Date(), new Date(30000))
    .then(() => {
      res.format({
        html: () => { res.redirect('/users') },
        json: () => { res.status(201).send({message: 'success'}) }
      })
    }).catch(next)
    })

//router.delete('/')
module.exports = router
