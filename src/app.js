const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];
const likes = [];


function validateId(request, response, next) {
  const {id} = request.params

  if (!isUuid(id)) return response.status(400).json({"message": "Id is not valid!"})
  return next();
}

function existsId(request, response, next) {
  const {id} = request.params
  console.log(repositories.find(repository => {return repository.id === id}))
  if (repositories.find(repository => {return repository.id === id}) === "") {
    return response.status(400).json({"message": "Id not found!"})
  }

  return next();
}

app.get("/repositories", (request, response) => {
  const repo = []
  repositories.map(repository => {
    repo.push({
      repository,
      like: likes.filter(lk => { return lk.id === repository.id }).length || 0
    })
  })
  return response.json(repo)
});

app.post("/repositories", (request, response) => {
  const {title, url, techs} = request.body

  const id = uuid()
  repositories.push({id, title, url, techs})
  return response.status(202).json(repositories.find(repository => repository.id === id))
});

app.put("/repositories/:id", validateId, existsId, (request, response) => {
  const { id }  = request.params
  const {title, url, techs} = request.body

  repositories.filter(repository => {
    if (repository.id === id) {
      repository.title = title ? title : repository.title;
      repository.url = url ? url : repository.url; 
      repository.techs = techs && techs.length > 0 ? techs : repository.techs
    }
    return repository
  })

  return response.status(202).json(repositories.find(repository => repository.id === id))
});

app.delete("/repositories/:id", validateId, existsId, (request, response) => {
  const { id }  = request.params

  const index = repositories.findIndex(repository => {return repository.id === id})
  repositories.splice(index, 1)
  console.log(repositories)
  return response.status(204).json({})

});

app.post("/repositories/:id/like", validateId, existsId, (request, response) => {
  const { id }  = request.params

  likes.push({ id })
  return response.status(200).json({"likes" : likes.filter(lk => { return lk.id === id }).length})
});

module.exports = app;
