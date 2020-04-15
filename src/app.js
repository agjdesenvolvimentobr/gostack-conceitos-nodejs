const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();
app.use(express.json());
app.use(cors());

const repositories = [];
// Middleware of log
function logRequest(request, response, next){
  const {method, url} = request;
  const log = `${Date()} [${method.toUpperCase()}] ${url}`;
  console.time(log);
  next()
  console.timeEnd(log);
}
// Middleware for validate Id
function validateRepostoryId(request, response, next){
  const {id} = request.params;
  if(!isUuid(id)){
    return response.status(400).json({error:"Not Repository id validate!"});
  }
  return next();
}

// Middleware for find Id
function findRepostoryId(request, response, next){
  const {id} = request.params;
  const repositoryIndex = repositories.findIndex(repositorie => repositorie.id === id);
  if(repositoryIndex < 0){
    return response.status(400).json({error:"Respository not found!"});
  }
  request.repositoryIndex = repositoryIndex;
  return next();
}
// call Middleware of log 
app.use(logRequest)
app.get("/repositories", (request, response) => {
  response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs} = request.body;
  const repositorie = {id:uuid(), title,url,techs,likes:0};
  repositories.push(repositorie);
  return response.status(201).json(repositorie);
});

app.put("/repositories/:id", validateRepostoryId,findRepostoryId,(request, response) => {
  const {id} = request.params;
  const { title, url, techs} = request.body;
  const {repositoryIndex} = request;
  const likes = repositories[repositoryIndex].likes;
  const repositorie = {id,title,url,techs, likes};
  repositories[repositoryIndex] = repositorie;
  return response.json(repositorie);
  
});

app.delete("/repositories/:id", validateRepostoryId,findRepostoryId, (request, response) => {
  const {repositoryIndex} = request;
  repositories.splice(repositoryIndex,1);
  return response.status(204).send();
});

app.post("/repositories/:id/like", validateRepostoryId,findRepostoryId, (request, response) => {
  const {repositoryIndex} = request;
  repositories[repositoryIndex].likes++; 
  return response.json(repositories[repositoryIndex]);
});

module.exports = app;
