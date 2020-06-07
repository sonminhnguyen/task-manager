const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

//Create new tasks

// app.post('/tasks', (req,res) => {
//     const task = new Task(req.body)
//     task.save().then(() => {
//         res.status(201).send(task)
//     }).catch((error) => {
//         res.status(400).send(error)
//     })
// })

// router.post('/tasks', async (req,res) => {
//     const task = new Task(req.body)
//     try {
//         await task.save()
//         res.status(200).send()
//     } catch (e) {
//         res.status(500).send()
//     }
// })

router.post('/tasks', auth, async (req,res) => {
    //const task = new Task(req.body)
    const task = new Task({ 
        ...req.body,  //copy all of the properties from body over to this object
        owner: req.user._id
    })
    try {
        await task.save()
        
        res.send(task).status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

// app.get('/tasks', (req, res) => {
//     Task.find({}).then((tasks) => {
//         res.send(tasks)
//     }).catch((e) => {
//         res.status(500).send(e)
//     })
// })

//GET /task?completed=true
//GET /task?limit=10&skip=20 get the 21->30 datas
//GET /tasks?sortBy=createdAt_asc
//GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    } 

    try {
        // const tasks = await Task.find({ owner: req.user._id })
        // await req.user.populate('tasks').execPopulate()
        await req.user.populate({
            path: 'tasks',
            // match: {
            //     completed: false
            // }
            match,
            options: {
                limit: parseInt(req.query.limit), //convert string in query to int
                skip: parseInt(req.query.skip),
                sort: {
                    // createdAt: 1    //1: asc , -1: desc
                    // completed : -1
                }
            }
        }).execPopulate()

        res.send(req.user.tasks)
        res.status(200).send()
    } catch (e) {
        res.status(500).send()
    }
})

// app.get('/tasks/:id', (req, res) => {
//     const _id = req.params.id
//     // console.log(_id)
//     Task.findById(_id).then((task) => {
//         if(!task) {
//             return res.status(404).send()
//         }
//         console.log(task)
//         res.send(task)
//     }).catch((e) => {
//         res.status(500).send()
//     })
// })

// router.get('/tasks/:id', auth, async (req, res) => {
//     const _id = req.params.id
//     console.log(_id)

//     try {
//         const task = await Task.findById(_id)
        
//         console.log(task)
//         if(!task) {
//             return res.status(404).send()
//         }
        
//         res.send(task)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    console.log(_id)
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        console.log(task)
        if(!task) {
            return res.status(404).send()
        }
        
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

// router.patch('/tasks/:id', auth, async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['completed', 'description']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if(!isValidOperation) {
//         res.status(400).send({ 'error': 'Invalid updates!' })
//     }
//     try {
//         const task = await Task.findById(req.params.id)

//         updates.forEach(update => task[update] = req.body[update]);
//         await task.save()

//         // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

//         if(!task) {
//             return res.status(404).send()
//         }

//         res.status(200).send(task)
//     } catch (e) {
//         res.status(400).send(e)
//     }

// })
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['completed', 'description']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        res.status(400).send({ 'error': 'Invalid updates!' })
    }
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})
        
        if(!task) {
            return res.status(404).send()
        }
        
        updates.forEach(update => task[update] = req.body[update]);
        await task.save()
        res.status(200).send(task)
    } catch (e) {
        res.status(400).send(e)
    }

})

router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id)

        if(!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id})

        if(!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router