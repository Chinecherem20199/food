import express from 'express';
import Rider from '../models/rider.js';
const router = express.Router();

// create rider (admin action in real app)
router.post('/', async (req, res) => {
    const r = await Rider.create(req.body);
    res.json(r);
});
router.post('/:id/location', async (req, res) => {
    const { coordinates } = req.body;
    const r = await Rider.findByIdAndUpdate(
        req.params.id,
        { location: { type: 'Point', coordinates } },
        { new: true }
    );
    res.json(r);
});
export default router;
