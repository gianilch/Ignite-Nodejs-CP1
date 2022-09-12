const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  let user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).send({ message: "User not found" });
  }

  request.user = users.find((user) => user.username === username);

  return next();
}

function existsUserToDo(request, response, next) {
  const { username } = request.headers;
  const { id } = request.params;

  let user = users.find((user) => user.username === username);

  let todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).send({ error: "Todo dont exists" });
  }

  request.toDo = todo;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const checksExistsUserAccount = users.some(
    (user) => user.username === username
  );

  if (checksExistsUserAccount) {
    return response.status(400).send({ error: "User account already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { deadline, title } = request.body;

  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos = [...user.todos, newTodo];

  return response.status(201).send(newTodo);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  existsUserToDo,
  (request, response) => {
    const { toDo } = request;
    const { deadline, title } = request.body;

    toDo.title = title;
    toDo.deadline = deadline;

    return response.status(200).send(toDo);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  existsUserToDo,
  (request, response) => {
    const { toDo } = request;

    toDo.done = true;

    return response.status(200).send(toDo);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  existsUserToDo,
  (request, response) => {
    const { user } = request;
    const { id } = request.params;

    user.todos = user.todos.filter((todo) => todo.id != id);

    return response.status(204).json(user.todos);
  }
);

module.exports = app;
