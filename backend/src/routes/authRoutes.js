import { Router } from 'express';
import { google } from 'googleapis'
import passport from 'passport';
import jwt from 'jsonwebtoken';


const router = Router();


router.get('/google',passport.authenticate('google',{
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive.file','https://www.googleapis.com/auth/drive.metadata.readonly'],
}));

router.get('/google/callback',
    passport.authenticate('google',{failureRedirect:'/'}),
    (req,res)=>{
        console.log("hii")
        const user = req.user
        const token = jwt.sign({ id: user.id, email: user.email,accessToken:user.accessToken }, process.env.JWT_SECRET, {
            expiresIn: '1d',
          });

        res.json({
            message: 'Google login successful', user, token
    })}
)


export default router