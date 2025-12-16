import express from 'express';
import { getFoods, createFood } from '../controllers/foodController.js';


const router = express.Router();
router.get('/', getFoods);
router.post('/', createFood);

export default router;
