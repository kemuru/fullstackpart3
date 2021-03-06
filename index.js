require("dotenv").config()
const express = require("express")
const app = express()
const morgan = require("morgan")
const cors = require("cors")
const Person = require("./models/person")
morgan.token("allContent", (req) => {
  return JSON.stringify(req.body)
})

app.use(cors())
app.use(express.static("build"))
app.use(express.json())
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :allContent"
  )
)

app.post("/api/persons", (request, response, next) => {
  const person = new Person({
    name: request.body.name,
    number: request.body.number,
  })

  if (!person.name || !person.number) {
    response.status(400).json({ error: "name or number missing" })
  }

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

app.get("/", (request, response) => {
  response.send("<h1>hello world!</h1>")
})

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.get("/info", (request, response) => {
  Person.find({}).then((persons) => {
    response.send(
      `Phonebook has info for ${persons.length} people <br><br> ${new Date()}`
    )
  })
})

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
  const person = {
    name: request.body.name,
    number: request.body.number,
  }
  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedNote) => response.json(updatedNote))
    .catch((error) => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => response.status(204).end())
    .catch((error) => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  }
  if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
