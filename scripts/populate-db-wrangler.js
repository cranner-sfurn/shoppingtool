#!/usr/bin/env node

/**
 * Database Population Script for Wrangler
 *
 * This script populates the database using wrangler's D1 commands.
 * Run with: wrangler d1 execute shoppingtool-db --file=scripts/populate-db-wrangler.js
 */

import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

// Read the adjacency list data
const adjListPath = path.join(process.cwd(), "adjlist.json");
const adjListData = JSON.parse(fs.readFileSync(adjListPath, "utf8"));

// Store ID as provided
const STORE_ID = "b280db60-e4e1-4b15-ade9-2e00693ccc7c";

// Realistic item names for each category
const CATEGORY_ITEMS = {
  entrance: ["Store Map", "Shopping Cart", "Basket", "Store Directory"],
  checkout: [
    "Cash Register",
    "Payment Terminal",
    "Receipt Printer",
    "Bagging Station",
  ],
  beer: [
    "Corona Extra 6-pack",
    "Budweiser 12-pack",
    "Heineken 6-pack",
    "Stella Artois 6-pack",
    "Guinness Draught 4-pack",
    "Blue Moon Belgian White",
  ],
  plants: [
    "Snake Plant",
    "Pothos Plant",
    "Fiddle Leaf Fig",
    "Succulent Garden",
    "Peace Lily",
    "Rubber Tree",
  ],
  household: [
    "Paper Towels",
    "Toilet Paper 12-pack",
    "Dish Soap",
    "Laundry Detergent",
    "Trash Bags",
    "Cleaning Spray",
  ],
  snacks: [
    "Potato Chips",
    "Tortilla Chips",
    "Pretzels",
    "Mixed Nuts",
    "Granola Bars",
    "Popcorn",
  ],
  kitchen: [
    "Kitchen Knife Set",
    "Cutting Board",
    "Mixing Bowls",
    "Measuring Cups",
    "Spatula Set",
    "Can Opener",
  ],
  cleaning: [
    "All-Purpose Cleaner",
    "Glass Cleaner",
    "Floor Cleaner",
    "Disinfectant Wipes",
    "Scrub Brushes",
    "Microfiber Cloths",
  ],
  toilet: [
    "Toilet Paper",
    "Toilet Bowl Cleaner",
    "Toilet Brush",
    "Air Freshener",
    "Bathroom Cleaner",
    "Plunger",
  ],
  flowers: [
    "Roses Bouquet",
    "Tulips",
    "Sunflowers",
    "Mixed Flower Arrangement",
    "Carnations",
    "Baby's Breath",
  ],
  frozen: [
    "Frozen Pizza",
    "Ice Cream",
    "Frozen Vegetables",
    "Frozen Berries",
    "Frozen Chicken",
    "Frozen Waffles",
  ],
  pasta: [
    "Spaghetti",
    "Penne Pasta",
    "Fettuccine",
    "Rigatoni",
    "Lasagna Noodles",
    "Macaroni",
  ],
  canned: [
    "Canned Tomatoes",
    "Canned Beans",
    "Canned Soup",
    "Canned Corn",
    "Canned Tuna",
    "Canned Peaches",
  ],
  chicken: [
    "Whole Chicken",
    "Chicken Breast",
    "Chicken Thighs",
    "Chicken Wings",
    "Ground Chicken",
    "Chicken Drumsticks",
  ],
  pork: [
    "Pork Chops",
    "Pork Tenderloin",
    "Ground Pork",
    "Pork Shoulder",
    "Bacon",
    "Pork Sausage",
  ],
  beef: [
    "Ground Beef",
    "Ribeye Steak",
    "Sirloin Steak",
    "Beef Roast",
    "Beef Stew Meat",
    "Beef Brisket",
  ],
  dairy: [
    "Whole Milk",
    "2% Milk",
    "Skim Milk",
    "Butter",
    "Cheddar Cheese",
    "Mozzarella Cheese",
  ],
  sandwiches: [
    "Turkey Sandwich",
    "Ham Sandwich",
    "Chicken Salad Sandwich",
    "BLT Sandwich",
    "Veggie Wrap",
    "Club Sandwich",
  ],
  drink: [
    "Coca-Cola",
    "Pepsi",
    "Orange Juice",
    "Apple Juice",
    "Energy Drinks",
    "Sparkling Water",
  ],
  chips: [
    "Lay's Classic",
    "Doritos Nacho Cheese",
    "Pringles Original",
    "Cheetos Crunchy",
    "Ruffles Original",
    "Fritos Corn Chips",
  ],
  fish: [
    "Salmon Fillet",
    "Cod Fillet",
    "Shrimp",
    "Crab Legs",
    "Tilapia",
    "Tuna Steak",
  ],
  wine: [
    "Cabernet Sauvignon",
    "Chardonnay",
    "Pinot Noir",
    "Merlot",
    "Sauvignon Blanc",
    "Riesling",
  ],
  produce: ["Bananas", "Apples", "Oranges", "Lettuce", "Tomatoes", "Carrots"],
  egg: [
    "Large Eggs 12-pack",
    "Organic Eggs",
    "Free-Range Eggs",
    "Egg Whites",
    "Brown Eggs",
    "Jumbo Eggs",
  ],
  bread: [
    "White Bread",
    "Whole Wheat Bread",
    "Sourdough Bread",
    "Bagels",
    "Croissants",
    "Dinner Rolls",
  ],
  yoghurt: [
    "Greek Yogurt",
    "Vanilla Yogurt",
    "Strawberry Yogurt",
    "Plain Yogurt",
    "Yogurt Cups",
    "Yogurt Drinks",
  ],
  clothing: ["T-Shirt", "Jeans", "Hoodie", "Socks", "Underwear", "Jacket"],
};

