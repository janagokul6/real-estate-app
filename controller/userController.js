
import User from "../model/userModel.js"

// Register a new user
export const registerUser = async (userData) => {
  try {
    const newUser = new User({
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      role: userData.role || 'buyer', 
      isRegistered: true,
      registrationDate: new Date(),
    });
    const savedUser = await newUser.save();
    return savedUser;
  } catch (error) {
     console.error('Error registering user:', error);
    throw error;
  }
};

// Login a user
export const loginUser = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
    if (user.password !== password) {
      throw new Error('Incorrect password');
    }
    user.lastLoginDate = new Date();
    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};

// module.exports = { registerUser, loginUser };
