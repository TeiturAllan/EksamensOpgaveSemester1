if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const fs = require('fs')  
const express = require('express')
const app = express()
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
  
const initializePassport = require('./passportConfig')
const { json } = require('express')
    initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)
  


app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
  
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { usernameDisplay: req.user.username })
})



app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})
  


app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))
  


app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
  })
  
app.post('/register', checkNotAuthenticated, (req, res) => {
    newUser.push({
        id: Date.now().toString(),
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
    res.redirect('/login')

    let newUserCreated = JSON.stringify(newUser, null, 2);
    fs.writeFile('usersData.json', newUserCreated, (err) => {
    if (err) throw err;
    console.log('New User added to database')
    console.log(users)
})
})
  


app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})
  


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/login')
}
  


function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
}

let newUser = []
let userRawData = fs.readFileSync('usersData.json')
let users = JSON.parse(userRawData)

app.listen(3000)