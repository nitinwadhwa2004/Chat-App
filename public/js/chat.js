const socket = io();

//Elements
const $messageForm = document.querySelector('#messageForm');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#sendLocation');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#messageTemplate').innerHTML;
const locationMessageTemplate = document.querySelector('#locationMessageTemplate').innerHTML;
const sidebarTemplate = document.querySelector('#sidebarTemplate').innerHTML;

//Parse query string
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault(); //prevents page reloading

    $messageFormButton.setAttribute('disabled', 'disabled');
    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }

        console.log('Message delivered!');
    });
})

$sendLocationButton.addEventListener('click', () => {
    $sendLocationButton.setAttribute('disabled', 'disabled');

    if (!navigator.geolocation) {
        return alert("Your browser doesn't support geolocation sharing")
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled');
            console.log('Location shared!');
        })
    });
})

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild;

    const newMessageMargin = parseInt(getComputedStyle($newMessage).marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messages.offsetHeight;
    const containerHeight = $messages.scrollHeight;

    //how far have we scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if ((containerHeight - newMessageHeight) <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }

}

socket.on('message', (message) => {
    console.log(message.text);
    const html = Mustache.render(messageTemplate, {
        userName: message.userName, 
        text: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationMessageTemplate, { 
        userName: message.userName,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('roomUsers', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, { room, users});
    document.querySelector("#sidebar").innerHTML = html;
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});