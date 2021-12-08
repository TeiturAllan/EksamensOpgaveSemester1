//discovered bug: when a new user is created, he can not log in until server has been restarted



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
const multer = require('multer')

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
app.use(express.static('public'))


//start of: strategy for uploading images
const storage = multer.diskStorage({
    destination: function(request, file, cb) {
        cb(null, 'public');
    },
    filename: function(req, file, cb) {
        cb(null, (file.originalname))
    }
});

const imageFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null, true);
    } else {
    cb(null, false);
    }
};

const upload = multer({
    storage: storage, 
    limits: imageFilter})
//end of: strategy for uploading image



//start of: strategy for persistant login, 
//large portion of this is saved in file "passportConfig"
const initializePassport = require('./passportConfig')
const { json } = require('express')
    initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)
//end of: strategy for persistant login  



//start of: routing and code for login/register users
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
    users.push({
        id: Date.now().toString(),
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
    res.redirect('/login')
    let saveAllUserstoDB = JSON.stringify(users, null, 2);
    fs.writeFile('usersData.json', saveAllUserstoDB, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('new user created')
        }
    }) 
})
//end of: routing and code for login/register users
  

//start of: logout function
app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})
//end of: logout function  
 


//Start of: Routing from homepage
app.get("/myAccount", checkAuthenticated, (req, res) => {
    res.render("accountPage/accountPage.ejs", { usernameDisplay: req.user.username })
})



app.get("/listings", checkAuthenticated, (req, res) => {
    res.render("listings/listings.ejs", { usernameDisplay: req.user.username })
})
//End of: Routing from homepage


//Start of: routing from "/MyAccount"
/*routing for homepage is the same as for every other page*/

app.get("/myAccount/changeAccountInformation", checkAuthenticated, (req, res) => {
    res.render("accountPage/changeAccountInformation.ejs", { usernameDisplay: req.user.username })
})

/*route for "/listings/myListings will be the same as on the "/listings" page,
it is therefore reduntant to put it here. if you are looking for that route,
look under routing for listings page */

//End of: routing from "my Account"


//Start of: routing for "/listings"
/*routing for homepage is the same as for every other page*/

app.get("/listings/myListings", checkAuthenticated, (req, res) => {
    res.render("listings/myListings/myListings.ejs", { usernameDisplay: req.user.username })
})

app.get("/listings/create", checkAuthenticated, (req, res) => {
    res.render("listings/listingCreate/listingCreate.ejs", { usernameDisplay: req.user.username })
})


//start of: code for creating a listing
app.post('/listings/create', upload.single('image'), checkAuthenticated, (req, res) => {
    listings.push({
        id: Date.now().toString(),
        productSummary: req.body.productSummary,
        price: req.body.price,
        category: req.body.category,
        listingOwner: req.user.username,
        listingsOwnerId: req.user.id,
        listingsOwnerEmail: req.user.email,
        productImage: req.file.originalname
    })
    let saveAllListingsToDB = JSON.stringify(listings, null, 2);
    fs.writeFile('listingsData.json', saveAllListingsToDB, (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log('New listing created')
        }
        res.redirect('/listings/create')
    })
})
//end of: code for creating a listing










//start of: routing for listings by category
app.get("/listings/cases", checkAuthenticated, (req, res) => {
    let listingsWithCategoryCase = listings.filter(function(showOnlyCaseListings) {
        return showOnlyCaseListings.category == "Case"})
   res.render("listings/listingsCase/listingsCase.ejs",
    { usernameDisplay: req.user.username, Listings: listingsWithCategoryCase })
})

app.get("/listings/CPUs", checkAuthenticated, (req, res) => {
    let listingsWithCategoryCPU = listings.filter(function(showOnlyCPUListings) {
        return showOnlyCPUListings.category == "CPU"})
    res.render("listings/listingsCPU/listingsCPU.ejs", 
    { usernameDisplay: req.user.username, Listings: listingsWithCategoryCPU})
})

