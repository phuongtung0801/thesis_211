# Tổng kết về quy trình thực hiện xác thực bằng passport-local và express-session

Mình sẽ viết lại quy trình flow thực hiện xác thực người dùng bằng `passport-local` và `express-session`
như sau:

1. Khi client gửi HTTP request đến webserver, `express-session` sẽ check request đó có cookie hay chưa,
   nếu chưa có thì nó sẽ tạo một session trong bộ nhớ (có thể là database hoặc RAM, tùy thuộc mình config) và gửi
   HTTP response cho client có chứa set-cookie: ssid, cùng với đó `express-session` tạo trường req.session gắn vào
   req object để chuyển tới middleware tiếp theo. Lúc này client đã có cookie chứa ssid trùng với ssid được `express-session` tạo trong session lưu trong bộ nhớ.
2. `passport.initialize()` và `passport.session()` cũng là global middleware như `express-session`, tụi nó sẽ check
   ở mỗi route client gửi HTTP request, xem có trường `req.session.passport.user` (lưu id của user object thông qua
   hàm `passport.serializeUser`) hay không. Do `passport.authenticate()` chưa chạy nên user chưa xác thực, chưa gọi hàm callback
   local strategy để verify user nên trường `req.session.passport.user` chưa tồn tại. Sau khi client gửi POST request ở route '/login', `passport.authenticate()` chạy, gọi callback local strategy verify user, nếu ok thì nó trả về object user, chạy hàm `passport.serializeUser` để lấy user id lưu vào trong session lưu trong bộ nhớ và gắn trường `req.session.passport.user`vào trong `req.session`.
3. Từ đoạn này về sau thì session nó đã có thêm trường passport.user trong đó lưu id của user. Nên khi client gửi HTTP request đến, express-session sẽ compare cookie đó với cookie trong session, nếu trùng nhau thì nó sẽ dựa vào thông tin lưu trong session để tạo trường `req.session.passport.user` pass tới các middleware tiếp theo. Ở những chỗ nào cần verify client thì chỗ đó chỉ cần check request có trường `req.session.passport.user` hay không, nếu có thì nó sẽ verify.
4. Lúc này khi `passport.session()` chạy thì nó đã tìm thấy trường `req.session.passport.user`, nó lấy id user trong đây và thay thế giá trị `user`\_lúc này đang chứa id của object user thành toàn bộ object user, thông qua hàm `passport.deserializeUser()` và pass tới middleware tiếp theo.
