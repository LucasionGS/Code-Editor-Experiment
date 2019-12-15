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

  /**
   * @param {string} text
   * @param {RegExp} regExp
   * @param {string} classes
   */
  function createSpan(regExp, classes, title = false) {
    var titleText = "";
    if (title != false && typeof title == "string") {
      titleText = `title="${title}"`;
    }
    newText = newText.replace(regExp, `<span class="${classes.toUpperCase()}"${titleText}>$&</span>`);
    return newText;
  }
  // Parsing the text from start to finish
  for (let i = 0; i < text.length; i++) {
    var s = text[i];
    var shouldSkip = false;
    function skip()
    {
      shouldSkip = true;
    }

    // Check start indicators
    if (s == "\"" && topState() != "\"" && topState() != "'") {
      state.push("\"");
      newText += `<span class="VALUE">`;
      skip();
    }
    else if (s == "'" && topState() != "\"" && topState() != "'") {
      state.push("'");
      newText += `<span class="VALUE">`;
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
    else if (s == "'" && topState() == "\'" && text[i-1] != "\\") {
      delTopState();
      newText += `</span>`;
    }
    
  }
  // Special word highlighting.
  // BASE
  createSpan(/(?<!\w)this(?!\w)/g, "base");
  
  // CLASS
  createSpan(/(?<!\w)console(?!\w)/g, "class");
  createSpan(/(?<!\w)Promise(?!\w)/g, "class");
  createSpan(/(?<!\w)JSON(?!\w)/g, "class");
  
  // FUNCTION
  createSpan(/\w+(?=\s*\([\w\W\n]*\))/g, "function");
  
  // VAR
  createSpan(/(?<=\.)\w+/g, "var");
  createSpan(/(?<=(?<!\w)var\s+)\w+/g, "var");
  createSpan(/(?<=\()[\w\W\n]+(?=\))/g, "var");
  
  // SKEYWORD
  createSpan(/(?<!\w)function(?!\w)/g, "skeyword");
  createSpan(/(?<!\w)return(?!\w)/g, "skeyword");

  // KEYWORD
  createSpan(/(?<!\w)var(?!\w)/g, "keyword");

  // VALUE
  createSpan(/\d/g, "value");


  // console.log(newText);
  
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

this.variable = function gay() {
  var json = JSON.parse('{"variable": "gay"}');
  console.log(json);
  return 1024;
}