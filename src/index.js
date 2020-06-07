const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 3000


// app.use((req, res, next) => {
//     if(req.method === 'GET') {
//         res.send('get requests are disabled')
//     } else {
//         next()
//     }
//     // console.log(req.method, req.path) // req.method=> http method
//     // next()
// })


// app.use((req, res, next) => {
//     res.status(503).send('Site is currently down. Check back soon!')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


// const router = new express.Router()
// router.get('/test', async(req, res) => {
//     res.send('This is from my other router')
// })
// app.use(router)


app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

// const jwt = require('jsonwebtoken')

// const myFunction = async () => {
//     const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', { expiresIn: "2 days"}) // Object contain the data that's going to be embedded in token => need unique idetifier
//     // string gonna be used to sign the token making sure that it hasn't been tampered with altered in anyway => only need random character
//     console.log(token)

//     const data = jwt.verify(token, 'thisismynewcourse')
//     console.log(data)
// }

// myFunction()


// const bcrypt = require('bcryptjs')

// const myfunction = async () => {
//     const passwork = 'Red12345!'
//     const hashedPassword = await bcrypt.hash(passwork, 8)

//     console.log(passwork)
//     console.log(hashedPassword)

//     const isMatch = await bcrypt.compare('Red12345!', hashedPassword)
//     console.log(isMatch)
// }

// myfunction()


// const pet = {
//     name: 'Hal'
// }

// pet.toJSON = function () {
//     console.log(this)
//     return this
// }

// console.log(JSON.stringify(pet))

// const Task = require("./models/task")
// const User = require('./models/user')

// const main = async () => {
//     // const task = await Task.findById('')
//     // await task.populate('onwer').execPopulate() // find the user who's associated with this task and task that owner will now be their profile the entire document
//     // //as opposed to just being the id
//     // console.log(task.onwer)

//     const user = await User.findById('5ec67b0e32d33a2dbc6b1bc4')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }

// main()

const multer = require('multer')

const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        // if(!file.originalname.endsWith('.pdf')) {
        //     return cb(new Error('Please upload a PDF'))
        // }
        if(!file.originalname.match(/\.(doc|docx)$/)) {
            return cb(new Error('Please upload a Word document'))
        }

        cb(undefined, true) 
        // cb(new Error('File must be a PDF'))
        // cb(undefined, true) 
        // cb(undefined, false)

    }
})

const errorMiddleware = (req, res, next) => {
    throw new Error('From my Middleware')
}

// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send()
// })
app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})