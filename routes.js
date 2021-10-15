const passport = require('passport')
const route = require('express').Router()

//check xem user đã login chưa, nếu rồi thì render '/'
route.get('/', checkAuthenticated, (req, res) => {
   res.render('index.ejs', { name: req.user.name })
})

//check xem user đã login rồi thì không cho đi ra các trang khác
//ngoài '/', còn chưa login thì render '/login'
route.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

//check nếu user đã login rồi thì không cho post
route.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}),
//console.log(users)
)

//check nếu user đã login thì không cho đi ra trang '/register'
route.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

//check nếu user đã login rồi thì không cho post
route.post('/register', checkNotAuthenticated, async (req, res) => {
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
route.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

//hàm check nếu user đã login thì chạy lệnh kế tiếp, nếu chưa thì
//redirect về '/login'
function checkAuthenticated(req, res, next) {
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
  next()
}

module.exports = route