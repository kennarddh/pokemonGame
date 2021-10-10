const socket = io();

// login page
const loginPage = document.querySelector("#loginPage")

const loginForm = loginPage.querySelector("#loginForm")
const loginFormUsername = loginPage.querySelector("#username")

// join page
const joinPage = document.querySelector("#joinPage")

const joinForm = document.querySelector("#joinForm")
const joinFormRoomName = joinForm.querySelector("#roomName")

// room page
const roomPage = document.querySelector("#roomPage")

const roomPageTbody = roomPage.querySelector("#tbody")

// choose pokemon page
const choosePokemonPage = document.querySelector("#choosePokemonPage")

const choosePokemonPageCardSource = choosePokemonPage.querySelector("#cardSource")

// battle page

const battlePage = document.querySelector("#battlePage")

const battleDataMyImage = battlePage.querySelector("#myImage")
const battleDataOpponentImage = battlePage.querySelector("#opponentImage")
const battleDataMyPokemonName = battlePage.querySelector("#myPokemonName")
const battleDataOpponentPokemonName = battlePage.querySelector("#opponentPokemonName")
const battleDataMyHealth = battlePage.querySelector("#myHealth")
const battleDataOpponentHealth = battlePage.querySelector("#opponentHealth")
const battleDataMyNowHealth = battlePage.querySelector("#myNowHealth")
const battleDataMyMaxHealth = battlePage.querySelector("#myMaxHealth")
const battleDataOpponentNowHealth = battlePage.querySelector("#opponentNowHealth")
const battleDataOpponentMaxHealth = battlePage.querySelector("#opponentMaxHealth")

const battleDataPanelAbilities = battlePage.querySelector("#abilities")
const battleDataPanelActionText = battlePage.querySelector("#actionText")

// complete page

const completePage = document.querySelector("#completePage")

const completePageStatus = completePage.querySelector("#status")

loginForm.addEventListener("submit", (event) => {
    event.preventDefault()
    if (loginFormUsername.value) {
        loginPage.style.display = 'none'
        joinPage.style.display = 'block'

        socket.emit("login", loginFormUsername.value)
    }
})

joinForm.addEventListener("submit", (event) => {
    event.preventDefault()
    if (joinFormRoomName.value) {
        joinFormRoomName.value = ''
        
        socket.emit("joinRoom", joinFormRoomName.value)
    }
})

socket.on("newUserOnRoom", (socketsClient, roomStatus) => {
    joinPage.style.display = 'none'
    roomPage.style.display = 'block'

    roomPageTbody.innerHTML = ""
    
    ClientUsername = Object.values(socketsClient)

    ClientUsername.forEach((ClientUsername) => {
        let tr = document.createElement('tr')
        let td = document.createElement('td')
        
        td.innerHTML = ClientUsername
    
        tr.appendChild(td)
    
        roomPageTbody.appendChild(tr)
    });
})

socket.on("startGame", () => {
    roomPage.style.display = 'none'
    choosePokemonPage.style.display = 'block'

    socket.emit('getPokemonList')
})

socket.on('getPokemonList', (data) => {
    data = data["result"]

    data.forEach(row => {
        let clone = choosePokemonPageCardSource.cloneNode(true)

        clone.id = "card"
        clone.setAttribute("data-pokemon", row["id"])
        clone.querySelector("#pokemon_name").innerHTML = row["name"]
        image = JSON.parse(row["sprites"])["front_default"]

        clone.querySelector("#image").src = JSON.parse(row["sprites"])["front_default"] || JSON.parse(row["sprites"])["other"]["official-artwork"]["front_default"]

        clone.querySelector("#damage").innerHTML = row["damage"]
        clone.querySelector("#defense").innerHTML = row["defense"]
        clone.querySelector("#health").innerHTML = row["health"]

        cardWrap.appendChild(clone)
    });

    choosePokemonPageCardSource.remove()
    
    const choosePokemonPageCardWrap = choosePokemonPage.querySelectorAll("#cardWrap div")

    choosePokemonPageCardWrap.forEach((element) => {
        element.addEventListener('click', (event) => {
            socket.emit('choosePokemon', element.dataset.pokemon)
        })
    })
})

