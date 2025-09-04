import mongoose from 'mongoose';
import shortid from 'shortid';

const clickSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  referrer: String,
  geo: String,
  ip: String,
  userAgent: String
});

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  shortCode: {
    type: String,
    required: false,
    unique: true,
    default: () => shortid.generate()
  },
  expiry: {
    type: Date,
    required: false,
    default: () => new Date(Date.now() + 30 * 60 * 1000) 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  clicks: [clickSchema]
});

urlSchema.index({ shortCode: 1 });
urlSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 }); 

export default mongoose.model('Url', urlSchema);
