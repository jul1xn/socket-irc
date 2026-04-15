const chatButton = document.getElementById('chat-button');
const chatInput = document.getElementById('chat-input');
const messageParent = document.getElementById('messages');
let mentionedAmount = 0;
const documentTitle = document.title;
const accountData = retrieveAccountData() ? JSON.parse(retrieveAccountData()) : null;
const socket = io();
var time = new Date([], { hour: '2-digit', minute: '2-digit' });
const formattingModal = new bootstrap.Modal(document.getElementById('formatting-modal'), {
    backdrop: true,
    focus: true,
    keyboard: true
});
const channelModal = new bootstrap.Modal(document.getElementById('channel-modal'), {
    backdrop: true,
    focus: true,
    keyboard: true
});

function renderEmojiList() {
    const emojiList = document.getElementById('emoji-list');
    if (!emojiList) return;

    emojiList.innerHTML = Object.entries(emojiMap)
        .map(([name, emoji]) => `<li><code>:${name}:</code> ${emoji}</li>`)
        .join('');
}

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
socket.on('action', recieveAction);
socket.on('userJoinedChannel', userJoinedChannel);
socket.on('userLeftChannel', userLeftChannel);

function formatString(text) {
    htmlspecialchars = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };

    text = text.replace(/[&<>"']/g, function (match) {
        return htmlspecialchars[match];
    });
    return text;
}

function appendLine(html, timestamp) {
    const messageElement = document.createElement('div');
    messageElement.setAttribute('data-timestamp', timestamp || new Date().toISOString());
    messageElement.innerHTML = html;
    messageParent.appendChild(messageElement);
    messageParent.scrollTop = messageParent.scrollHeight;
}

function discordFormat(text) {
  return text
    // Code block (~~~code~~~)
    .replace(/~~~([\s\S]*?)~~~/g, "<pre><code>$1</code></pre>")

    // Inline code (~code~)
    .replace(/~(.*?)~/g, "<code>$1</code>")

    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // Italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")

    // Strikethrough
    .replace(/~~(.*?)~~/g, "<del>$1</del>")

    // Underline
    .replace(/__(.*?)__/g, "<u>$1</u>")

    // Spoiler (||text||)
    .replace(/\|\|(.*?)\|\|/g, '<span class="spoiler">$1</span>');
}

function recieveAction(message) {
    message.content = formatString(message.content);
    message.username = formatString(message.username);

    appendLine(`<span>* <i><span style="color: ${stringToColour(message.username)}">${message.username}</span> ${message.content}</i></span>`, message.timestamp);
}

