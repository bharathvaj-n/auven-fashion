import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";


const createToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET)
}

// Route for user login (Replaced by Firebase Auth, stub for compatibility)
const loginUser = async (req,res) => {
  res.json({success:false, message: "Please use Firebase login in the frontend."})
}

// Route for user registration (Replaced by Firebase Auth, stub for compatibility)
const registerUser = async (req,res) => {
  res.json({success:false, message: "Please use Firebase registration in the frontend."})
}

// Route for Admin login (Preserved - uses separate JWT auth)
const adminLogin = async (req,res) => {
  try {
    const {email, password} = req.body;

    if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email+password, process.env.JWT_SECRET);
      res.json({success:true, token})
    } else {
      res.json({success:false, message: "Invalid credentials"});
    }
  } catch (error) {
    console.log(error);
    res.json({success:false, message: error.message})
  }
}

// --- PHASE 31: PROFILE & ADDRESSES ---

// Get Profile
const getProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId).select('-password');
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update Profile
const updateProfile = async (req, res) => {
    try {
        const { userId, name, email } = req.body;
        
        if (!name || !email) {
            return res.json({ success: false, message: "Name and email are required" });
        }
        
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Invalid email format" });
        }
        
        // Check if email belongs to someone else
        const exists = await userModel.findOne({ email, _id: { $ne: userId } });
        if (exists) {
            return res.json({ success: false, message: "Email is already in use by another account" });
        }
        
        await userModel.findByIdAndUpdate(userId, { name, email });
        res.json({ success: true, message: "Profile updated successfully" });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Change Password (Replaced by Firebase Auth)
const changePassword = async (req, res) => {
    res.json({ success: false, message: "Please change your password using Firebase authentication flow." });
};

// Add Address
const addAddress = async (req, res) => {
    try {
        const { userId, name, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;
        
        if (!name || !phone || !addressLine1 || !city || !state || !postalCode || !country) {
            return res.json({ success: false, message: "All required fields must be provided" });
        }
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        
        const newAddress = {
            name, phone, addressLine1, addressLine2, city, state, postalCode, country,
            isDefault: false
        };
        
        // If it's their first address, or they checked isDefault
        const shouldBeDefault = user.addresses.length === 0 || isDefault;
        
        if (shouldBeDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
            newAddress.isDefault = true;
        }
        
        user.addresses.push(newAddress);
        await user.save();
        
        res.json({ success: true, message: "Address added successfully", addresses: user.addresses });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update Address
const updateAddress = async (req, res) => {
    try {
        const { userId, name, phone, addressLine1, addressLine2, city, state, postalCode, country } = req.body;
        const { addressId } = req.params;
        
        if (!name || !phone || !addressLine1 || !city || !state || !postalCode || !country) {
            return res.json({ success: false, message: "All required fields must be provided" });
        }
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        
        const address = user.addresses.id(addressId);
        if (!address) {
            return res.json({ success: false, message: "Address not found" });
        }
        
        address.name = name;
        address.phone = phone;
        address.addressLine1 = addressLine1;
        address.addressLine2 = addressLine2;
        address.city = city;
        address.state = state;
        address.postalCode = postalCode;
        address.country = country;
        
        await user.save();
        
        res.json({ success: true, message: "Address updated successfully", addresses: user.addresses });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete Address
const deleteAddress = async (req, res) => {
    try {
        const { userId } = req.body;
        const { addressId } = req.params;
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        
        const address = user.addresses.id(addressId);
        if (!address) {
            return res.json({ success: false, message: "Address not found" });
        }
        
        const wasDefault = address.isDefault;
        user.addresses.pull({ _id: addressId });
        
        // If we deleted the default address, make the first remaining address default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }
        
        await user.save();
        
        res.json({ success: true, message: "Address deleted successfully", addresses: user.addresses });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Set Default Address
const setDefaultAddress = async (req, res) => {
    try {
        const { userId } = req.body;
        const { addressId } = req.params;
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        
        const address = user.addresses.id(addressId);
        if (!address) {
            return res.json({ success: false, message: "Address not found" });
        }
        
        user.addresses.forEach(addr => addr.isDefault = false);
        address.isDefault = true;
        
        await user.save();
        
        res.json({ success: true, message: "Default address updated", addresses: user.addresses });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


export { loginUser, registerUser, adminLogin, getProfile, updateProfile, changePassword, addAddress, updateAddress, deleteAddress, setDefaultAddress }