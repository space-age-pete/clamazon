DROP DATABASE IF EXISTS clamazon_db;
CREATE DATABASE clamazon_db;
USE clamazon_db;

CREATE TABLE products(
item_id INTEGER AUTO_INCREMENT NOT NULL,
product_name VARCHAR (255) NOT NULL,
department_name VARCHAR (255) NOT NULL,
price DECIMAL (10,2) NOT NULL,
stock_quantity INTEGER NOT NULL,
PRIMARY KEY (item_id)
);

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES ("Clock","Appliances", 29.99, 30),
("Hamburger","Groceries",5.00,10),
("Human Soul", "Misc.", 9999.99, 1),
("Refrigerator", "Appliances", 100.00, 500);