module.exports = {
    email: {
        subject: "Test",
        template: "doxybox-email",
        from: "'doxybox'",
        to: {
            email: "yourmail@gmail.com",
            name: "Burger",
            surname: "Hans"
        },
        data: {
            name: "Burger",
            surname: "Hans",
            id: "hansburger-9340rf"
        },
        smtp: {
            service: "Gmail",
            user: "youraccount@gmail.com",
            pass: "yourpassword"
        },
        attachments: [
            {
                fileName: "html5.png",
                filePath: "./email/attachments/html5.png",
                cid: "html5@doxybox"
            }
        ]
    }
};