// lifesync.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

// Base de données SQLite
const db = new sqlite3.Database(':memory:', (err)=>{
    if(err) console.error(err.message);
    else console.log('Base de données en mémoire OK');
});

// Création des tables
db.serialize(()=>{
    db.run(`CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)`);
    db.run(`CREATE TABLE tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT, duration INTEGER, priority INTEGER, completed INTEGER DEFAULT 0)`);
    db.run(`CREATE TABLE energy_log (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, energy_level INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`);
});

// Routes API

// Ajouter tâche
app.post('/task', (req,res)=>{
    const {user_id,title,duration,priority} = req.body;
    db.run(`INSERT INTO tasks(user_id,title,duration,priority) VALUES(?,?,?,?)`, [user_id,title,duration,priority], function(err){
        if(err) res.status(400).json({error:err.message});
        else res.json({id:this.lastID});
    });
});

// Lister tâches
app.get('/tasks/:user_id', (req,res)=>{
    db.all(`SELECT * FROM tasks WHERE user_id=?`, [req.params.user_id], (err,rows)=>{
        if(err) res.status(400).json({error:err.message});
        else res.json(rows);
    });
});

// Ajouter niveau énergie
app.post('/energy', (req,res)=>{
    const {user_id,energy_level} = req.body;
    db.run(`INSERT INTO energy_log(user_id,energy_level) VALUES(?,?)`, [user_id,energy_level], function(err){
        if(err) res.status(400).json({error:err.message});
        else res.json({id:this.lastID});
    });
});

// Dernier niveau énergie
app.get('/energy/:user_id',(req,res)=>{
    db.get(`SELECT * FROM energy_log WHERE user_id=? ORDER BY timestamp DESC LIMIT 1`, [req.params.user_id], (err,row)=>{
        if(err) res.status(400).json({error:err.message});
        else res.json(row);
    });
});

// Serve frontend HTML
app.get('/', (req,res)=>{
    res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>LifeSync</title>
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-8">
<h1 class="text-3xl font-bold mb-6">LifeSync – Dashboard</h1>

<div class="mb-6 p-4 bg-white rounded shadow">
<h2 class="text-xl font-semibold mb-2">Ajouter une tâche</h2>
<input id="title" placeholder="Titre" class="border p-2 mr-2 rounded"/>
<input id="duration" type="number" placeholder="Durée" class="border p-2 mr-2 rounded w-24"/>
<input id="priority" type="number" placeholder="Priorité" class="border p-2 mr-2 rounded w-24"/>
<button onclick="addTask()" class="bg-blue-500 text-white p-2 rounded">Ajouter</button>
</div>

<div class="mb-6 p-4 bg-white rounded shadow">
<h2 class="text-xl font-semibold mb-2">Tâches</h2>
<ul id="taskList"></ul>
</div>

<div class="mb-6 p-4 bg-white rounded shadow">
<h2 class="text-xl font-semibold mb-2">Niveau énergie</h2>
<input id="energy" type="range" min="0" max="100" value="80" class="w-full mb-2"/>
<button onclick="logEnergy()" class="bg-yellow-500 p-2 rounded text-white">Enregistrer énergie</button>
<p id="lastEnergy">Dernière énergie : 80</p>
</div>

<div class="p-4 bg-white rounded shadow">
<h2 class="text-xl font-semibold mb-2">Graphique énergie</h2>
<canvas id="energyChart"></canvas>
</div>

<script>
const userId=1;

async function fetchTasks(){
    const res = await axios.get('/tasks/'+userId);
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    res.data.forEach(t=>{
        const li=document.createElement('li');
        li.textContent = t.title+' - '+t.duration+'min - priorité '+t.priority;
        list.appendChild(li);
    });
}

async function addTask(){
    const title=document.getElementById('title').value;
    const duration=parseInt(document.getElementById('duration').value);
    const priority=parseInt(document.getElementById('priority').value);
    if(title==='') return;
    await axios.post('/task',{user_id:userId,title,duration,priority});
    document.getElementById('title').value='';
    fetchTasks();
}

async function logEnergy(){
    const val=parseInt(document.getElementById('energy').value);
    await axios.post('/energy',{user_id:userId,energy_level:val});
    fetchEnergy();
}

async function fetchEnergy(){
    const res = await axios.get('/energy/'+userId);
    const last = res.data?.energy_level||80;
    document.getElementById('lastEnergy').textContent='Dernière énergie : '+last;
    drawChart(last);
}

function drawChart(latest){
    const ctx=document.getElementById('energyChart').getContext('2d');
    if(window.chart) window.chart.destroy();
    window.chart=new Chart(ctx,{
        type:'line',
        data:{
            labels:['-4h','-3h','-2h','-1h','Maintenant'],
            datasets:[{label:'Énergie', data:[60,70,65,75,latest], borderColor:'blue', tension:0.3}]
        }
    });
}

fetchTasks();
fetchEnergy();
</script>

</body>
</html>
    `);
});

app.listen(PORT,()=>console.log(`LifeSync running http://localhost:${PORT}`));
