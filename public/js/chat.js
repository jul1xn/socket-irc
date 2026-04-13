const chatButton = document.getElementById('chat-button');
const chatInput = document.getElementById('chat-input');
const messageParent = document.getElementById('messages');
let mentionedAmount = 0;
const documentTitle = document.title;
const accountData = retrieveAccountData() ? JSON.parse(retrieveAccountData()) : null;
const socket = io();
const channelModal = new bootstrap.Modal(document.getElementById('channel-modal'), {
    backdrop: true,
    focus: true,
    keyboard: true
});

if (!accountData) {
    window.location.href = "/";
}

socket.on("connect", () => {
    console.log("Connected with id:", socket.id);
    socket.emit('joinChannel', {
        channel: localStorage.getItem("channel"),
        username: accountData.username,
        guest: accountData.guest
    });
});

socket.on('message', recieveMessage);
socket.on('userJoinedChannel', userJoinedChannel);
socket.on('userLeftChannel', userLeftChannel);

function appendLine(html, timestamp) {
    const messageElement = document.createElement('div');
    messageElement.setAttribute('data-timestamp', timestamp || new Date().toISOString());
    messageElement.innerHTML = html;
    messageParent.appendChild(messageElement);
    messageParent.scrollTop = messageParent.scrollHeight;
}

function recieveMessage(message) {
    console.log('Received message:', message);

    const username = accountData.username;
    const escapedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const mentionRegex = new RegExp(`@${escapedUsername}(?![\\w])`, 'i');

    let appendingLine = `&lt;<span style="color: ${stringToColour(message.username)}">${message.username}</span>&gt; <span>${message.content}</span>`;

    if (mentionRegex.test(message.content)) {
        updateMentionedAmount(mentionedAmount + 1);
        notifyMe(`Mentioned by ${message.username}`, message.content, null);

        appendingLine = appendingLine.replace(
            `<span>${message.content}</span>`,
            `<span class="mention">${message.content}</span>`
        );
    }

    appendLine(appendingLine, message.timestamp);
}

function updateMentionedAmount(amount) {
    mentionedAmount = amount;
    if (mentionedAmount > 0) {
        document.title = `(${mentionedAmount}) ${documentTitle}`;
    } else {
        document.title = documentTitle;
    }
}

function ProcessCommand(command) {
    const parts = command.slice(1).split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
        case 'logout':
            localStorage.removeItem("accountData");
            localStorage.removeItem("channel");
            window.location.href = "/";
            break;
        case 'list':
            listUsers();
            break;
        case 'whoami':
            whoAmI();
            break;
        case 'whereami':
            whereAmI();
            break;
        case 'channel':
            channelModal.show();
            break;
        case 'say':
            const sayMessage = args.join(' ');
            console.log('Sending message:', sayMessage);
            sendMessage(sayMessage);
            break;
        case 'clear':
            messageParent.innerHTML = '';
            break;
        case 'help':
            appendLine(`<span style="color: green;">Available commands: /say [message], /clear, /help, /me [action]</span>`);
            break;
        default:
            appendLine(`<span style="color: red;">Unknown command: ${cmd}. Type '/help' for more commands.</span>`);
    }
}

function userJoinedChannel(data) {
    appendLine(`<span style="color: ${stringToColour(data.username)}">${data.username}</span> <span style="color: lightgreen;">has joined channel #${localStorage.getItem("channel")}.${data.isGuest ? ' (Guest)' : ''}</span>`);
}

function userLeftChannel(data) {
    appendLine(`<span style="color: ${stringToColour(data.username)}">${data.username}</span> <span style="color: IndianRed;">has left the channel.</span>`);
}

function listUsers() {
    
}

function whoAmI() {
    appendLine(`<span style="color: lightblue;">You are logged in as: </span><span style="color: ${stringToColour(accountData.username)}">${accountData.username}</span>${accountData.guest ? ' <span style="color: orange;">(Guest)</span>' : ''}`);
}

function whereAmI() {
    const channel = localStorage.getItem("channel"); // Placeholder for actual channel logic
    appendLine(`<span style="color: lightblue;">You are in: #${channel}</span>`);
}

function processInput() {
    const message = chatInput.value;
    if (message.trim() === '') return;
    if (message.startsWith('/')) {
        ProcessCommand(message);
        chatInput.value = '';
        return;
    }

    sendMessage(message);
}

function sendMessage(message) {
    console.log('Sending message:', message);
    chatInput.value = '';

    var messageObject = {
        content: message,
        timestamp: new Date(),
        username: accountData.username,
        channel: localStorage.getItem("channel")
    }

    socket.emit('message', messageObject);
}

chatButton.addEventListener('click', processInput);
chatInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        processInput();
    }
});

chatInput.addEventListener('focus', function () {
    updateMentionedAmount(0);
});

document.getElementById('channel-submit-button').addEventListener('click', function () {
    const channelInput = document.getElementById('channel-input');
    if (channelInput.value === '') return;

    socket.emit('joinChannel', {
        channel: channelInput.value,
        oldchannel: localStorage.getItem("channel"),
        username: accountData.username,
        guest: accountData.guest
    });

    localStorage.setItem("channel", channelInput.value);
    channelInput.value = '';
    channelModal.hide();
});

appendLine(`<span style="color: green;">Welcome to the chat, <span style="color: ${stringToColour(accountData.username)}">${accountData.username}</span>! Type '/help' for a list of commands.</span>`);
whoAmI();
whereAmI();