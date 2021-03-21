var bookmarkletClickHandler;
var DEFAULT_THEME = "ace/theme/kuroir";
// var DEFAULT_THEME = "ace/theme/gruvbox";

// Handles a keyUp event a while after the most recent keyUp event triggered
// so that if you type really fast the event triggers only once and only after
// you take a break from typing
$.fn.delayedKeyUp = function (timeout, f) {
  var keyupTimeout = null;
  var $that = this;
  this.keyup(function () {
    if (keyupTimeout != null) {
      clearTimeout(keyupTimeout);
    }
    keyupTimeout = setTimeout(function () {
      keyupTimeout = null;
      $that.each(f);
    }, timeout);
  });
  return this;
};

// Main code
$(function () {
  $(window).keydown(function (event) {
    if (!(event.which == 83 && event.ctrlKey)) return true;
    $("#save").click();
    event.preventDefault();
    return false;
  });

  function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  function setCookie(k, v) {
    document.cookie =
      k +
      "=" +
      v +
      ";  expires=" +
      new Date(2147483647 * 1000).toUTCString() +
      "; path=/";
  }

  var editor = ace.edit("nice");
  var theme = getCookie("theme") || DEFAULT_THEME;
  $("#theme").val(theme);

  //   editor.setTheme(theme);
  //   editor.session.setMode("ace/mode/javascript");

  editor.setOptions({
    //   autocomplete requires <script src="../build/src-noconflict/ext-language_tools.js"></script>
    // enableBasicAutocompletion: true,
    autoScrollEditorIntoView: true,
    copyWithEmptySelection: true,
    highlightSelectedWord: true,
    showInvisibles: true,
    tabSize: 2,
    wrap: true,
    fontFamily: "JetBrains Mono",
    fontSize: "14pt",
    theme: theme,
    mergeUndoDeltas: "always",
    mode: "ace/mode/javascript",
    showPrintMargin: false,
  });

  var snippet = localStorage.getItem("snippet");

  if (snippet) {
    debugger;
    editor.setValue(snippet);
    editor.renderer.updateFull();
  }

  bookmarkletClickHandler = function (event) {
    if ($("#save").attr("disabled") == null) {
      if (!confirm("You have unsaved changes. Discard them?")) return false;
    }

    $("#bookmarks li.bookmarklet").removeClass("selected");
    var $li = $(this).addClass("selected");
    var bookmark = $li.data("bookmark");

    // load title
    $("#title")[0].value = bookmark.title;
    updateBookmarkletTitle.call($("#title")[0]);

    // load url
    $("#bookmarkified").val(bookmark.url);
    updateNice.call($("#bookmarkified").get(0));

    $("#save").attr("disabled", true);
  };

  function bookmarkify(source) {
    return "javascript:" + jsmin(source).replace(/^\s+|\s+$/, "");
  }
  function unbookmarkify(source) {
    return js_beautify(unescape(source.replace(/^javascript:/, "")));
  }

  function updateBookmarklet() {
    $("#bookmarkable").attr("href", $("#bookmarkified").val());
    $("#save").removeAttr("disabled");
  }
  function updateBookmarkletTitle() {
    var title = "Bookmarklet";
    if (!this.value.match(/^\s*$/)) title = this.value;
    $("#bookmarkable").text(title);
  }
  function updateBookmarkified() {
    var code = editor.getSession().getValue();
    $("#bookmarkified").val(bookmarkify(code));
    updateBookmarklet();
    localStorage.setItem("snippet", code);
  }
  function updateNice() {
    editor.getSession().setValue(unbookmarkify(this.value));
    updateBookmarklet();
  }

  $("#save").click(function () {
    $("#bookmarks li.bookmarklet.selected").each(function () {
      var $li = $(this);
      //   var bookmark = $li.data("bookmark");
    });
    $("#save").attr("disabled", true);
    return false;
  });

  $("#format").on("click", function () {
    editor.getSession().setValue(unbookmarkify(editor.getSession().getValue()));
  });

  $("#theme").on("change", function () {
    editor.setTheme(this.value);
    setCookie("theme", this.value);
  });
  $("#escape").on("click", function () {
    editor.getSession().setValue(escape(editor.getSession().getValue()));
  });

  editor.session.on("change", updateBookmarkified);
  $("#bookmarkified").delayedKeyUp(100, updateNice).bind("drop", updateNice);
  $("#title").delayedKeyUp(100, updateBookmarkletTitle);

  updateBookmarklet();
  updateBookmarkletTitle.call($("#title")[0]);
  if (!$("#bookmarkified").val()) $("#save").attr("disabled", true);
});