socket.on('startBattle', (battleData) => {
    choosePokemonPage.style.display = 'none'
    battlePage.style.display = 'block'

    socket.emit('getPokemonById', battleData)
})

const clone = (obj) => {
    if (null == obj || "object" != typeof obj) return obj;
    let copy = obj.constructor();
    for (let attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

socket.on('getPokemonById', (pokemonData, firstTurn) => {
    // me
    const myPokemonData = pokemonData[socket.id]['result']

    const myPokemonHealth = myPokemonData['health']
    const myPokemonName = myPokemonData['name']

    const myPokemonSprites = JSON.parse(myPokemonData["sprites"])["back_default"] || JSON.parse(myPokemonData["sprites"])["other"]["official-artwork"]["front_default"]

    battleDataMyNowHealth.innerHTML = myPokemonHealth
    battleDataMyMaxHealth.innerHTML = myPokemonHealth
    battleDataMyPokemonName.innerHTML = myPokemonName
    battleDataMyImage.src = myPokemonSprites

    const battleDataMyAbilities = myPokemonData['abilities']

    battleDataMyAbilities.forEach((ability) => {
        let div = document.createElement('div')

        div.classList.add('ability')
        div.setAttribute('data-ability', ability['id'])

        let h3 = document.createElement('h3')

        h3.innerHTML = ability['name']

        div.appendChild(h3)

        battleDataPanelAbilities.appendChild(div)
    })

    // opponent
    let opponentPokemonData = clone(pokemonData)

    delete opponentPokemonData[socket.id]

    opponentPokemonData = Object.values(opponentPokemonData)[0]['result']

    const opponentPokemonHealth = opponentPokemonData['health']
    const opponentPokemonName = opponentPokemonData['name']

    const opponentPokemonSprites = JSON.parse(opponentPokemonData["sprites"])["front_default"] || JSON.parse(opponentPokemonData["sprites"])["other"]["official-artwork"]["front_default"]

    battleDataOpponentNowHealth.innerHTML = opponentPokemonHealth
    battleDataOpponentMaxHealth.innerHTML = opponentPokemonHealth
    battleDataOpponentPokemonName.innerHTML = opponentPokemonName
    battleDataOpponentImage.src = opponentPokemonSprites

    const abilityEvent = battlePage.querySelectorAll('#abilities div')
    
    abilityEvent.forEach((element) => {
        element.addEventListener('click', (event) => {
            event.stopPropagation()

            let target = clone(pokemonData)

            delete target[socket.id]

            socket.emit('damagePokemon', {
                attack: socket.id,
                target: Object.keys(target)[0],
                ability: element.dataset.ability
            })

            battleDataPanelAbilities.style.visibility = 'hidden'
        })
    })

    if (socket.id == firstTurn) {
        battleDataPanelAbilities.style.visibility = 'visible'
    }
})

socket.on('updateStatus', (send) => {
    if (Object.keys(send)[0] == socket.id) {
        const data = Object.values(send)[0]

        battleDataMyNowHealth.innerHTML = data.health
        battleDataMyMaxHealth.innerHTML = data.maxHealth

        battleDataMyHealth.value = (data.health / data.maxHealth) * 100

        battleDataPanelActionText.innerHTML = data.msg
    } else {
        const data = Object.values(send)[0]

        battleDataOpponentNowHealth.innerHTML = data.health
        battleDataOpponentMaxHealth.innerHTML = data.maxHealth

        battleDataOpponentHealth.value = (data.health / data.maxHealth) * 100

        battleDataPanelActionText.innerHTML = data.msg
    }
})

socket.on('yourTurn', () => {
    battleDataPanelAbilities.style.visibility = 'visible'
})

socket.on('gameComplete', (data) => {

    battlePage.style.display = 'none'
    completePage.style.display = 'block'

    if (data.win == socket.id) {
        completePageStatus.innerHTML = 'Win'
    } else {
        completePageStatus.innerHTML = 'Lose'
    }
})