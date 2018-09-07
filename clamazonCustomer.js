var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "clamazon_db",
    socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
})

connection.connect(function (err) {
    if (err) throw err;

    startTransaction();
})

function startTransaction() {
    inquirer.prompt([
        {
            type: "input",
            name: "id",
            message: "Please input the ID of the product you intend to purchase.",
            validate: numberValidator
        },
        {
            type: "input",
            name: "amount",
            message: "How many units would you like to purcahse?",
            validate: numberValidator
        }
    ]).then(function (response) {
        placeOrder(response.id, response.amount);
    });
}

function numberValidator(input) {
    if (+input) return true;
    else return false;
}

function placeOrder(id, amount) {
    connection.query("SELECT * FROM products WHERE item_id = " + id, function (err, results) {
        if (err) throw err;
        results = results[0];

        if (!results) {
            console.log(`Clamazon does not have a product with an ID of ${id}`)
            startTransaction();
        }
        else if (results.stock_quantity >= amount) {
            connection.query("UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: results.stock_quantity - amount
                    },
                    {
                        item_id: id
                    }
                ],
                function (err) {
                    if (err) throw err;
                    console.log("Order placed. Your total comes to $" + results.price * amount);
                    connection.end();
                }
            )
        }
        else {
            console.log(`There are not enought ${results.product_name}s to fulfill your order.`);
            connection.end();
        }
    })
}