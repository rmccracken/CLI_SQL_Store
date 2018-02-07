
let mysql = require("mysql");
let inquirer = require("inquirer");
let isNumber = require("is-number");
let table = require("cli-table");
// let password = require("/keys.js");

let connection = mysql.createConnection(
    {
        host: "localhost",
        port: 3306,
        // username for sql server
        user: "root",
        // enter your password
        password: "",
        database: "bamazon"
    }
);
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    openStore();
});

openStore = () => {
    console.log("Welcome to the Alphabet store.");
    startApp();
}


displayProducts = () => {
    let query = connection.query('SELECT item_id, product_name, size, price FROM Products', function (error, result) {
        if (error) {
            console.log(error);
        } else {

            let productTable = new table({
                head: ["SKU:", "Product Name","Size", "Price"]
            });
            //loops through each item in the mysql database and pushes that information into a new row in the table
            for (let i = 0; i < result.length; i++) {
                productTable.push(
                    [result[i].item_id, result[i].product_name,result[i].size, result[i].price]
                );
            }
            console.log(productTable.toString());
        }
    });
}
startApp = () => {
    inquirer.prompt([
        {
            type: "list",
            name: "storeOpen",
            message: "Do you know what you want to buy today?",
            choices: [
                "I would like to see the inventory",
                "I know what I want",
                "I do not want to shop here any longer"
            ]
        }
    ]).then((results) => {
        if (results.storeOpen === "I know what I want") {
            runSales();
        }
        else if (results.storeOpen === "I would like to see the inventory") {
            displayProducts();
            setTimeout(() => {
                runSales()
            }, 1000);
        } else {
            console.log("Thank you, come again!");
            connection.end();
        }
    });
}

runSales = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "customerChoice",
            message: "Please enter the Item ID you would like to purchase"
        },
        {
            type: "input",
            name: "customerQuantity",
            message: " Enter the number you would like to purchase."
        }
    ]).then((results) => {
        if (isNumber(results.customerChoice) === false || isNumber(results.customerQuantity) === false) {
            console.log("You did not enter a valid choice please re-enter your selection");
            runSales();
        } else {

            dbCheck(results);
        }
    });
}
// checks database for possibilites related to the quantities availible
dbCheck = (results) => {
    let customerItem = results.customerChoice;
    let quantityNeeded = results.customerQuantity;

    connection.query('SELECT * FROM products WHERE item_id = ?', [results.customerChoice], (error, results, field) => {

        let updatedQuantity = results[0].quantity - quantityNeeded;
        let subTotal = results[0].price * quantityNeeded;
        let tax = subTotal * .053;
        let total = subTotal + tax;
        if (error) {
            throw error;
        } else if (total === 0) {
            console.log("Please select a quantity more than 0");
            runSales();
        } else if (results[0].quantity === 0) {
            console.log("I'm sorry\n We are either out of stock of " + results[0].product_name + " or we no longer stock that product.");
            runSales();
            // 
        } else if (updatedQuantity < 0) {
            console.log("I'm sorry, but we have insufficent quantites to fulfill your purchase.")
            console.log("We currently have: " + results[0].quantity + " in stock please reenter your information\n with the shown quantity to purchase the maximum quantity availible.")
            runSales();
        }
        else {
            console.log("________________________");
            console.log("| Sub Total: $" + subTotal  + "    |");
            console.log("| VA Sales Tax: $" + Number(tax).toFixed(2) + "  |");
            console.log("|______________________|");
            console.log("|  Total: $" + Number(total).toFixed(2) + "       |");
            console.log("|______________________|");
            inquirer.prompt([
                {
                    type: "list",
                    name: "confirmPurchase",
                    message: "Please confirm your purchase",
                    choices: [
                        "Complete Purchase",
                        "Re-enter selecton",
                        "exit program"
                    ]
                }]).then((results) => {
                    if (results.confirmPurchase === "Complete Purchase") {
                        updateDB(customerItem, updatedQuantity);
                    } else if (results.confirmPurchase === "Re-enter selecton") {
                        runSales();
                    }
                    else {
                        console.log("If you change your mind we are always here.");
                        connection.end();
                    }
                });
        }
    });
}


// update database quantities..
let updateDB = (customerItem, updatedQuantity) => {
    console.log("processing your order\n");

    var query = connection.query(
        "UPDATE products SET quantity = ? WHERE item_id = ?",
        [updatedQuantity, customerItem], (error, res) => {
            if (error) {
                console.log(error);
            }
            console.log('Order Complete')

            startApp();
        }
    );
}
