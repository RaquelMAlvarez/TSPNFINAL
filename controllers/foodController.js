const foodModel = require('../models/food');
const authController = require('./authController');

function showFoodPage(req, res) {
    const accessRights = authController.getAccessRights(req);
    var food;
    if (accessRights == "admin") {
        food = foodModel.getAllFood();
    } else {
        food = foodModel.getNonExpiredFood();
    };

    console.log(food);
    food.then((food_items) => {
            res.render("food", {
                food: food_items
        })})
        .catch((err) => {
            console.log("promise rejected", err);
        });
};

function addFood(req, res) {
    console.log("Adding food: ", req.body);
    foodModel.addFood(req.body).then(() => {   
        res.redirect("/food");
    })
    .catch((err) => {
        res.render("add_food", { message: err });
    });
};

function addFoodPage(req, res) {
    // validate if user has access to add food and if so add the food
    authController.requireUserAccess(req, res, "add food", addFood);
};

function showAddFoodPage(_, res) {
    res.render("add_food");
};

function claimFood(req, res) {
    // parse id from request
    const id = req.params.id
    if (!id) {
        console.log("Missing id parameter");
        res.status(400).send("Please specify the id parameter");
        return;
    };

    // find the food we want to delete in the database
    foodModel.getById(id).then(function (currentFood) {
        console.log("Current food:", currentFood);

        // if the food is not found report an error
        if (!currentFood) {
            console.log("Food with id", id, "not found");
            res.status(404).send("Food with id", id, "not found");
            return;
        };

        // delete the food in database
        foodModel.remove(id).then(function(_) {
            console.log("Food with id", id, "was deleted"); 
            res.status(204).send("Food with id", id, "was deleted");
        },
        function(err) {
            console.log("failed to delete food with id", id, "with error:", err);
        });
    },
    function(err) {
        console.log("Falied to find food with id", id, "with error:", err);
    });
};

module.exports = { showFoodPage, addFoodPage, showAddFoodPage, claimFood };