function recieveMessage(message) {

    const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
    const urls = message.content.match(urlRegex) || [];

    message.content = formatString(message.content);
    message.content = discordFormat(message.content);
    message.username = formatString(message.username);

    urls.forEach((url) => {
        const escapedUrl = formatString(url);
        message.content = message.content.replace(escapedUrl, `<a href="${encodeURI(url)}" target="_blank" rel="noopener noreferrer">${escapedUrl}</a>`);
    });

    console.log('Received message:', message, message.timestamp);

    const username = accountData.username;
    const escapedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const mentionRegex = new RegExp(`@${escapedUsername}(?![\\w])`, 'i');

    const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let appendingLine = `&lt;<span style="color: ${stringToColour(message.username)}">${message.username}</span>&gt; <span>${message.content} <span class="timestamp">${formattedTime}</span></span>`;

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
            console.log('Running /logout command');
            localStorage.removeItem("accountData");
            localStorage.removeItem("channel");
            window.location.href = "/";
            break;
        case 'list':
            console.log('Ran /list');
            listUsers();
            break;
        case 'whoami':
            console.log('Ran /whoami');
            whoAmI();
            break;
        case 'whereami':
            console.log('Ran /whereami');
            whereAmI();
            break;
        case 'channel':
            console.log('Ran /channel');
            channelModal.show();
            break;
        case 'formatting':
            console.log('Ran /formatting');
            appendLine('<span style="color: yellow" class="formatting-guide-button" type="button">Formatting guide opened. Click here to open it again.</span>');
            formattingModal.show();
            break;
        case 'say':
            console.log('Ran /say with args:', args);
            const sayMessage = args.join(' ');
            if (sayMessage.trim() === '') {
                appendLine(`<span style="color: red;">Usage: /say [message]</span>`);
                return;
            }
            console.log('Sending message:', sayMessage);
            sendMessage(sayMessage);
            break;
        case 'clear':
            messageParent.innerHTML = '';
            appendLine('<span style="color: grey;">Chat cleared.</span>');
            break;
        case 'help':
            console.log('Ran /help: Available commands: /say [message], /clear, /help, /me [action], /logout, /list, /whoami, /whereami, /channel, /formatting, /status');
            appendLine(`<span style="color: green;">Available commands: /say [message], /clear, /help, /me [action], /logout, /list, /whoami, /whereami, /channel, /formatting, /status</span>`);
            break;
        case 'me':
            console.log('Ran /me with args:', args);
            const actionMessage = args.join(' ');
            if (actionMessage.trim() === '') {
                appendLine(`<span style="color: red;">Usage: /me [action]</span>`);
                return;
            }

            var object = {
                content: actionMessage,
                timestamp: new Date().toISOString(),
                username: accountData.username
            }

            console.log("Sending /me with obj:", object);
            socket.emit('action', object);
            break;
        case 'status':
            console.log('Ran /status');
            socket.emit('pingStatus', {
            }, (response) => {
                if (response && response.status === 'ok') {
                    appendLine(`<span style="color: lightgreen;">Server status: Online</span>`);
                } else {
                    appendLine(`<span style="color: red;">Server status: Offline</span>`);
                }
            });
            break;
        default:
            appendLine(`<span style="color: red;">Unknown command: ${cmd}. Type '/help' for more commands.</span>`);
    }
}

function userJoinedChannel(data) {
    data.username = formatString(data.username);
    appendLine(`<span style="color: ${stringToColour(data.username)}">${data.username}</span> <span style="color: lightgreen;">has joined channel #${localStorage.getItem("channel")}.${data.isGuest ? ' (Guest)' : ''}</span>`);
}

function userLeftChannel(data) {
    data.username = formatString(data.username);
    appendLine(`<span style="color: ${stringToColour(data.username)}">${data.username}</span> <span style="color: IndianRed;">has left the channel.</span>`);
}

function listUsers() {
    socket.emit('requestUserList', {
        channel: localStorage.getItem("channel")
    }, (data) => {
        const channel = data.channel || localStorage.getItem("channel");
        const users = Array.isArray(data.users) ? data.users : [];

        if (users.length === 0) {
            appendLine(`<span style="color: lightblue;">Users in #${channel}: none</span>`);
            return;
        }

        const formattedUsers = users
            .map((user) => {
                user.username = formatString(user.username);
                const guestSuffix = user.isGuest ? ' (Guest)' : '';
                return `<span style="color: ${stringToColour(user.username)}">${user.username}</span>${guestSuffix}`;
            })
            .join(', ');

        appendLine(`<span style="color: lightblue;">Users in #${channel}: ${formattedUsers}</span>`);
    });
}

function whoAmI() {
    appendLine(`<span style="color: lightblue;">You are logged in as: </span><span style="color: ${stringToColour(formatString(accountData.username))}">${formatString(accountData.username)}</span>${accountData.guest ? ' <span style="color: orange;">(Guest)</span>' : ''}`);
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
        content: message.trim(),
        timestamp: new Date().toISOString(),
        username: accountData.username,
    }

    socket.emit('message', messageObject);
}

chatButton.addEventListener('click', processInput);
chatInput.addEventListener('input', replaceEmojiCodesInInput);
chatInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        processInput();
    }
});

chatInput.addEventListener('focus', function () {
    updateMentionedAmount(0);
});

messageParent.addEventListener('click', function (event) {
    if (event.target.closest('.formatting-guide-button')) {
        formattingModal.show();
    }
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

appendLine('<span style="color: grey;">Made by Juljaan and Kijan</span>');
appendLine(`<span style="color: green;">Welcome to the chat, <span style="color: ${stringToColour(formatString(accountData.username))}">${formatString(accountData.username)}</span>! Type '/help' for a list of commands.</span>`);
renderEmojiList();
whoAmI();
whereAmI();
