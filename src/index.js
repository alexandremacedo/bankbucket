const { request, response } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid")
const app = express();

app.use(express.json());

const customers = [];

function isAccountValid(request, response, next) {
    const { customerid } = request.headers;

    const customer = customers.find((customer) => customer.id === customerid);

    if (!customer) {
        return response.status(400).json({message: "Customer not found!"})
    }

    request.customer = customer;

    return next();
}

function getBalance(statements) {
    return statements.reduce((total, operation) => {
        if(operation.type === "creadit") {
            return total + operation.amount
        } else {
            return total - operation.amount
        }
    }, 0)
}

app.post("/account", (request, response) => {
    const {document, name} = request.body;

    const cpfAlreadyExists = customers.some(
        (customer) => customer.document === document
    )  

    // TODO -> Validate cpf with an external package
    if (cpfAlreadyExists) {
        return response.status(400).json({error: true, message: "Document is already in use!"});
    }

    customers.push({
        name,
        document,
        id: uuidv4(),
        statements: []
    })

    return response.status(201).send();
});

app.use(isAccountValid)

app.get("/statements", (request, response) => {
    const { customer } = request;

    return response.status(200).json({
        statements: customer.statements
    });
});

app.post("/deposit", (request, response) => {
    const { description, amount } = request.body;

    const { customer } = request;
    
    const statementOperation = {
      description,
      amount,
      created_at: new Date(),
      type: "credit"  
    }

    customer.statements.push(statementOperation)

    return response.status(201).send()
})

app.post("/withdraw", (request, response) => {
    const { amount } = request.body;
    const { customer } = request;

    const balance = getBalance(customer.statements);

    if (balance < amount) {
        return response.status(400).json({message: "Insufficient funds!"})
    }

    const statementsOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    }

    customer.statements.push(statementsOperation);

    return response.status(201).send()
});

app.get("/statements/date", (request, response) => {
    const { customer } = request;
    const {date} = request.query;

    const dateFormat = new Date(date + " 00:00");

    const filteredStatementsByDate = customer.statements.filter((statement) => {
        statement.created_at.toDateString() 
        === new Date(dateFormat).toDateString()
    })

    return response.status(200).json({
        statements: filteredStatementsByDate
    });
});

app.put("/account", (request, response) => {
    const {name} = request.body;
    const { customer }= request;
    
    customer.name = name;

    return response.status(200).send();
})

app.get("/account", (request, response) => {
    const { customer } = request;
    return response.status(200).json(customer);
})

app.delete("/account", (request, response) => {
    const { customer } = request;
    
    customer.splice(customer, 1);

    return response.status(200).json({customers})
})

app.get("/balance", (request, response) => {
    const { customer } = request;

    const balance = getBalance(customer.statements);

    return response.status(200).json({balance})
})

app.listen(3333);