import User from '../models/User.js';
import { asyncHandler } from '../utils/helpers.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const user = await User.findById(req.user._id);
  if (name != null) user.name = name;
  await user.save();
  res.json({ user: { id: user._id, name: user.name, email: user.email } });
});
