const express = require("express");
const { v4: uuidv4 } = require("uuid")
const app = express();

app.use(express.json());

const customers = [];

app.post("/account", (request, response) => {
    const {cpf, name} = request.body;

    const cpfAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
    )  

    if (cpfAlreadyExists) {
        return response.status(400).json({error: true, message: "Cpf is already in use!"});
    }

    customers.push({
        name,
        cpf,
        id: uuidv4(),
        statement: []
    })

    return response.status(201).send();
});

app.listen(3333);