const express = require("express");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const isMatch = require("date-fns/isMatch");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Serve is running http://localhost:3000/");
    });
  } catch (err) {
    console.log(`DB Error is '${err.message}'`);
    process.exit(1);
  }
};
initializeDBAndServer();

const hasStatusProperty = (status, priority, search_q, category) => {
  return (
    status !== undefined &&
    priority === undefined &&
    category === undefined &&
    search_q === ""
  );
};

const hasPriorityProperty = (status, priority, search_q, category) => {
  return (
    status === undefined &&
    priority !== undefined &&
    category === undefined &&
    search_q === ""
  );
};

const hasSearchQProperty = (status, priority, search_q, category) => {
  return (
    status === undefined &&
    priority === undefined &&
    category === undefined &&
    search_q !== ""
  );
};
const hasCategoryAndPriorityProperties = (
  status,
  priority,
  search_q,
  category
) => {
  return (
    status === undefined &&
    priority !== undefined &&
    category !== undefined &&
    search_q === ""
  );
};

const hasCategoryAndStatusProperties = (
  status,
  priority,
  search_q,
  category
) => {
  return (
    status !== undefined &&
    priority === undefined &&
    category !== undefined &&
    search_q === ""
  );
};

const hasStatusAndPriorityProperties = (
  status,
  priority,
  search_q,
  category
) => {
  return (
    status !== undefined &&
    priority !== undefined &&
    category === undefined &&
    search_q === ""
  );
};
const hasCategoryProperty = (status, priority, search_q, category) => {
  return (
    status === undefined &&
    priority === undefined &&
    category !== undefined &&
    search_q === ""
  );
};

const convertNames = (each) => {
  return {
    id: each.id,
    todo: each.todo,
    priority: each.priority,
    status: each.status,
    category: each.category,
    dueDate: each.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "", category } = request.query;
  let getTodo = null;
  switch (true) {
    case hasStatusProperty(status, priority, search_q, category):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodo = `
            SELECT
              *
            FROM 
              todo
            WHERE
              status = '${status}';`;
        const dbResponse = await db.all(getTodo);
        response.send(dbResponse.map((each) => convertNames(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

      break;
    case hasPriorityProperty(status, priority, search_q, category):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodo = `
            SELECT
              *
            FROM 
              todo
            WHERE
              priority = '${priority}';`;
        const dbResponse = await db.all(getTodo);
        response.send(dbResponse.map((each) => convertNames(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;
    case hasSearchQProperty(status, priority, search_q, category):
      getTodo = `
        SELECT
            *
        FROM 
            todo
        WHERE
            todo LIKE '%${search_q}%';`;
      const dbResponse = await db.all(getTodo);
      response.send(dbResponse.map((each) => convertNames(each)));

      break;
    case hasCategoryProperty(status, priority, search_q, category):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodo = `
            SELECT
              *
            FROM 
              todo
            WHERE
              category = '${category}';`;
        const dbResponse = await db.all(getTodo);
        response.send(dbResponse.map((each) => convertNames(each)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;
    case hasCategoryAndStatusProperties(status, priority, search_q, category):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodo = `
            SELECT
              *
            FROM 
              todo
            WHERE
              status = '${status}' AND category = '${category}';`;
          const dbResponse = await db.all(getTodo);
          response.send(dbResponse.map((each) => convertNames(each)));
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasCategoryAndPriorityProperties(status, priority, search_q, category):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getTodo = `
            SELECT
              *
            FROM 
              todo
            WHERE
              priority = '${priority}' AND category = '${category}';`;
          const dbResponse = await db.all(getTodo);
          response.send(dbResponse.map((each) => convertNames(each)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasStatusAndPriorityProperties(status, priority, search_q, category):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          //   console.log(priority, status);
          getTodo = `
            SELECT
              *
            FROM 
              todo
            WHERE
              priority = '${priority}' AND status = '${status}';`;
          const dbResponse = await db.all(getTodo);
          response.send(dbResponse.map((each) => convertNames(each)));
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    default:
      getTodo = `
        SELECT
          *
        FROM 
          todo;`;
      const data = await db.all(getTodo);
      response.send(data.map((each) => convertNames(each)));
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const selectQueryDetails = `
  SELECT
    * 
  FROM
    todo
  WHERE
    id = '${todoId}';`;
  const dbUser = await db.get(selectQueryDetails);
  response.send({
    id: dbUser.id,
    todo: dbUser.todo,
    priority: dbUser.priority,
    status: dbUser.status,
    category: dbUser.category,
    dueDate: dbUser.due_date,
  });
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    // console.log(typeof newDate);
    const selectQueryDetails = `
    SELECT
        * 
    FROM
        todo
    WHERE
        due_date = '${newDate}';`;
    const dbResponse = await db.all(selectQueryDetails);
    response.send(dbResponse.map((each) => convertNames(each)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "HOME" ||
        category === "WORK" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const newDate = format(new Date(dueDate), "yyyy-MM-dd");

          const postTodo = `
          INSERT INTO
            todo(id, todo, priority, status, category, due_date)
          VALUES
            ('${id}',
            '${todo}',
            '${priority}',
            '${status}',
            '${category}',
            '${newDate}');`;
          await db.run(postTodo);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status, category, dueDate } = request.body;
  switch (true) {
    case todo !== undefined:
      const putTodo = `
        UPDATE todo
        SET
          todo = '${todo}'
        WHERE
          id = '${todoId}';`;
      await db.run(putTodo);
      response.send("Todo Updated");
      break;
    case status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        const putTodo = `
        UPDATE todo
        SET
          status = '${status}'
        WHERE
          id = '${todoId}';`;
        await db.run(putTodo);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        const putTodo = `
        UPDATE todo
        SET
          priority = '${priority}'
        WHERE
          id = '${todoId}';`;
        await db.run(putTodo);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case category !== undefined:
      if (
        category === "HOME" ||
        category === "WORK" ||
        category === "LEARNING"
      ) {
        const putTodo = `
        UPDATE todo
        SET
          category = '${category}'
        WHERE
          id = '${todoId}';`;
        await db.run(putTodo);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDate = format(new Date(dueDate), "yyyy-MM-dd");
        const putTodo = `
        UPDATE todo
        SET
          due_date = '${newDate}'
        WHERE
          id = '${todoId}';`;
        await db.run(putTodo);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
    DELETE FROM
      todo
    WHERE id = '${todoId}';`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
