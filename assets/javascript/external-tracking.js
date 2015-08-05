function getSelected() {
  var text = "";
  if (window.getSelection) {
      text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
      text = document.selection.createRange().text;
  }
  return text;
}


$(document).ready(function(){
  var $post = $('.post-content');

  $post.on('click', '.uber-external-link', function(e) {
    var _url = $(this).attr('href');

    ga('send', 'event', 'uber', 'click', _url, {'hitCallback':
      function () { document.location = _url; }
    });

    e.preventDefault();
  });

  $post.on('copy', function(e) {
    var _text = getSelected();
    if (_text && _text.toLowerCase().indexOf('uber20pratas') !== -1) {
      ga('send', 'event', 'uber', 'copy', _text);
    }
  });
});
