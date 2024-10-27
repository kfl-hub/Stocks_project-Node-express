const router = require('express').Router();
const JwtAuth = require('../middleware/auth/jwtAuth');
const userService = require('../service/userService');


router.get('/',JwtAuth,userService.getUser)

router.post('/register',async(req,res)=>{
    await userService.createUserByEmail(req,res);
    return;
})
router.post('/login-email',async(req,res)=>{
    await userService.loginByEmail(req,res);
    return;
})
router.post('/login-username',async(req,res)=>{
    await userService.loginByUsername(req,res);
    return;
})
router.patch('/change-username',JwtAuth,async(req,res)=>{
    await userService.changeUsername(req,res);
    return;
})
router.patch('/change-password',JwtAuth,async(req,res)=>{
    await userService.changePassword(req,res);
    return;
})
router.delete('/delete',JwtAuth,async(req,res)=>{
    await userService.deleteUser(req,res);
    return;
})
module.exports=router;