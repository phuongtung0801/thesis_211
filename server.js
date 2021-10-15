//add env vào project
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express') //thư viện để chạy server
const app = express()
const bcrypt = require('bcrypt') //thư viện để encrypt password
const passport = require('passport') //thư viện để thực hiện các tác vụ xác thực user
const flash = require('express-flash') //thư viện để send message cho user khi xác thực
const session = require('express-session') //thư viện để lưu data vào cookie khi user login
const methodOverride = require('method-override') //thư viện để ghi đề các HTTP request

const initializePassport = require('./passport-config').initializeFunction //require function từ file passport-config
//pass vào function này 3 arguments: passport để dùng passport,
//function  getUserByEmail và getUserById
initializePassport(
  passport,
  //getUserByEmail so sánh email mà user nhập vào ở '/login' và email của user đã lưu
  //trong users, nếu trùng nhau thì trả về object users
  (mail) => {return users.find(user => user.email === mail)}, 
    //  console.log(users.find(user => user.email === mail))}, //getUserByEmail
  //getUserById so sánh Id của user nhập vào ở '/login' và email của user đã lưu
  //trong users, nếu trùng nhau thì trả về object users
  i => {return users.find(user => user.id === i)} //getUserById     
)

//tạo một object để lưu thông tin user
const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
//tạo session và gửi set-cookie response cho browser, nếu http req có cookie,
//express-session sẽ 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}))
app.use((req, res, next) => {
  console.log(req.session)
  next()
})
//initialize() setups the functions to serialize/deserialize the user data from the request.
app.use(passport.initialize()) 
app.use(passport.session()) //liên quan đến deserializeUser()

app.use(methodOverride('_method'))
//app.use(require('./routes'))



/*ROUTES*/
//check xem user đã login chưa, nếu rồi thì render '/'
app.get('/', checkAuthenticated, (req, res) => {
   res.render('index.ejs', { name: req.user.name })
})

//check xem user đã login rồi thì không cho đi ra các trang khác
//ngoài '/', còn chưa login thì render '/login'
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

//check nếu user đã login rồi thì không cho post, lưu passport.user vào sessionStore
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}),
//console.log(users)
)

//check nếu user đã login thì không cho đi ra trang '/register'
app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

//check nếu user đã login rồi thì không cho post
app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

//nếu user đi tới '/logout' thì logout và redirect về '/login'
app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

//hàm check nếu user đã login thì chạy lệnh kế tiếp, nếu chưa thì
//redirect về '/login'
function checkAuthenticated(req, res, next) {
  // if (!req.session.passport === null) {
  //   return next()
  // }
  
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

//hàm check nếu user đã login thì redirect '/', nếu chưa thì 
//thực hiện lệnh kế tiếp
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  else{
    console.log(req.session.passport)
    next()
  }
  
}


app.listen(3000)