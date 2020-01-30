const xterm = require("xterm");

var cmd = new xterm.Terminal();

cmd.open(document.getElementById("terminal"));
cmd.write("hello!");

cmd.textarea.disabled = false;