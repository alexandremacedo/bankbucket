const { request } = require("express");
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



app.listen(3333);