const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const checkUsernameAlreadyExists = users.find(
    (user) => user.username == username
  );

  if (!checkUsernameAlreadyExists) {
    return response.status(400).json({ error: "User not exists!" });
  }

  request.username = checkUsernameAlreadyExists;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  if (!name || !username) {
    return response.status(400).json("Name or username not found!");
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  return response.json(username.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;

  if (!title || !deadline) {
    return response.status(400).json({ error: "Fill all Fields" });
  }

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  username.todos.push(todo);

  return response.json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { username } = request;
  let todoIndex = 0;

  if (!title || !deadline) {
    return response.status(400).json({ error: "Fill All Fields!" });
  }

  const todo = username.todos.find((todo, index) => {
    if (todo.id == id) {
      todoIndex = index;
      return true;
    }
  });

  if (!todo) {
    return response.status(404).json({ error: "Todo not Found" });
  }

  username.todos[todoIndex].title = title;
  username.todos[todoIndex].deadline = new Date(deadline);

  return response.status(201).send();
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  let todoIndex = 0;

  const todo = username.todos.find((todo, index) => {
    if (todo.id == id) {
      todoIndex = index;
      return true;
    }
  });

  if (!todo) {
    return response.status(404).json({ error: "Todo not Found" });
  }

  username.todos[todoIndex].done = true;

  return response.status(204).send();
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const todo = username.todos.find((todo) => todo.id == id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not Found" });
  }

  username.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;
