const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Assuming User model is defined
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchuser");
// Initialize router
const router = express.Router();
const JWT_SCREATE="pruthviRathod4545";
// Create a user using POST "/api/auth/"
router.post(
  "/createuser",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please enter a valid email address"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 3 })
      .withMessage("Password must be at least 3 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email is already registered." });
      }

      // Generate a salt
      const salt = await bcrypt.genSalt(10);

      // Hash the password with the salt
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email,
        password: hashedPassword, // Store the salted and hashed password
      });
      const data={
        user:{
          id:user.id
        }
      }
     const authtoken= jwt.sign(data,JWT_SCREATE)
    
      // res.json(user);
      res.json({authtoken})
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "An unexpected error occurred." });
    }
  }
);

// Authenticate aUser using :POST "/api/auth/login"
router.post(
  "/login",
  [
  
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please enter a valid email address"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 3 })
      .withMessage("Password must be at least 3 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email,password}=req.body
    try {
      let user = await User.findOne({email });
      if(!user){
        return res.status(400).json({error:"Incorrect Email or Password "});
      }
      const passwordCompare= await bcrypt.compare(password,user.password);
      if(!passwordCompare){
        return res.status(400).json({ error: "Incorrect Email or Password " });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SCREATE);
      res.json({ authtoken });
    } catch (error) {
      console.error(error.withMessage)
      res.status(500).send("Internal Server  error  ");
    }

  });


  // ROute3:  Get loggeding User Details Using :POST "/api/auth/getUser". Login required 
  router.post("/getuser", fetchuser, async (req, res) => {
    try {
      // getting the user form the middleware 
      UserId=req.user.id
      const user = await User.findById(UserId).select("-password");
      res.send(user)
    } catch (error) {
      console.error(error.withMessage);
      res.status(500).send("Internal Server  error  ");
    }
  });
module.exports = router; // Export the router
