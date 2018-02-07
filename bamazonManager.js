let mysql = require("mysql");
let inquirer = require("inquirer");
let isNumber = require("is-number");
let table = require("cli-table");

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
    inventoryManagement();
});

inventoryManagement = () => {
    inquirer.prompt([
        {
            type: "list",
            name: "managerMenu",
            message: "Welcome to AIMS\n Alphabet Inventory Management System\n Please make a selection",
            choices: [
                "Current stock on hand",
                "View low inventory",
                "Receive existing products",
                "Receive new products",
                "Exit Application\n"
            ]
        }
    ]).then((results) => {
        if (results.managerMenu === "Current stock on hand") {
            showStock();
        } else if (results.managerMenu === "View low inventory") {
            showLowInventory();
        }
        else if (results.managerMenu === "Receive existing products") {
            addCurrentInventory();
        }
        else if (results.managerMenu === "Receive new products") {
            addNewProduct();
        } else {
            console.log("Thank you for using the Alphabet Inventory Management System\n");
            connection.end();
        }

    });
}

showStock = () => {

    let query = connection.query('SELECT item_id, product_name, price, quantity FROM Products', function (error, result) {
        if (error) {
            console.log(error);
        } else {
            let productTable = new table({
                head: ["SKU:", "Product Name", "Price", "Availible\n Quantity"]
            });
            //loops through each item in the mysql database and pushes that information into a new row in the table
            for (let i = 0; i < result.length; i++) {
                productTable.push(
                    [result[i].item_id, result[i].product_name, result[i].price, result[i].quantity]
                );
            }
            console.log(productTable.toString());
        }
    });
    setTimeout(() => {
        inventoryManagement()
    }, 500);

}

showLowInventory = () => {
    let query = connection.query(
        "SELECT * FROM products WHERE quantity < 5", (error, results, fields) => {
            if (error) {
                console.log(error)
            } else {
                let productTable = new table({
                    head: ["SKU:", "Product Name", "Type", "Size", "Price", "Availible\n Quantity"]
                });
                //loops through each item in the mysql database and pushes that information into a new row in the table
                for (let i = 0; i < results.length; i++) {
                    productTable.push(
                        [results[i].item_id, results[i].product_name, results[i].liquor_type, results[i].size, results[i].price, results[i].quantity]
                    );
                }
                console.log(productTable.toString());
            }
        });
    setTimeout(() => {
        inventoryManagement()
    }, 1000);
}

addCurrentInventory = () => {

    inquirer.prompt([
        {
            type: "input",
            name: "itemID",
            message: "Please enter the SKU of the item you want to update."
        },
        {
            type: "input",
            name: "quantity",
            message: "Please enter amount received."
        }
    ]).then((results) => {

        let update = connection.query(
            "UPDATE products SET quantity = quantity + ? WHERE item_id = ?",
            [results.quantity, results.itemID], (error, results) => {
                if (error) {
                    console.log(error);
                }
                console.log("Quantites Updated");
                andAgain();

            }
        );
    }
        );
}

let andAgain = () => {
    inquirer.prompt([
        {
            type: "list",
            name: "addMenu",
            message: "Welcome to Alphabet Inventory Management\n Please make a selection",
            choices: [
                "Receive Additional Items",
                "Add More New Items",
                "Return to Main Menu", 
                "Exit Application"
            ]
        }
    ]).then((results) => {
        if (results.addMenu === "Receive Additional Items") {
            addCurrentInventory();
        }else if (results.addMenu === "Add More New Items"){
            addNewProduct();
        }else if (results.addMenu === "Return to Main Menu") {
            inventoryManagement();
        } else {
            connection.end();
        }
    });
}

addNewProduct = () => {
    console.log("woohoo new booze");
    inquirer.prompt([
        {
            name: "product",
            type: "input",
            message: "Enter product name"
        },
        {
            name: "type",
            type: "input",
            message: "Enter spirit type"
        },
        {
            name: 'size',
            type: 'input',
            message: "Enter item size (ml)"
        },
        {
            name: 'price',
            type: 'input',
            message: "Enter item cost."
        },
        {
            name: 'quantity',
            type: 'input',
            message: "Enter amount received."
        }
    ]).then((results) => {

let newProduct = {
    product: results.product,
    type: results.type,
    size: results.size,
    price: results.price,
    quantity: results.quantity
    };
let query = connection.query(
    "INSERT INTO products SET ?",
    {
        product_name: newProduct.product,
        liquor_type: newProduct.type,
        size: newProduct.size,
        price: newProduct.price,
        quantity: newProduct.quantity
      },
    function (error, results) {
        if (error) {
            console.log(error);
        }

        console.log("Product added,\n Product Received.");
        // Call updateProduct AFTER the INSERT completes
        andAgain();
    }
);

});
}