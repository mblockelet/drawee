var WordSelector = {
    hide: function () {
        $('.word-selector').hide();
    },

    displayChoosing: function (name) {
        $('.word-selector').show();
        $('.word-selector').addClass('choosing-other').removeClass('choosing-self');
        $('.word-selector .choosing-player').text(name);
    },

    displayWords: function (words) {
        $('.word-selector').show();
        $('.word-selector').addClass('choosing-self').removeClass('choosing-other');
        $('.word-selector .words').empty();
        for (var i = 0; i < words.length; i++) {
            var word = words[i];
            var $word = $('<div class="word">' + word + '</div>');
            $word.click(function () {
                EventsSender.addEvent({
                    type: 'word',
                    word: $(this).text()
                });
            });
            $('.word-selector .words').append($word);
        }
    }
}