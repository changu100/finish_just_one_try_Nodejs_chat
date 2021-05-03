var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var chatRouter = require('./routes/chat');
var usersRouter = require('./routes/users');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/chat', chatRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var count = 1;
io.on('connection',function(socket){
  console.log('user connected : ', socket.id);
  var name = "익명" + count++;
  socket.name = name;
  io.to(socket.id).emit('create name', name);
  io.emit('new_connect',name);

	socket.on('disconnect', function(){   // 채팅방 접속이 끊어졌을 때 - 2
	  console.log('user disconnected: '+ socket.id + ' ' + socket.name);
	  io.emit('new_disconnect', socket.name);
	});
  
  socket.on('send message', function(name, text){   // 메세지를 보냈을 때 - 3
		var msg = name + ' : ' + text;
		if(name != socket.name)   // 닉네임을 바꿨을 때 
			io.emit('change name', socket.name, name);
		socket.name = name;
    	console.log(msg);
    	io.emit('receive message', msg);
	});
})


http.listen(3000,function(){
  console.log('server on...');
});

module.exports = app;
