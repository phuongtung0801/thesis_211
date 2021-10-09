const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email)
    if (user == null) {
      return done(null, false, { message: 'No user with that email'})
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, authenticateUser))

  /* serializeUser dùng để lưu thông tin user đã đăng nhập vào cookie trên browser dưới dạng một thông số
  tùy chọn, ở đây là chọn Id. Thông tin user thì được lưu vào trong session. 
  deserializeUser thì dùng khi cần authenticate ở các phiên route khác (khi passport gọi hàm isAuthenticate)
  thì sẽ gọi hàm này để từ thông tin trên cookie nó sẽ tìm trong session và trả về toàn bộ thông tin của 
  object mà user đã login trước đó để phục vụ cho việc authenticate ở các route khác.
  */
  passport.serializeUser((user, done) => done(null, user.id))

  passport.deserializeUser((id, done) => {
    //dùng hàm getUserById mà server.js đã pass vào để find user dựa vào id lưu trong cookie, lấy
    //ra được cả object user để có thể dùng cho các bước xác thực khác
    return done(null, getUserById(id)),
    console.log(getUserById(id))
  })
}
//export function initialize để ở các file khác có thể call hàm này sau khi require file passport-config
module.exports = initialize
