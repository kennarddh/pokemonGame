import requests
import json
import mysql
import mysql.connector
import random

mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    passwd="",
    database="pokemon"
)

cursor = mydb.cursor()

url = "https://pokeapi.co/api/v2/pokemon?&limit=1118"

response = requests.request("GET", url)

res = json.loads(response.text)

result = res["results"]

cursor.execute("SELECT id FROM ability")

ability = cursor.fetchall()

ablityInserted = [int(i[0]) for i in ability]

for poke in result:
    url = poke["url"]

    response = requests.request("GET", url)

    res = json.loads(response.text)
    
    base_experience = res["base_experience"]
    height = res["height"]
    weight = res["weight"]
    sprites = json.dumps(res["sprites"])
    name = res["name"]
    damage = random.randint(10, 100)
    defense = random.randint(10, 100)
    health = (base_experience * 5) + 150
    baseid = res["id"]

    cursor.execute("INSERT INTO `base`(`id`, `name`, `base_experience`, `height`, `weight`, `sprites`, `damage`, `defense`, `health`) VALUES ({}, '{}', {}, {}, {}, '{}', {}, {}, {})".format(baseid, name, base_experience, height, weight, sprites, damage, defense, health))
    mydb.commit()

    # abilities
    abilities = res["abilities"]
    for abilities_loop in abilities:
        url = abilities_loop["ability"]["url"]

        response = requests.request("GET", url)

        res = json.loads(response.text)

        name = res["name"]
        id = res["id"]
        bonus_damage = random.randint(10, 100)

        if id not in ablityInserted:
            cursor.execute("INSERT INTO `ability`(`id`, `name`, `bonus_damage`) VALUES ({}, '{}', {})".format(id, name, bonus_damage))
            mydb.commit()

        cursor.execute("INSERT INTO `base_ability`(`base_id`, `ability_id`) VALUES ({}, {})".format(baseid, id))
        mydb.commit()

        ablityInserted.append(id)