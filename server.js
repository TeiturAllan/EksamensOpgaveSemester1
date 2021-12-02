const { render, name } = require('ejs');
const express = require('express');
const app = express();

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false}))

const users = []


app.get('/', (req, res) => {
    res.render('index.ejs')
});



app.get('/login', (req, res) => {
    res.render('login.ejs')
    
})



app.post('/login', (req, res) => {
    
})



app.get('/register', (req, res) => {
    res.render('register.ejs')

})    



app.post('/register', (req, res) => {
    users.push({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password 
        })
    res.redirect('/register')
    console.log(users)
})




app.listen(3000);