import bcrypt from "bcryptjs";
import User from "../models/user.js";
import jwt from 'jsonwebtoken'

export const getAllUsers=async(req, res)=>{
        try {
                const users=await User.find()
                res.status(200).json(users)
        } catch (error) {
                res.status(500).json({ error: error.message });
        }
}
export const signUpUser=async(req, res)=>{
    try {
        const { firstName, lastName, email, password, role } = req.body; 
        const existingUser=await User.findOne({email: email})
        if(existingUser) {return res.status(400).json({msg: 'User already exist'})}
        const salt = await bcrypt.genSalt();
        const hashPass = await bcrypt.hash(password, salt);
        const newUser = new User({ firstName, lastName, email, password: hashPass, role });
        const user = await newUser.save();
        const token=jwt.sign({id: newUser._id}, process.env.JWT)
        res.status(200).json({user, token});
} catch (error) {
        res.status(500).json({ error: error.message });
}
}


export const loginUser=async(req, res)=>{
    const { email, password } = req.body;
    try {
            const user = await User.findOne({email: email});
            if (!user) return res.status(400).json({ msg: "User does not exist" })
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" })
            const token=jwt.sign({id: user._id}, process.env.JWT)
            res.status(200).json({token,user});
    } catch (error) {
            res.status(500).send({ error: error.message });
    }
}