let messageHistory = [];
let historyIndex = -1;
const HISTORY_LIMIT = 50;

function addToHistory(message) {
    historyIndex = -1;
    if (messageHistory.length > 0) {
        if (messageHistory[0] !== message) {
            messageHistory.unshift(message);
        }
    }
    else {
        messageHistory.unshift(message);
    }
    messageHistory = messageHistory.slice(0, HISTORY_LIMIT);
}

function cycleHistoryUp(chatInput) {
    historyIndex++;
    if (historyIndex >= messageHistory.length - 1) {
        historyIndex = messageHistory.length - 1;
    }
    chatInput.value = messageHistory[historyIndex];
}

function cycleHistoryDown(chatInput) {
    if (historyIndex < 1) return;
    
    historyIndex--;
    if (historyIndex < 0) {
        historyIndex = 0;
    }
    chatInput.value = messageHistory[historyIndex];
}