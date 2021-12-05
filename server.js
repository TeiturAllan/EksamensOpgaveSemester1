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

//start of: Routing before login and routing to homepage
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
//End of: Routing before login and routing to homepage  


//Start of: Routing from homepage
app.get("/myAccount", checkAuthenticated, (req, res) => {
    res.render("accountPage.ejs", { usernameDisplay: req.user.username })
})



app.get("/listings", checkAuthenticated, (req, res) => {
    res.render("listings.ejs", { usernameDisplay: req.user.username })
})
//End of: Routing from homepage


//Start of: routing from "/MyAccount"
/*routing for homepage is the same as for every other page*/

app.get("/myAccount/changeAccountInformation", checkAuthenticated, (req, res) => {
    res.render("changeAccountInformation.ejs", { usernameDisplay: req.user.username })
})

/*route for "/listings/myListings will be the same as on the "/listings" page,
it is therefore reduntant to put it here. if you are looking for that route,
look under routing for listings page */

//End of: routing from "my Account"


//Start of: routing for "/listings"
/*routing for homepage is the same as for every other page*/

app.get("/listings/myListings", checkAuthenticated, (req, res) => {
    res.render("myListings.ejs", { usernameDisplay: req.user.username })
})

app.get("/listings/create", checkAuthenticated, (req, res) => {
    res.render("createListing.ejs", { usernameDisplay: req.user.username })
})
//End of: routing for "/listings"


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