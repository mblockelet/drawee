function initLobby() {
    try {
        $('#name').val(localStorage.getItem('name'));
    } catch (e) { }
}

function joinSession() {
    var name = $('#name').val();
    if (name) {
        localStorage.setItem('name', name);
    }
    /*var sessionId = $('#sessionId').val();
    if (sessionId) {
        window.location.href = '/lobby/' + sessionId;
    }*/
    GameManager.init('abcdef', name);
}

$(initLobby);