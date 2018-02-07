CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
item_ID INT NOT NULL AUTO_INCREMENT,
product_name VARCHAR (100) NOT NULL,
department_name VARCHAR (40) NULL,
price DECIMAL(10,2) NOT NULL,
stock_quantity INT(10),

PRIMARY KEY (item_id)
);


INSERT INTO products (item_id, product_name, liquor_type, size, price, stock_quantity)

VALUES(47, "Very Old Barton", 86,"bourbon", 23.99, 4);