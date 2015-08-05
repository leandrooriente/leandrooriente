var trackOutboundLink = function(url) {
}

$(document).ready(function(){
    $('.post-content').on('click', '.uber-external-link', function(e) {
      var _url = $(this).attr('href');

      ga('send', 'event', 'uber', 'click', _url, {'hitCallback':
        function () { document.location = _url; }
      });

      e.preventDefault();
    });

});
