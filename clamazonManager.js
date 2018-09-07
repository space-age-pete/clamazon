var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "clamazon_db",
    socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
});

connection.connect(function (err) {
    if (err) throw err;

    start();
})

function start() {
    inquirer.prompt([
        {
            type: "list",
            name: "selection",
            message: "What would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]

        }
    ]).then(function (response) {
        switch (response.selection) {
            case "View Products for Sale":
                viewProducts("");
                break;
            case "View Low Inventory":
                viewProducts(" WHERE stock_quantity <= 5");
                break;
            case "Add to Inventory":
                addToInventory();
                break;
            case "Add New Product":
                addProduct();
                break;

            default:
                console.log("Select Harder");
                start();
                break;
        }
    })
}

function viewProducts(where) {
    connection.query("SELECT * FROM products" + where, function (err, results) {
        if (err) throw err;
        console.log("\n----------\n");
        results.forEach(element => {
            for (product in element) {
                console.log(product + ": " + element[product]);
            }
            console.log("\n----------\n");
        })
        continueOrEnd();
    })
}

function addToInventory() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        inquirer.prompt([
            {
                type: "list",
                name: "product",
                message: "Select which product you'd like to stock",
                choices: function () {
                    var productArr = [];
                    results.forEach(element => {
                        productArr.push(element.product_name);
                    });
                    return productArr;
                }
            },
            {
                type: "input",
                name: "amount",
                message: "How many units of this item would you like to add?",
                validate: numberValidator
            }
        ]).then(function (responses) {
            var selectedProduct;
            results.forEach(element => {
                if (element.product_name === responses.product) {
                    selectedProduct = element;
                }
            });
            connection.query("UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: selectedProduct.stock_quantity + +responses.amount
                    },
                    {
                        product_name: responses.product
                    }
                ],
                function (err) {
                    if (err) throw err;
                    console.log(`\nYou have successfully stocked ${responses.amount} ${responses.product}s!\n`);
                    continueOrEnd();
                }
            )
        })
    })

}

function addProduct() {
    inquirer.prompt([
        {
            name: "product_name",
            type: "input",
            message: "Enter the name of the new product:"
        },
        {
            name: "department_name",
            type: "input",
            message: "Which department does this product belong in?"
        },
        {
            name: "price",
            type: "input",
            message: "At what price will you sell this item?",
            validate: numberValidator
        },
        {
            name: "stock_quantity",
            type: "input",
            message: "How many units would you like to initially stock?",
            validate: numberValidator
        }
    ]).then(function (responses) {
        connection.query("INSERT INTO products SET ?",
            {
                product_name: responses.product_name,
                department_name: responses.department_name,
                price: responses.price,
                stock_quantity: responses.stock_quantity
            }, function (err) {
                if (err) throw err;
                console.log(`\nCongratualations, your store now sells ${responses.product_name}s!\n`);
                continueOrEnd();
            })
    })
}

function continueOrEnd() {
    inquirer.prompt([
        {
            type: "confirm",
            name: "confirm",
            message: "Do you wish to continue using Clamazon Manager?"
        }
    ]).then(function (answer) {
        if (answer.confirm) start();
        else connection.end();
    })
}

function numberValidator(input) {
    if (+input) return true;
    else return false;
}