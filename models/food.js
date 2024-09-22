const nedb = require("nedb");

const foodDb = new nedb({ filename: "data/food.db", autoload: true });
console.log("food db loaded");

function getById(id) {
    return new Promise((resolve, reject) => {
        console.log("Looking up food with id: ", id);

        foodDb.find({'_id': id}, function (err, foundFood) {
            if (err) {
                console.log("error finding food with id", id, ": ", err);
                reject(err);
            } else if (foundFood.length == 0) {
                console.log("food with id", id, "not found");
                resolve(null);
            } else {
                const foundFoodItem = foundFood[0];
                console.log("found food: ", foundFoodItem);
                resolve(foundFoodItem);
            };
        });
    });
};

function getAllFood() {
    return new Promise((resolve, reject) => {
        foodDb.find({}, function(err, food) {
            if (err) {
                console.log("Error loading food", err);
                reject(err);
            } else {
                console.log("Food loaded", food);
                resolve(food);
            };
        });
    });
};

function isDateValid(date) {
    // if the date is not wrong(NaN = not a number) then it is valid
    return !isNaN(new Date(date));
}

function isDateExpired(validDate) {
    const expiryDate = new Date(validDate).setHours(0, 0, 0, 0);;
    const today = new Date().setHours(0, 0, 0, 0);
    console.log("Comparing date:", expiryDate, "with today:", today, "with result:", expiryDate < today);
    return expiryDate < today;
};

function isFoodFresh(foodItem) {
    const result = !isDateExpired(foodItem.expiry_date);
    console.log("Checking whether food", foodItem.name, "is fresh with result:", result);
    return result;
};

function getNonExpiredFood() {
    return new Promise((resolve, reject) => {
        getAllFood().then(function(foodList) {
            const filteredFood = foodList.filter(isFoodFresh);
            console.log("Filtered food:", filteredFood);
            resolve(filteredFood);
        }).catch(function(err) {
            reject(err);
        });
    });
};

function addFood(food) {
    var food = {
        name: food.name,
        description: food.description,
        expiry_date: food.expiry_date
    };

    return new Promise((resolve, reject) => {
        console.log("Adding food: ", food);

        // if the date is invalid, missing or expired, report an error
        if (!isDateValid(food.expiry_date)) return reject("Expiry date is in incorrect format or missing");
        if (isDateExpired(food.expiry_date)) return reject("Food is expired");
        // if the name or description is missing, report an error
        if (!food.name || food.name == "") return reject("Missing name");
        if (!food.description || food.description == "") return reject("Missing description");

        // insert food into the database
        foodDb.insert(food, function(err, newFood) {
            if (err) {
                console.log("Error inserting food", food);
                reject(err);
            } else {
                console.log("Food inserted into database", newFood);  
                resolve(newFood);
            };
        });
    });
};

function remove(id) {
    return new Promise((resolve, reject) => {
        // find the food we want to delete in the database
        getById(id).then(function(currentFood) {
            // if the food is not found report an error
            if (!currentFood) {
                console.log("Food with id", id, "not found");
                reject("Food with id", id, "not found");
            } else {
                //delete the food
                console.log("Deleting food with id: ", id);  
                foodDb.remove({ _id: id }, {}, function(err, numberDeleted) {
                    if (err) {
                        console.log("Error deleting food with id:", id);
                        reject(err);
                    } else {
                        console.log("Deleted", numberDeleted, "food in database"); 
                        foodDb.loadDatabase();
                        resolve(numberDeleted);
                    };
                });
            };
        });
    },
    function(err) {
        // if the food search fails report an error
        console.log("error looking up food", err);
        reject("Food not found");
    });
};

module.exports = { getById, getAllFood, getNonExpiredFood, addFood, remove };