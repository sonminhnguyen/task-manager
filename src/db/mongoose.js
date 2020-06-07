const mongoose = require('mongoose')
const Task = require("../models/task")
const User = require("../models/user")

mongoose.connect('mongodb://127.0.0.1:27017/task-manager-api', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

// const me = new User({
//     name: 'Mike',
//     email: 'myemaiL@Mead.io  ',
//     passwork: '        re32      '
// })

// me.save().then((result) => {
//     console.log(me)
// }).catch((error) => {
//     console.log('Error!', error)
// })

// const me = new User({
//     name: 'Andrew',
//     age: 26
// })


// const task = new Task({
//     description: 'Learn the Mongoose library',
//     completed: false
// }).save().then(() => {
//     console.log(task)
// }).catch((error) => {
//     console.log(error)
// })