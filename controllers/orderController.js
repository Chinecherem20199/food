import Order from '../models/order.js';
import Rider from '../models/rider.js';

export const createOrder = async (req, res) => {
    const { items, deliveryAddress, deliveryLocation } = req.body;
    const totalAmount = items.reduce(
        (sum, it) => sum + (it.price || 0) * it.quantity,
        0
    );
    const order = await Order.create({
        user: req.user._id,
        items,
        totalAmount,
        deliveryAddress,
        deliveryLocation
    });
    res.json({ order });
};

export const getMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .populate('items.food')
        .populate('rider');
    res.json(orders);
};

export const assignNearestRider = async (req, res) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order || !order.deliveryLocation)
        return res
            .status(400)
            .json({ message: 'Order or deliveryLocation missing' });
    const nearest = await Rider.findOne({
        status: 'available',
        location: {
            $near: { $geometry: order.deliveryLocation, $maxDistance: 20000 }
        }
    });
    if (!nearest)
        return res.status(404).json({ message: 'No rider available' });
    order.rider = nearest._id;
    order.status = 'on_the_way';
    await order.save();
    nearest.status = 'on_delivery';
    await nearest.save();
    res.json({ order, rider: nearest });
};
