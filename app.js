const express = require("express")
const path = require("path")
const cors = require("cors")

const jwt = require("jsonwebtoken")

const { open } = require("sqlite")
const sqlite3 = require("sqlite3")


const app = express()
app.use(cors())
app.use(express.json())


const dbPath = path.join(__dirname, "database.db")
let db = null 

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })
    app.listen(3008, ()=>console.log("Server Running"))
  } catch (err) {
    console.log(`Db Error ${err}`)
   }
}

initializeDBAndServer()

app.post("/register", async (req,res) => {
  const { username, password, email } = req.body
  
  const isUserExist = `SELECT * FROM user WHERE username = "${username}"`
  const dbResponse = await db.get(isUserExist)
  
  if (dbResponse === undefined) {
    const createUser = `INSERT INTO user (username,password,email) VALUES("${username}","${password}","${email}");`;
    const dbResponse = await db.run(createUser)
    const lastId = dbResponse.lastID
    res.status(200)
    res.send(`User Created`)
  } else {
    res.status(401)
    res.send("User already exists")
  }
})


app.post("/login", async (req, res) => {
  const { username, password } = req.body
  const isUserExist =  `SELECT * FROM user WHERE username = "${username}"`
  const dbResponse = await db.get(isUserExist)
  console.log(dbResponse)

  if (dbResponse === undefined) {
    res.status(404)
    res.send({ message: "User not exist" })
  } else {
    const payload = {username: username}
    const jwtToken = jwt.sign(payload, "ganesh")
    res.status(200)
    res.send({jwt_token: jwtToken})
  }
})