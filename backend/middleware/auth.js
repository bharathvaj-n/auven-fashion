import admin from '../config/firebaseAdmin.js';
import userModel from '../models/userModel.js';

const authUser = async (req, res, next) => {
   
   let token = req.headers.authorization || req.headers.token;
   
   if (!token) {
      return res.json({ success: false, message: "Please login first!" });
   }

   // Extract token if it has "Bearer " prefix
   if (token.startsWith('Bearer ')) {
       token = token.slice(7, token.length);
   }

   try {
       // Verify Firebase ID token
       const decodedToken = await admin.auth().verifyIdToken(token);
       
       if (typeof req.body !== 'object' || req.body === null) {
           req.body = {};
       }
       
       // Map Firebase user to MongoDB user by email
       let user = await userModel.findOne({ email: decodedToken.email });
       
       // Auto-create user if they don't exist in MongoDB (e.g., first login after Firebase signup)
       if (!user) {
           user = new userModel({
               email: decodedToken.email,
               name: decodedToken.name || 'User',
               firebaseUid: decodedToken.uid
           });
           await user.save();
       } else if (!user.firebaseUid) {
           // Link existing user to Firebase UID if not already linked
           user.firebaseUid = decodedToken.uid;
           await user.save();
       }
       
       req.body.userId = user._id;
       next();
       
   } catch (error) {
       console.log(error);
       res.json({ success: false, message: "Invalid or expired token" });    
   }
}

export default authUser;