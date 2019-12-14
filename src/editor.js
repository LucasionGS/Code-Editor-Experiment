/**
 * @type {HTMLTextAreaElement}
 */
let activeEditor;
/**
 * @type {HTMLDivElement}
 */
let displayEditor;
window.onload = function() {
  activeEditor = document.getElementById("activeEditor");
  displayEditor = document.getElementById("displayEditor");

  activeEditor.oninput = function(e){
    var text = this.value;

    displayEditor.innerHTML = highlight(text);
  }
}

/**
 * 
 * @param {string} text 
 */
function highlight(text) {
  /**
   * @type {string[]}
   */
  const state = [];
  function topState()
  {
    if (state.length == 0) {return "";}
    return state[state.length-1];
  }
  function delTopState()
  {
    if (state.length == 0) {return;}
    delete state[state.length-1];
  }

  var newText = "";
  var word = "";
  // Parsing the text from start to finish
  for (let i = 0; i < text.length; i++) {
    var s = text[i];
    var shouldSkip = false;
    function skip()
    {
      shouldSkip = true;
    }

    // Check start indicators
    if (s == "\"" && topState() != "\"") {
      state.push("\"");
      newText += `<span class="skeyword">`;
      skip();
    }
    else {
      if (s == " ") {
        skip();
      }
    }
    
    newText += s;
    if (shouldSkip) {
      continue;
    }
    
    // Check end indicators
    if (s == "\"" && topState() == "\"" && text[i-1] != "\\") {
      delTopState();
      newText += `</span>`;
    }

    console.log(state);
    
  }


  if (text == "function") {
    text = `<span class="skeyword">${text}</span>`;
  }
  return newText;
}

/**
 * Wait a ``number`` of seconds.
 * @param {number} seconds Time to wait.
 */
async function wait(seconds = 1) {
  setTimeout(() => {
    return;
  }, seconds * 1000);
}