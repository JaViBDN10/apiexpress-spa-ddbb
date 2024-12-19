const routes = {
	'/': `<div style="padding-left:20%;">
		<h1>Portal Tecnológico</h1>
		
		<div id="login"><br>
			<label>User</label>
			<input id="user" value="javier"></input><br>
			<label>Pass</label>
			<input id="pass" value="1234"></input><br>
			<input  class="my-button" type="button" value="login" onclick="loginApi()"><br><br>
		</div>
		</div>`,
	'/user': `<div id="divMain">
				<div class="sideBar">
				<div id="buttons">
				</div>
			</div>
			<div id="table" class="table-wrapper">
			<h2>Tabla Usuarios</h2>
			<table class="fl-table">
				<thead>
					<tr class="table-header">
						<th scope="col">User ID</th>
						<th scope="col">Name</th>
						<th scope="col">Password</th>
					</tr>
				</thead>
				<tbody id="table_body" class="table-row">
				</tbody>
			</table>
			<div id="addButtons">	
				</div>
			</div>
			</div>`
};
function renderPage(path) {
	const content = routes[path] || '<h1>404 - Página no encontrada</h1>';
	document.getElementById('main').innerHTML = content;
	switch(path){
		case '/':
		break;
		case '/user':
			showTable();
		break;
		default:
	}
}
const dominio = "http://localhost:3000/";
function getUser(){
			var user = document.getElementById('user').value;
			return user;
}
function getPass(){
			var pass = document.getElementById('pass').value;
			return pass;
}
async function loginApi(){
	var user= getUser();
	var pass= getPass();
	await fetch(dominio+'login',{
		method:'POST',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			user:user,
			pass:pass
		})
	})
	.then(async response =>  { 
		var resp_token = await response.json();
		if (response.status === 200) {
			
			var data = resp_token.token;
			localStorage.setItem('token', data);
			goToRoute('/user')
		} else {
			alert('Usuario o contraseña incorrectos');
			document.getElementById('user').value = '';
			document.getElementById('pass').value = '';
		}
	})
	.catch(error => console.log(error))
}
function goToRoute (route){
	window.history.pushState({}, '', route); 
	renderPage(window.location.pathname);	
}
async function showTable(){
	await fetch(dominio+'users',{
		method:'GET',
		mode: 'cors',
		headers: {
			'Authorization': `Bearer ${localStorage.token}`, // Aquí se envía el token
			'Content-Type': 'application/json'
		}
	})
	.then(async resp => {
		if(resp.status==401){
			goToRoute('/');
		}else if(resp.status==200){
			var data= await resp.json();
			document.getElementById("buttons").innerHTML='';
		let tableData="";
		data.map((values)=>{
			tableData+=`<tr>
							<td>${values.personid}</td>
							<td>${values.name}</td>
							<td>${values.pass}</td>
						</tr>`;	
		});
		document.getElementById("table_body").innerHTML=tableData;
		document.getElementById("buttons").innerHTML+=`<div id="login"><br>
					<input class="my-button" type="button" value="Añadir Usuario" onclick="addUserMenu()"><br>
					<input class="my-button" type="button" value="Borrar Usuario" onclick="deleteUserMenu()"><br>
					<input class="my-button" type="button" value="Modificar Usuario" onclick="alterUserMenu()"></div>`;
		}		
	})
}
function addUserMenu(){
	document.getElementById("addButtons").innerHTML='';
	document.getElementById("addButtons").innerHTML+=`<div class="nuevo" id="add"><br>
	<label class="newLabel">Nuevo Usuario</label>
	<input id="newUser"></input><br>
	<label class="newLabel">Password</label>
	<input id="newPass"></input><br>
	<input class="my-button" type="button" value="Añadir" onclick="addUser()">
	</div>`;
}
function deleteUserMenu(){
	document.getElementById("addButtons").innerHTML='';
	document.getElementById("addButtons").innerHTML+=`<div class="nuevo" id="add"><br>
	<label class="newLabel">Nuevo Usuario</label>
	<input id="delUser"></input><br>
	<label class="newLabel">Password</label>
	<input id="delPass"></input><br>
	<input class="my-button" type="button" value="Borrar" onclick="delUser()">
	</div>`;
}
function alterUserMenu(){
	document.getElementById("addButtons").innerHTML='';
	document.getElementById("addButtons").innerHTML+=`<div class="nuevo" id="add"><br>
	<label class="newLabel">Modificar Usuario</label>
	<input id="delUser"></input><br>
	<label class="newLabel">Password</label>
	<input id="delPass"></input><br>
	<label class="newLabel">Nuevo nombre</label>
	<input id="alterUser"></input><br>
	<label class="newLabel">Nuevo password</label>
	<input id="alterPass"></input><br>
	<input class="my-button" type="button" value="Modificar" onclick="alterUser()">
	</div>`;
}
async function addUser() {
	
	var user = document.getElementById('newUser').value;
	var pass = document.getElementById('newPass').value;
	document.getElementById("addButtons").innerHTML='';
	await fetch(dominio + 'add', {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Authorization': `Bearer ${localStorage.token}`, // Aquí se envía el token
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ user: user, pass: pass })
	})
	.then(resp => {
		if(resp.status==200){
			alert('usuario añadido');
			showTable();
		}else if(resp.status==401){
			alert('Usuario no autorizado');
			goToRoute('/');
		}else{
			alert('Error al añadir usuario');
		}})
}
async function delUser() {
	var user = document.getElementById('delUser').value;
	var pass = document.getElementById('delPass').value;
	document.getElementById("addButtons").innerHTML='';
	await fetch(dominio + 'del', {
		method: 'DELETE',
		mode: 'cors',
		headers: {
			'Authorization': `Bearer ${localStorage.token}`, // Aquí se envía el token
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ user: user, pass: pass })
	})
	.then(resp => {
		if(resp.status==200){
			alert('usuario eliminado');
			showTable();
		}else if(resp.status==401){
			alert('Usuario no autorizado');
			goToRoute('/');
		}else{
			alert('Error al borrar usuario');
		}})
}
async function alterUser() {
	var user = document.getElementById('delUser').value;
	var pass = document.getElementById('delPass').value;
	var newUser = document.getElementById('alterUser').value;
	var newPass = document.getElementById('alterPass').value;
	document.getElementById("addButtons").innerHTML='';
	await fetch(dominio + 'alter', {
		method: 'PUT',
		mode: 'cors',
		headers: {
			'Authorization': `Bearer ${localStorage.token}`, // Aquí se envía el token
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ user: user, pass: pass,newPass: newPass,newUser: newUser })
	})
	.then(resp => {
		if(resp.status==200){
			alert('usuario modificado');
			showTable();
		}else if(resp.status==401){
			alert('Usuario no autorizado');
			goToRoute('/');
		}else{
			alert('Error al modificar usuario');
		}})
}
renderPage(window.location.pathname);