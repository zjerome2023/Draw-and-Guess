import mongoose from 'mongoose';

const userStatSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    gamesPlayed: { type: Number, default: 0 },
    totalWins: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    totalGuesses: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.UserStat || mongoose.model('UserStat', userStatSchema);
