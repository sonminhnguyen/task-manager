require('../src/db/mongoose')
const Task = require('../src/models/task')

// Task.findByIdAndDelete('5e721233f69da73334c514f5').then((task) => {
//     console.log(task)
//     return Task.countDocuments({completed: false})
// }).then((result) => {
//     console.log(result)
// }).catch((error) => {
//     console.log(error)
// })

const deleteTaskAndCount = async (id) => {
    const update = await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({completed : false})
    return count
}

deleteTaskAndCount('5e721233f69da73334c514f5').then((count) => {
    console.log(count)
}).catch((e) => {
    console.log(e)
})