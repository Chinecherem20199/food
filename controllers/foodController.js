import Food from '../models/food.js';

export const getFoods = async (req, res) => {
    const foods = await Food.find().populate('restaurant');
    res.json(foods);
};

export const createFood = async (req, res) => {
    const data = req.body;
    const food = await Food.create(data);
    res.json(food);
};
