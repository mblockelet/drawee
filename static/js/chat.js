function receiveChat(event) {
    $('.chat-area').append('<div class="chat-msg">' + event.msg + '</div>');
}

function sendChat() {
    var chat = $('.chat-input').val();
    if (chat) { chat.trim(); }
    if (chat) {
        EventsSender.addEvent({ type: 'chat', msg: chat });
    }
    $('.chat-input').val('');
    return false;
}