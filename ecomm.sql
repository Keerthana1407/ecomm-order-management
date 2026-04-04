CREATE DATABASE ecommerce_db;
USE ecommerce_db;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    address_line TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50),
    postal_code VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);
CREATE TABLE sub_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(100),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE product_subcategory (
    product_id INT,
    sub_category_id INT,
    PRIMARY KEY (product_id, sub_category_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id) ON DELETE CASCADE
);
CREATE TABLE attributes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) -- e.g., Color, Size
);
CREATE TABLE attribute_values (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attribute_id INT,
    value VARCHAR(50), -- e.g., Red, XL
    FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE
);
CREATE TABLE product_skus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    sku_code VARCHAR(100) UNIQUE,
    price DECIMAL(10,2),
    stock INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE TABLE sku_attribute_values (
    sku_id INT,
    attribute_value_id INT,
    PRIMARY KEY (sku_id, attribute_value_id),
    FOREIGN KEY (sku_id) REFERENCES product_skus(id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id) ON DELETE CASCADE
);
CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT,
    sku_id INT,
    quantity INT,
    FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    FOREIGN KEY (sku_id) REFERENCES product_skus(id) ON DELETE CASCADE
);
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    address_id INT,
    total_amount DECIMAL(10,2),
    status VARCHAR(50), -- Pending, Shipped, Delivered
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (address_id) REFERENCES addresses(id)
);
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    sku_id INT,
    quantity INT,
    price DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (sku_id) REFERENCES product_skus(id)
);
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_product_name ON products(name);
CREATE INDEX idx_sku_product ON product_skus(product_id);
CREATE INDEX idx_order_user ON orders(user_id);
INSERT INTO users (name, email, password, phone) VALUES
('Rahul Sharma', 'rahul@gmail.com', 'pass123', '9876543210'),
('Anita Verma', 'anita@gmail.com', 'pass123', '9123456780');
INSERT INTO addresses (user_id, address_line, city, state, country, postal_code) VALUES
(1, '123 Main Street', 'Bangalore', 'Karnataka', 'India', '560001'),
(2, '456 MG Road', 'Bangalore', 'Karnataka', 'India', '560002');
INSERT INTO categories (name) VALUES ('Clothing'), ('Electronics');
INSERT INTO sub_categories (category_id, name) VALUES
(1, 'T-Shirts'),
(2, 'Mobiles');
INSERT INTO products (name, description) VALUES
('Polo T-Shirt', 'Comfortable cotton t-shirt'),
('iPhone 14', 'Apple smartphone');
INSERT INTO product_subcategory VALUES
(1, 1),
(2, 2);
INSERT INTO attributes (name) VALUES ('Size'), ('Color');
INSERT INTO attribute_values (attribute_id, value) VALUES
(1, 'M'), (1, 'L'),
(2, 'Red'), (2, 'Blue');
INSERT INTO product_skus (product_id, sku_code, price, stock) VALUES
(1, 'TSHIRT-RED-M', 500, 10),
(1, 'TSHIRT-BLUE-L', 550, 8),
(2, 'IPHONE-128GB', 70000, 5);
INSERT INTO sku_attribute_values VALUES
(1,1), (1,3),
(2,2), (2,4);
SELECT p.name, sku.sku_code, sku.price, sku.stock
FROM products p
JOIN product_skus sku ON p.id = sku.product_id;
SELECT 
sku.sku_code,
a.name AS attribute,
av.value
FROM product_skus sku
JOIN sku_attribute_values sav ON sku.id = sav.sku_id
JOIN attribute_values av ON sav.attribute_value_id = av.id
JOIN attributes a ON av.attribute_id = a.id;
INSERT INTO cart (user_id) VALUES (1);
INSERT INTO cart_items (cart_id, sku_id, quantity) VALUES
(1, 1, 2),
(1, 2, 1);
SELECT 
c.id AS cart_id,
p.name,
sku.sku_code,
ci.quantity,
sku.price
FROM cart c
JOIN cart_items ci ON c.id = ci.cart_id
JOIN product_skus sku ON ci.sku_id = sku.id
JOIN products p ON sku.product_id = p.id
WHERE c.user_id = 1;
INSERT INTO orders (user_id, address_id, total_amount, status)
VALUES (1, 1, 1550, 'Pending');
INSERT INTO order_items (order_id, sku_id, quantity, price) VALUES
(1, 1, 2, 500),
(1, 2, 1, 550);
INSERT INTO payments (order_id, payment_method, payment_status, transaction_id)
VALUES (1, 'UPI', 'Success', 'TXN12345');
SELECT SUM(total_amount) AS total_revenue FROM orders;
SELECT 
o.id AS order_id,
p.name,
oi.quantity,
oi.price
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN product_skus sku ON oi.sku_id = sku.id
JOIN products p ON sku.product_id = p.id;
SELECT 
p.name,
SUM(oi.quantity) AS total_sold
FROM order_items oi
JOIN product_skus sku ON oi.sku_id = sku.id
JOIN products p ON sku.product_id = p.id
GROUP BY p.name
ORDER BY total_sold DESC;
SELECT * FROM product_skus WHERE stock < 6;
SELECT 
u.name,
o.id AS order_id,
o.total_amount,
o.status
FROM users u
JOIN orders o ON u.id = o.user_id;
SHOW TABLES;
DESCRIBE users;
SELECT 
TABLE_NAME, 
COLUMN_NAME, 
CONSTRAINT_NAME, 
REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'ecommerce_db'
AND REFERENCED_TABLE_NAME IS NOT NULL;
