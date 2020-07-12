const sgMail = require('@sendgrid/mail')

// const sendgridAPIKey = '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'
// sgMail.setApiKey(sendgridAPIKey)
sgMail.setApiKey(process.env.SENDGRID_API_KEY)



// sgMail.send({
//     to: 'shien.enruge@gmail.com',
//     from: 'sonbatgioi2@outlook.com',
//     subject: 'This is my first creation!',
//     text: 'Hiền Hôi Hám'
// })

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'sonbatgioi2@outlook.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.` // must use `` not ''
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'sonbatgioi2@outlook.com',
        subject: 'Sprry to see you go!',
        text: `Goodbye, ${name}.` // must use `` not ''
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}