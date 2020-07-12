const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        // unique: true,
        require: true,
        trim: true,
        lowercase: true,

        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        require: true,
        minlength: 7,
        trim: true,

        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "Password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,

        validate(value) {
            if(value < 0) {
                throw new Error('Age mest be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

//methods are accessible on the instances => instance's method
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    //add the token to that array and save the user making sure that the token shows up in the database
    user.tokens = user.tokens.concat({ token })
    await user.save()
    
    return token
}

// userSchema.methods.getPublicProfile = function () {
//     const user = this
//     const userObject = user.toObject() 

//     delete userObject.password
//     delete userObject.tokens

//     return userObject
// }
//same to above but apply for the place call user , toJSON = strignify
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject() 

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//statics are accessible on the models => model's method
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    
    if(!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//Hash the plain tesxt password before saving
//pre for doing something before an event like before validation or before saving
//post for doing something after
userSchema.pre('save', async function (next) { // 2 argument (name the event, function to run)
    const user = this
    // console.log('just before saving!')
    
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next() //just say when the function is over but wouldn't account for any asynchronous process which might be occuring
    //if never call next it just going to hang forever
})

userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id})
    next()
})

//Just linking not create anything in the database
userSchema.virtual('tasks', {
    ref: 'Task', 
    localField: '_id',
    foreignField: 'owner' 
})

const User = mongoose.model('User', userSchema)

module.exports = User