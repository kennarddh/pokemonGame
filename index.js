// Setup basic express server
const e = require('cors')
const express = require('express')
const app = express()
const path = require('path')
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const port = process.env.PORT || 3000
const request = require('request')
const { Socket } = require('socket.io')

server.listen(port, () => {
    console.log('Server listening at port %d', port)
})

// Routing
app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', (socket) => {
    socket.on('login', (username) => {
        socket.username = username
    })

    socket.on('joinRoom', (roomName) => {
        let roomStatus = 'open'
        if (socket.lastRoom) {
            socket.leave(socket.lastRoom)
            socket.lastRoom = null
        }
        
        socket.join(roomName)
        socket.lastRoom = roomName
        
        if (!io.sockets.adapter.rooms.get(roomName).status)
        {
            io.sockets.adapter.rooms.get(roomName).status = 'open'
        }

        let socketsIdSet = io.sockets.adapter.rooms.get(roomName)
        
        let socketsId = Array.from(socketsIdSet)
        let socketsClient = {}
        let socketClient = null
        
        Array.from(socketsId).forEach((socketId) => {
            socketClient = io.sockets.sockets.get(socketId) 
            socketsClient[socketClient.id] = socketClient.username
        })

        if (Object.keys(socketsClient).length == 2) {
            io.sockets.adapter.rooms.get(roomName).status = 'close'
            roomStatus = 'close'
            
            io.sockets.in(roomName).emit('newUserOnRoom', socketsClient, roomStatus)
            io.sockets.in(roomName).emit('startGame')
        } else if (Object.keys(socketsClient).length > 2) {
            socket.leave(socket.lastRoom)
            socket.lastRoom = null
        } else {
            io.sockets.in(roomName).emit('newUserOnRoom', socketsClient, roomStatus)
        }
    })

    socket.on('getPokemonList', () => {
        const options = {
            method: 'GET',
            uri:'http://localhost/ziaul/apici3/api/pokemon/',
            auth: {
                user: 'admin',
                pass: '1234',
                sendImmediately: false
            }
        }
        
        request(options, function (error, response) {
            if (error) throw new Error(error)

            body = JSON.parse(response.body)

            socket.emit('getPokemonList', body)
        })
    })

    socket.on('choosePokemon', (pokemonId) => {
        socket.pokemonId = pokemonId

        let socketsIdSet = io.sockets.adapter.rooms.get(socket.lastRoom)
        
        let socketsId = Array.from(socketsIdSet)

        let choosePokemonCount = 0

        let battleData = {}

        socketsId.forEach((socketId) => {
            let socketClient = io.sockets.sockets.get(socketId)

            if (socketClient.pokemonId) {
                choosePokemonCount += 1
            }

            battleData[socketClient.id] = socketClient.pokemonId
        })
        
        if (choosePokemonCount == 2) {
            io.sockets.in(socket.lastRoom).emit('startBattle', battleData)
        }
    })

    socket.on('getPokemonById', (idArray) => {
        let result = {}

        var key = Object.keys(idArray)
        var value = Object.values(idArray)

        const clientId1 = key[0]
        const pokemonId1 = value[0]

        const clientId2 = key[1]
        const pokemonId2 = value[1]

        const options = {
            method: 'GET',
            qs:{id: pokemonId1},
            uri:'http://localhost/ziaul/apici3/api/pokemon/id',
            auth: {
                user: 'admin',
                pass: '1234',
                sendImmediately: false
            }
        }
        
        request(options, (error, response) => {
            if (error) throw new Error(error)

            const body = JSON.parse(response.body)
            
            result[clientId1] = body

            const options = {
                method: 'GET',
                qs:{id: pokemonId2},
                uri:'http://localhost/ziaul/apici3/api/pokemon/id',
                auth: {
                    user: 'admin',
                    pass: '1234',
                    sendImmediately: false
                }
            }
            
            request(options, (error, response2) => {
                if (error) throw new Error(error)
    
                const body2 = JSON.parse(response2.body)
                
                result[clientId2] = body2
                
                if (io.sockets.adapter.rooms.get(socket.lastRoom).status != 'started') {
                    io.sockets.adapter.rooms.get(socket.lastRoom).status = 'started'
                    
                    io.sockets.to(socket.lastRoom).emit('getPokemonById', result, Object.keys(result)[0])

                    Object.keys(result).forEach((key) => {
                        const data = result[key]['result']

                        io.sockets.sockets.get(key).pokemonMaxHealth = parseInt(data["health"])
                        io.sockets.sockets.get(key).pokemonHealth = parseInt(data["health"])

                        io.sockets.sockets.get(key).damage = parseInt(data["damage"])
                        io.sockets.sockets.get(key).defense = parseInt(data["defense"])
                    })
                }
            })
        })
    })

    socket.on('damagePokemon', (data) => {
        const attack = data.attack
        const target = data.target
        const ability = data.ability

        const options = {
            method: 'GET',
            qs:{id: ability},
            uri:'http://localhost/ziaul/apici3/api/ability/id',
            auth: {
                user: 'admin',
                pass: '1234',
                sendImmediately: false
            }
        }
        
        request(options, (error, response) => {
            let msg = ''
            const abilityBody = JSON.parse(response.body)['result']
            
            const bonusDamage = parseInt(abilityBody["bonus_damage"])
            
            const defense = io.sockets.sockets.get(target).defense
            const damage = io.sockets.sockets.get(attack).damage

            let totalDamage = (damage + bonusDamage) - defense

            const critChance = Math.random() * 100
            
            if (totalDamage <= 0) {
                msg = 'Miss'
            } else {
                msg = 'Success'
                
                if (critChance >= 65) {
                    totalDamage = totalDamage + (totalDamage * 0.3)

                    msg = 'Success Critical'
                }

                io.sockets.sockets.get(target).pokemonHealth = Math.round(io.sockets.sockets.get(target).pokemonHealth - totalDamage)

                if (io.sockets.sockets.get(target).pokemonHealth <= 0) {
                    io.sockets.sockets.get(target).pokemonHealth = 0

                    io.sockets.to(socket.lastRoom).emit('gameComplete', {win: attack})
                    
                    delete io.sockets.adapter.rooms.get(socket.lastRoom).status

                    socket.leave(socket.lastRoom)

                    delete socket.lastRoom

                    delete socket.pokemonHealth
                    delete socket.pokemonMaxHealth
                    delete socket.pokemonId
                    delete socket.damage
                    delete socket.defense

                } else {
                    let send = {}

                    send[target] = {}

                    send[target]['health'] = io.sockets.sockets.get(target).pokemonHealth
                    send[target]['maxHealth'] = io.sockets.sockets.get(target).pokemonMaxHealth
                    send[target]['msg'] = msg

                    io.sockets.to(socket.lastRoom).emit('updateStatus', send)
                    io.sockets.sockets.get(target).emit('yourTurn')
                }
            }

        })
    })
})