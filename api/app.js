var express = require('express');
var mysql = require('mysql');
var connection  = require('express-myconnection');
var bodyParser = require('body-parser');

var app = express();
app.use(
	connection(mysql,{
		host: 'localhost',
		user: 'root',
		password : '123.123',
		port : 3306, //port mysql
		database:'dbnote'
	},'request')
);

//Permitir acesso externo
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

function DBAccess(req, res, query, params) {
	req.getConnection(function(err, connection) {
		if (err) return res.status(400).json(err);
		f = connection.query(query, params, function(qErr, result) {
			if(qErr) return res.status(400).json(qErr);
			return res.status(200).json(result);
		});
		console.log(f.sql);
	});
}

var routes = express.Router();
routes.get('/test', function(req, res) {
	console.log("Um teste");
	res.status(200).json('result');
});

routes.get('/user=*', function(req, res) {
	DBAccess(req, res, 'SELECT * FROM note where user = ?', [req.params[0]]);
});

routes.get('/remove=*', function(req, res) {
	DBAccess(req, res, 'delete from note where idnote = ?', [req.params[0]]);
});

routes.post('/search', function(req, res) {
	DBAccess(req, res, 'SELECT * FROM note where user = ? and (body like ? or title like ?);', [req.body.user, '%'+req.body.text+'%', '%'+req.body.text+'%']);
});

routes.post('/add', function(req, res) {
	DBAccess(req, res, 'INSERT INTO note SET ?', req.body);
});

routes.post('/changetitle', function(req, res) {
	DBAccess(req, res, 'update note set title = ? where idnote = ?', [req.body.title, req.body.idnote]);
});

routes.post('/changebody', function(req, res) {
	DBAccess(req, res, 'update note set body = ? where idnote = ?', [req.body.body, req.body.idnote]);
});

//Para usar o metodo POST
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: false }));

app.use('/', routes);

app.set('port', process.env.PORT || 3001);

var server = app.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + server.address().port);
});
