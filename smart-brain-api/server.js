const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'malik786',
        database: 'smart-brain'
    }
});
 
db.select('*').from('users').then(data => {
    console.log(data);
})

const app = express()

app.use(bodyParser.json())
app.use(cors())

const database = {
    users: [
        {
            id: '123',
            name: 'john',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'sally',
            email: 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date()
        }
            ]   
}

app.get('/', (req, res) => {
    res.send(database.users)
})


app.post('/signin', (req, res) => {
    if (req.body.email === database.users[0].email &&
        req.body.password === database.users[0].password) {
        res.json('success')
    } else {
        res.status(404).json('failed')
    }
})

app.post('/register', (req, res) => {
    const {email,name,password} = req.body 
    console.log(email,name,password)
    db('users')
    .insert({ 
        email: email,
        name: name,
        joined: new Date()
    }) 
    .then(user => { 
        res.json(user[0])
    })
    // .catch(res.status(400).json('unable to register'))
})

app.get('/profile/:id', (req, res) => {
    const {id} = req.params;
    let found = false;
    database.users.forEach(user => {
        if (user.id === id) {
            found = true;
            return res.json(user)
        }
    })
    if (!found) {
        res.status(400).json('not found')
    }
})

app.put('/image', (req, res) => {
    const {id} = req.body;
    let found = false;
    database.users.forEach(user => {
        if (user.id === id) {
            found = true;
            user.entries++
            return res.json(user.entries)
        }
    })
})

app.listen(3001, () => {
    console.log('Server is running on port 3000')
})

