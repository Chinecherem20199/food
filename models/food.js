import mongoose from 'mongoose';


const foodSchema = new mongoose.Schema({
name: String,
price: Number,
image: String,
restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }
});


export default mongoose.model('Food', foodSchema);