const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg'); 

const app = express();
const PORT = 3000;

// Configuraciones de seguridad y base de datos
const SECRET_KEY = 'supersecreto1234'; 
const TOKEN_EXPIRATION = '1h';

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'test', 
	password: '1234',
	port: 5432,
});

// Middlewares
app.use(express.json()); // Para parsear el body de la request como JSON
app.use((req, res, next) => { // Para configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
	res.setHeader('Access-Control-Request-Method', '*');
    next();
});

// Middleware para verificar el token
 function verifyToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	if (!authHeader) return res.status(401).json({ error: 'Token no proporcionado' });
	const token = authHeader.split(' ')[1]; // Separa el Bearer del token
	try {
		const decoded = jwt.verify(token, SECRET_KEY);
		req.user = decoded; // Información decodificada del token
		next(); // Continuar con la solicitud
	} catch (err) {
		return res.status(401).json({ error: 'Token no válido' });
	}

}

// Rutas
app.post('/login', async (req, res) => {
	const { user, pass } = req.body;
	const isValidLogin = await consultaLogin(user, pass);
	if (isValidLogin) {
		const token = jwt.sign({ user }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
		res.status(200).json({ token });
	} else {
		res.status(401).json({ error: 'Credenciales incorrectas' });
	}
});

app.get('/users', verifyToken, async (req, res) => {
	try {
		const users = await consultaTabla();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

app.post('/add', verifyToken, async (req, res) => {
    const { user, pass } = req.body;
    try {
        await updateTable(user, pass, 0);
        const users = await consultaTabla();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al añadir usuario' });
    }
});

app.delete('/del', verifyToken, async (req, res) => {
    const { user, pass } = req.body;
    try {
        await updateTable(user, pass, 1);
        const users = await consultaTabla();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al borrar usuario' });
    }
});

app.put('/alter', verifyToken, async (req, res) => {
    const { user, pass, newUser, newPass } = req.body;
    try {
        await alterTable(user, pass, newUser, newPass);
        const users = await consultaTabla();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al modificar usuario' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
async function consultaLogin(user,pass) {
	try {
	const query = 'select name,pass from persons where name=\''+user+'\' and pass=\''+pass+'\'';
	var cons = await pool.query(query);
	if (cons.rowCount==1){
		return true;
	}else{
		return false;
	}
	} catch (err) {
	console.error(err);
	console.error('Query failed');
	return false;
	}
}
async function consultaTabla() {
	const query = 'select * from persons;';
	var cons = await pool.query(query);
	return cons.rows;
}
function updateTable(user,pass,action) {
	switch(action){
		case 0:
			var query = 'insert into persons(personid,name,pass) values(5,\''+user+'\',\''+pass+'\')';
		break;
		case 1:
			var query = 'delete from persons where name=\''+user+'\' and pass=\''+pass+'\'';
		break;
			default:
	}
	pool.query(query);
	let newQuery = consultaTabla();
	return newQuery;
}
function alterTable(user,pass,newUser,newPass) {
	const query = ' update persons set name=\''+newUser+'\',pass=\''+newPass+'\' where name=\''+user+'\' and pass=\''+pass+'\'';
	pool.query(query);
	let newQuery = consultaTabla();
	return newQuery;
}