// Helper function to get random items for a category
function getRandomItems(categoryName) {
  const items = CATEGORY_ITEMS[categoryName] || [];
  const numItems = Math.floor(Math.random() * 5) + 2; // 2-6 items
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numItems);
}

// Helper function to check if a node name represents a category
function isCategoryNode(nodeName) {
  return (
    !nodeName.startsWith("n") ||
    nodeName === "entrance" ||
    nodeName === "checkout"
  );
}

// Helper function to escape SQL strings
function escapeSqlString(str) {
  return str.replace(/'/g, "''");
}

// Generate SQL statements
function generatePopulateSQL() {
  const sqlStatements = [];

  // Clear existing data (in reverse order of dependencies)
  sqlStatements.push("DELETE FROM StoreItem;");
  sqlStatements.push("DELETE FROM NodeConnection;");
  sqlStatements.push("DELETE FROM Node;");
  sqlStatements.push("DELETE FROM Category;");
  sqlStatements.push("DELETE FROM Store;");

  // Create store
  sqlStatements.push(
    `INSERT INTO Store (id, name, latitude, longitude) VALUES ('${STORE_ID}', 'Main Store', 40.7128, -74.0060);`
  );

  // Extract all unique node names from adjacency list
  const allNodes = new Set();
  Object.keys(adjListData).forEach((nodeName) => allNodes.add(nodeName));
  Object.values(adjListData).forEach((connections) => {
    connections.forEach((conn) => allNodes.add(conn.neighbor));
  });

  // Create categories (only for named categories, not numbered nodes)
  const categoryNodes = Array.from(allNodes).filter(
    (nodeName) =>
      isCategoryNode(nodeName) &&
      nodeName !== "entrance" &&
      nodeName !== "checkout"
  );

  const categoryMap = new Map();

  for (const categoryName of categoryNodes) {
    const categoryId = uuidv4();
    categoryMap.set(categoryName, categoryId);

    sqlStatements.push(
      `INSERT INTO Category (id, name, description, nodeId) VALUES ('${categoryId}', '${escapeSqlString(
        categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
      )}', 'Products in the ${escapeSqlString(categoryName)} section', NULL);`
    );
  }

  // Create all nodes
  const nodeMap = new Map();

  for (const nodeName of allNodes) {
    const nodeId = uuidv4();
    nodeMap.set(nodeName, nodeId);

    const isCategory =
      isCategoryNode(nodeName) &&
      nodeName !== "entrance" &&
      nodeName !== "checkout";

    sqlStatements.push(
      `INSERT INTO Node (id, name, isCategory, storeId) VALUES ('${nodeId}', '${escapeSqlString(
        nodeName
      )}', ${isCategory ? 1 : 0}, '${STORE_ID}');`
    );
  }

  // Update categories with node references
  for (const [categoryName, categoryId] of categoryMap) {
    const nodeId = nodeMap.get(categoryName);
    if (nodeId) {
      sqlStatements.push(
        `UPDATE Category SET nodeId = '${nodeId}' WHERE id = '${categoryId}';`
      );
    }
  }

  // Create node connections
  for (const [fromNode, connections] of Object.entries(adjListData)) {
    const fromNodeId = nodeMap.get(fromNode);
    if (!fromNodeId) continue;

    for (const connection of connections) {
      const toNodeId = nodeMap.get(connection.neighbor);
      if (!toNodeId) continue;

      sqlStatements.push(
        `INSERT INTO NodeConnection (id, fromNodeId, toNodeId, weight, storeId) VALUES ('${uuidv4()}', '${fromNodeId}', '${toNodeId}', ${
          connection.weight
        }, '${STORE_ID}');`
      );
    }
  }

  // Create store items for each category
  for (const [categoryName, categoryId] of categoryMap) {
    const items = getRandomItems(categoryName);

    for (const itemName of items) {
      sqlStatements.push(
        `INSERT INTO StoreItem (id, storeId, categoryId, name, description) VALUES ('${uuidv4()}', '${STORE_ID}', '${categoryId}', '${escapeSqlString(
          itemName
        )}', 'High-quality ${escapeSqlString(
          itemName.toLowerCase()
        )} available in the ${escapeSqlString(categoryName)} section');`
      );
    }
  }

  return sqlStatements.join("\n");
}

// Output the SQL
console.log(generatePopulateSQL());
