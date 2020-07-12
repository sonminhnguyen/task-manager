const express = require('express')
const multer = require('multer')
const User = require('../models/user')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const router = new express.Router()

// router.get('/test', async(req, res) => {
//     res.send('This is from my other router')
// })

// app.post('/users', (req, res) =>{
//     const user = new User(req.body)
//     user.save().then(() => {
//         res.status(201).send(user)
//     }).catch((error) => {
//         res.status(400).send(error)
//     })
//     // console.log(req.body)
//     // res.send('testing!')
// })

router.post('/users', async (req, res) =>{
    const user = new User(req.body)
    console.log(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }

})

// router.post('/users/login', async (req, res) => {
//     try {
//         const user = await User.findByCredentials(req.body.email, req.body.password)
//         const token = await user.generateAuthToken()
//         console.log(token)
//         res.send({user: user.getPublicProfile(), token})
//         // res.send(user)
//     } catch (e) {
//         res.status(400).send()
//     }
// })

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
        // res.send(user)
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        console.log(req.token)
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token  
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// app.get('/users', (req,res) => {
//     User.find({}).then((users) => {
//         res.send(users)
//     }).catch((e) => {
//         res.status(500).send()
//     })
// })

router.get('/users', auth, async (req,res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})
// app.get('/users/:id', (req,res) => {
//     const _id = req.param._id

//     User.findById(_id).then((user) => {
//         if(!user) {
//             return res.status(404).send()
//         }

//         res.send(user)
//     }).catch((e) => {
//         res.status(500).send()
//     })

//     // console.log(req.params)
// })

// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id
//     // console.log(req.params.id)

//     try {
//         const user = await User.findById(_id)
        
//         if(!user) {
//             return res.status(404).send()
//         }

//         res.send(user)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

router.get('/users/me', auth, async (req, res) => {
    const _id = req.params.id
    // console.log(req.params.id)

    try {
        const user = await User.findById(_id)
        
        if(!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

// router.patch('/users/:id', async (req, res) => {
//     //using mongoose
//     const updates = Object.keys(req.body) // change req.body to array
//     const allowedUpdates = ['name', 'email', 'password', 'age']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if(!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid updates!'})
//     }
    
//     try {
//         const user = await User.findById(req.params.id)

//         updates.forEach((update) => user[update] = req.body[update])
//         await user.save()
//         // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }) // directly update the database without access to models => cannot use middleware 
        
//         if(!user) {
//             return res.status(404).send()
//         }

//         res.send(user)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

router.patch('/users/:id', auth, async (req, res) => {
    //using mongoose
    const updates = Object.keys(req.body) // change req.body to array
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!'})
    }
    
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// router.delete('/users/:id', async (req, res) => {
//     try {
//         const user = await User.findByIdAndDelete(req.params.id)

//         if(!user) {
//             return res.status(404).send()
//         }

//         res.send(user)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

const upload = multer({
    //dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload jpg, jpeg or png files'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    // req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        
        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')// set title respond
        res.send(user.avatar)
    } catch(e) {
        res.status(404).send()
    }
})

module.exports = router