const express = require('express');
const router = express.Router();
const bcrypt =  require('bcryptjs');
const jwt = require('jsonwebtoken');
const user = require('../models/User');

//this is user sign up

router.post('/signup', async (req, res)=>{
    const { name, email, password } = req.body;
    try{
        let user = await User.findOne({ email });
        if (user){
            return res.status(400).json({ msg: 'User already exists'});
        }
        user = new User({
            name,
            email,
            password,
        });
        const slat = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = {
            user: {
                id: user.id,
            },
        };
        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '5d'
        },(err, token) => {
            if(err) throw err;

        res.json({ token });    
        }
    );
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//this is user login

router.post('/login', async(req, res) =>{
    const { email, password}= req.body;
    try{
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({msg: 'Invalid Credentials'});
        }

        const isMatch =  await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({msg: 'Invalid Credentials'});
        }
        const payload = {
            user: {
                id: user.id,
            },
        };
        jwt.sign(
            payload, process.env.JWT_SECRET, {expiresIn: '5d'},
            (err,token) => {
                if(err) throw err;

                res.json({ token});
            }
        );
    } catch (err){
        console.log(err.message);
        res.status(500).send('Server error');
    }
});
module.exports = router;

