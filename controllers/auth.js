const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Model/user');

const signup=async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password){
        return res.status(400).json({ error: 'All fields are mandatory' });
    }
  
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }
  
      // Encrypt the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create new user
      const newUser =await User.create({email,password: hashedPassword})
      const token=jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      })


      res.status(200).json({newUser,token: token,message: 'User created successfully'})
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  const login=async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
  
      return res.status(200).json({ user,token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

    module.exports = {
        signup,
        login
        };
