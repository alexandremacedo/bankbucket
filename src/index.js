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

    const customer = {
        name,
        document,
        id: uuidv4(),
        statements: []
    }

    customers.push(customer)

    return response.status(201).json(customer);
});

app.use(isAccountValid)

app.get("/statements", (request, response) => {
    const { customer } = request;

    return response.status(200).json({
        statements: customer.statements
    });
});



app.listen(3333);