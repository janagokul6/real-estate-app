
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
export const getTotalUsers = async (req, res) => {
  try {
    // Define the role you want to check
    const specificRole = 'user'; // Change this to the role you want to check

    // Count all users
    const totalCount = await User.countDocuments();

    // Count users with the specific role
    const roleCount = await User.countDocuments({ role: specificRole });

    res.status(200).json({
      totalUsers: roleCount,
      userandadmin: totalCount,
    });
  } catch (error) {
    console.error('Error fetching user count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTotalAgents = async (req, res) => {
  try {
    // Define the role you want to check
    const specificRole = 'agent'; // Change this to the role you want to check

    // Count all users
    const totalCount = await User.countDocuments();

    // Count users with the specific role
    const roleCount = await User.countDocuments({ role: specificRole });

    res.status(200).json({
      totalAgents: roleCount,
      userandadmin: totalCount,
    });
  } catch (error) {
    console.error('Error fetching user count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const getAllAgents = async (req, res) => {
  try {
    // Define the role you want to check
    const specificRole = 'agent'; // Change this to the role you want to check

    // Count all users
    // const totalCount = await User.countDocuments();

    // Count users with the specific role
    const allAgents = await User.find({ role: specificRole });

    res.status(200).json(
      allAgents
     
    );
  } catch (error) {
    console.error('Error fetching user count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Define the role you want to check
    const specificRole = 'user'; // Change this to the role you want to check

    // Count all users
    // const totalCount = await User.countDocuments();

    // Count users with the specific role
    const users = await User.find({ role: specificRole });

    res.status(200).json(
      users
     
    );
  } catch (error) {
    console.error('Error fetching user count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