app.get("/listings/CPUCoolers", checkAuthenticated, (req, res) => {
    let listingsWithCategoryCPUCooler = listings.filter(function(showOnlyCPUCoolerListings) {
        return showOnlyCPUCoolerListings.category == "CPUCooler"})
    res.render("listings/listingsCPUCooler/listingsCPUCooler.ejs",
    { usernameDisplay: req.user.username, Listings: listingsWithCategoryCPUCooler })
})

app.get("/listings/displays", checkAuthenticated, (req, res) => {
    let listingsWithCategoryDisplay = listings.filter(function(showOnlyDisplayListings) {
        return showOnlyDisplayListings.category == "Display"})
    res.render("listings/listingsDisplay/listingsDisplay.ejs",
     { usernameDisplay: req.user.username, Listings: listingsWithCategoryDisplay })
})

app.get("/listings/GPUs", checkAuthenticated, (req, res) => {
    let listingsWithCategoryGPU = listings.filter(function(showOnlyGPUListings) {
        return showOnlyGPUListings.category == "GPU"})
    res.render("listings/listingsGPU/listingsGPU.ejs", 
    { usernameDisplay: req.user.username, Listings: listingsWithCategoryGPU })
})

app.get("/listings/motherboards", checkAuthenticated, (req, res) => {
    let listingsWithCategoryMotherboard = listings.filter(function(showOnlyMotherboardListings) {
        return showOnlyMotherboardListings.category == "Motherboard"})
    res.render("listings/listingsMotherboard/listingsMotherboard.ejs",
     { usernameDisplay: req.user.username, Listings: listingsWithCategoryMotherboard })
})

app.get("/listings/peripherals", checkAuthenticated, (req, res) => {
    let listingsWithCategoryPeripheral = listings.filter(function(showOnlyPeripheralListings) {
        return showOnlyPeripheralListings.category == "Peripheral"})
    res.render("listings/listingsPeripherals/listingsPeripherals.ejs",
     { usernameDisplay: req.user.username, Listings: listingsWithCategoryPeripheral })
})

app.get("/listings/PSUs", checkAuthenticated, (req, res) => {
    let listingsWithCategoryPSU = listings.filter(function(showOnlyPSUListings) {
        return showOnlyPSUListings.category == "PSU"})
    res.render("listings/listingsPSU/listingsPSU.ejs", 
    { usernameDisplay: req.user.username, Listings: listingsWithCategoryPSU })
})

app.get("/listings/RAM", checkAuthenticated, (req, res) => {
    let listingsWithCategoryRAM = listings.filter(function(showOnlyRAMListings) {
        return showOnlyRAMListings.category == "RAM"})
    res.render("listings/listingsRAM/listingsRAM.ejs", 
    { usernameDisplay: req.user.username, Listings: listingsWithCategoryRAM })
})

app.get("/listings/storage", checkAuthenticated, (req, res) => {
    let listingsWithCategoryStorage = listings.filter(function(showOnlyStorageListings) {
        return showOnlyStorageListings.category == "Storage"})
    res.render("listings/listingsStorage/listingsStorage.ejs",
     { usernameDisplay: req.user.username, Listings:  listingsWithCategoryStorage })
})
//End of: routing for listings categories
//End of: routing for "/listings"


//start of: strategy for only allowing users who are logged in, to view webpage
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
//end of: strategy for only allowing users who are logged in, to view webpage




//start of: reading data from storage/DB
let userRawData = fs.readFileSync('usersData.json')
let users = JSON.parse(userRawData)
console.log('Users data read/loaded to server memory')
let listingsRawData = fs.readFileSync('listingsData.json')
let listings = JSON.parse(listingsRawData)
console.log('Listings data read/loaded to server memory')
//end of: reading data from storage/DB


console.log('listings filter into categories')
//end of: filtering listings into categories

module.exports = listings

app.listen(3000)
