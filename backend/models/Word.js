import mongoose from 'mongoose';

const wordSchema = new mongoose.Schema({
  text: { type: String, required: true, unique: true, lowercase: true },
  category: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
});

export default mongoose.models.Word || mongoose.model('Word', wordSchema);
