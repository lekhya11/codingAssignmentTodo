import { addDays, format } from 'date-fns/fp'

const express = require("express");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");


const dbPath = path.join(__dirname,todoApplication.db);

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async ()=>{
    try {
     
      database = await open({
           filename: dbPath,
           driver: sqlite3.Database
      });

      app.listen(3000, () =>
            console.log("Running Server at LocalHost 3000 "));

    } catch(error) {
       console.log(`DB Error :${error.message}`);
       process.exit(1);
       });
    }
};

initializeDbAndServer()

const hasStatusProperties = (requestQuery) => {
    return (
        requestQuery.status !== undefined
    );
};

const hasPriorityProperties = (requestQuery) => {
    return (
        requestQuery.priority !== undefined
    );
};

const hasCategoryProperties = (requestQuery) => {
    return (
        requestQuery.category !== undefined
    );
};

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriorityProperties = (requestQuery) => {
    return (
        requestQuery.priority !== undefined && requestQuery.category !== undefined
    );
};

const hasCategoryAndStatusProperties = (requestQuery) => {
    return (
        requestQuery.category !== undefined && requestQuery.status !== undefined
    );
};

//API - 1


app.get("/todos/" , async (request, response) => {
    let getTodoQuery = "";
    const {search_q = " ", priority,status,category} = request.query;

    switch (true) {
        case hasPriorityAndStatusProperties(request.query):
            getTodoQuery = `
            SELECT
              * 
            FROM
              todo
            WHERE
              todo LIKE '%${search_q}%'
              AND status = '${status}'
              AND priority = '${priority}';`;
              
            break;
        case  hasCategoryAndPriorityProperties(request.query):
            getTodoQuery =`
            SELECT
              *
            FROM
              todo
            WHERE
              todo LIKE '%${search_q}%'
              AND category = '${category}'
              AND priority = '${priority}';`;

            break;
        case hasCategoryAndStatusProperties(request.query):
            getTodoQuery =`
            SELECT
              *
            FROM
              todo
            WHERE
              todo LIKE '%${search_q}%'
              AND category = '${category}'
              AND status = '${status}';`;
            
            break;

        case hasStatusProperties(request.query):
            getTodoQuery =`
            SELECT
              *
            FROM
              todo
            WHERE
              todo LIKE '%${search_q}%'
              AND status = '${status}';`;
            
            break;
        case hasPriorityProperties(request.query):
            getTodoQuery =`
            SELECT
              *
            FROM
              todo
            WHERE
              todo LIKE '%${search_q}%'
              AND priority = '${priority}';`;
            
            break;
        case hasCategoryProperties(request.query):
            getTodoQuery =`
            SELECT
              *
            FROM
              todo
            WHERE
              todo LIKE '%${search_q}%'
              AND category = '${category}';`;
            
            break;
        default:
            getTodoQuery = `
            SELECT
             *
            FROM
              todo 
            WHERE
              todo LIKE '%${search_q}%';`;
    }
    
    const date = await database.all(getTodoQuery);
    response.send(date);
});

// API - 2

app.get("/todos/:todoId" , async (request,response) => {
    const todoId = request.params;
    getTodoQuery = `
    SELECT 
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
    const date = await database.get(getTodoQuery);
    response.send(date);
});

//API - 3

app.get("/agenda/", async(request,response) => {
    const {date} = request.query;
    const formatDate = format(date ,'yyyy-MM-dd');
    getTodoQuery =`
    SELECT 
       * 
    FROM
      todo
    WHERE
     dueDate = ${formatDate};`;

    const data = await database(getTodoQuery);
    response.send(date);
});


// API - 4

app.post("/todos/" , async (request,response) => {
    const {id , todo, priority, status, category, dueDate} = request.body;
    postTodoQuery = `
    INSERT INTO 
        todo (id , todo, priority, status, category, dueDate )
    VALUES
       (${id} ,'${todo}', '${priority}', '${status}', '${category}' , '${dueDate}');
    `;

    await database(postTodoQuery);
    response.send("Todo Successfully Added");
});

//API - 5

app.put("/todos/:todoId", async (request,response) => {
   const {todoId} = request.params;
   let updateColumn = " ";
   const requestBody = request.body;
   switch (true) {
       case requestBody.status !== undefined:
           updateColumn = "Status";
           break;
       case requestBody.priority !== undefined:
           updateColumn = "Priority";
           break;
       case requestBody.todo !== undefined:
           updateColumn = "Todo";
           break;
   }
   
   const previousTodoQuery = `
     SELECT 
      *
     FROM
      todo
     WHERE 
      id = ${todoId}; `;
  const previousTodo = await database.get(previousTodoQuery);

  const {
      todo = previousTodo.todo,
      priority = previousTodo.priority,
      status = previousTodo.status,
  } = request.body;

  const updateTodoQuery = `
  UPDATE 
     todo
  SET 
     todo = '${todo}',
     priority = '${priority}'
     status = '${status}'
  WHERE
     id = ${todoId};`;

  await database.run(updateTodoQuery);
  response.send(`${updateColumn} Update`);
});

//API- 6

app.delete("/todo/:todoId/" , async (request,response) => {
    const {todoId} = request.params;
    todoDeleteQuery = `
    DELETE FROM
        todo
    WHERE 
      id = ${todoId};`;
    
    await database(todoDeleteQuery);
    response.send("Todo Deleted");
});

module.exports = app;
