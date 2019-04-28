const generateMessage = (userName, text) => {
    return {
        userName,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (userName, latitude, longitude) => {
    return {
        userName,
        url: `https://google.com/maps?q=${latitude},${longitude}`,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}