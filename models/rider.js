import mongoose from 'mongoose';


const riderSchema = new mongoose.Schema({
name: String,
phone: String,
location: {
type: { type: String, default: 'Point' },
coordinates: [Number]
},
status: { type: String, enum: ['available','on_delivery','offline'], default: 'available' }
});


riderSchema.index({ location: '2dsphere' });
export default mongoose.model('Rider', riderSchema);