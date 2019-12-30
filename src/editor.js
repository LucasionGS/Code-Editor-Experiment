const fs = require("fs");
const {AutoComplete} = require("ion-ezautocomplete");

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

  var ac = new AutoComplete(activeEditor, [
    "c[]",
    "| MoveRel",
    "| Move",
    "| Zoom",
    "| PlayAudio",
    "| PlayMusic",
    "| Order",
    "| Jump",
    "| ChangeSrc",
  ]);
  // ac.onlyFullText = true;
  ac.caseSensitive = true;

  try {
    activeEditor.value = fs.readFileSync("./savefile.vnscript", "utf8");
    
    displayEditor.innerHTML = highlight(activeEditor.value);
  } catch {}

  activeEditor.focus();

  activeEditor.oninput = function(e){
    var text = this.value;

    displayEditor.innerHTML = highlight(text);
  }

  /**
   * @type {(this: HTMLTextAreaElement, e: KeyboardEvent)}
   */
  activeEditor.onkeydown = function(e) {
    if (e.key.toLowerCase() == "s") {
      fs.writeFile("./savefile.vnscript", activeEditor.value, () => {
        
      });
    }
    else if (e.key == "[") {
      e.preventDefault();
      var d = insertStringAt(activeEditor.value, activeEditor.selectionStart, "[§]");
      activeEditor.value = d.string;
      activeEditor.setSelectionRange(d.caretStart, d.caretEnd);
      
      var text = this.value;
      displayEditor.innerHTML = highlight(text);
    }
    else if (e.key == "(") {
      e.preventDefault();
      var d = insertStringAt(activeEditor.value, activeEditor.selectionStart, "(§)");
      activeEditor.value = d.string;
      activeEditor.setSelectionRange(d.caretStart, d.caretEnd);
      
      var text = this.value;
      displayEditor.innerHTML = highlight(text);
    }
    else if (e.key == ")" && activeEditor.value.charAt(activeEditor.selectionStart) == ")") {
      e.preventDefault();
      activeEditor.setSelectionRange(activeEditor.selectionStart+1, activeEditor.selectionStart+1);
    }
    else if (e.key == "\"" && activeEditor.value.charAt(activeEditor.selectionStart).match(/a-zA-Z/g)) {
      e.preventDefault();
      activeEditor.setSelectionRange(activeEditor.selectionStart+1, activeEditor.selectionStart+1);
    }
    else if (e.key == "\"" && activeEditor.value.charAt(activeEditor.selectionStart) != "\"") {
      e.preventDefault();
      var d = insertStringAt(activeEditor.value, activeEditor.selectionStart, "\"§string§\"");
      activeEditor.value = d.string;
      activeEditor.setSelectionRange(d.caretStart, d.caretEnd);
      
      var text = this.value;
      displayEditor.innerHTML = highlight(text);
    }
    else if (e.key == "\"" && activeEditor.value.charAt(activeEditor.selectionStart) == "\"") {
      e.preventDefault();
      activeEditor.setSelectionRange(activeEditor.selectionStart+1, activeEditor.selectionStart+1);
    }
    else if (e.key == "Tab") {
      e.preventDefault();
      var d = insertStringAt(activeEditor.value, activeEditor.selectionStart, "  §");
      activeEditor.value = d.string;
      activeEditor.setSelectionRange(d.caretEnd, d.caretEnd);
      displayEditor.innerHTML = highlight(this.value);
    }
    else if (e.key == "Enter") {
      e.preventDefault();
      var sentence = "";
      var spaces = "";
      var lineEnd = activeEditor.selectionStart-1;

      while(this.value[lineEnd] != "\n" && lineEnd >= 0) {
        sentence = this.value[lineEnd]+sentence;
        if (this.value[lineEnd] == " ") {
          spaces += " ";
        }
        else if (this.value[lineEnd] != "\n" && this.value[lineEnd] != " ") {
          spaces = "";
        }
        lineEnd--;
      }

      var d = insertStringAt(activeEditor.value, activeEditor.selectionStart, "\n"+spaces+"§");
      activeEditor.value = d.string;
      activeEditor.setSelectionRange(d.caretStart, d.caretEnd);
      displayEditor.innerHTML = highlight(this.value);
    }
    else if (e.key == "Backspace" && activeEditor.selectionStart == activeEditor.selectionEnd && activeEditor.value[activeEditor.selectionStart-1] == " " && activeEditor.value[activeEditor.selectionStart-2] == " ") {
      e.preventDefault()
      var codeText = this.value;
      var nss = activeEditor.selectionStart-2;
      this.value = codeText.substring(0, activeEditor.selectionStart-2) + codeText.substring(activeEditor.selectionStart);
      this.setSelectionRange(nss, nss);
      displayEditor.innerHTML = highlight(this.value);
    }
    else if (e.key = "Control" && !e.shiftKey && !e.altKey) {
      displayEditor.toggleAttribute("ctrl", true);
      e.preventDefault();
    }
  }

  /**
   * @type {(this: HTMLTextAreaElement, e: KeyboardEvent)}
   */
  window.onkeyup = function(e) {
    if (e.key == "Control") {
      displayEditor.toggleAttribute("ctrl", false);
    }
  }
}

/**
 * 
 * @param {string} text 
 */
function highlight(text, lang = "vns") {
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

  // Language
  if (lang == "js") { // JavaScript
    // Special word highlighting.
    // BASE
    createSpan(/(?<!\w)d(?!\w)/g, "base");
    
    // Comment
    createSpan(/\/\/.*/gm, "comment");
    
    // CLASS
    createSpan(/(?<!\w)console(?!\w)/g, "class");
    createSpan(/(?<!\w)Promise(?!\w)/g, "class");
    createSpan(/(?<!\w)JSON(?!\w)/g, "class");
    
    // FUNCTION
    createSpan(/\w+(?=\s*\([\w\W\n]*\))/g, "function");
    
    // VAR
    createSpan(/(?<=\.)\w+/g, "var");
    createSpan(/(?<=(?<!\w)char\s+)\w+/g, "var");
    createSpan(/(?<=\()[\w\W\n]+?(?=\))/g, "var");
    createSpan(/(?<!\w)dialog(?!\w)/g, "keyword");
    
    // SKEYWORD
    createSpan(/(?<!\w)function(?!\w)/g, "skeyword");
    createSpan(/(?<!\w)return(?!\w)/g, "skeyword");
  
    // KEYWORD
    createSpan(/(?<!\w)var(?!\w)/g, "keyword");
  
    // VALUE
    createSpan(/\d/g, "value");
  }
  else if (lang == "vns") { // VNScript Language
    // Special word highlighting.
    // BASE
    // createSpan(/(?<!\w)d(?!\w)/g, "base");
    
    // Comment
    createSpan(/\/\/.*/gm, "comment");
    
    // Character Definitions
    createSpan(/(?<=\[).*?(?=\])/g, "var", "String"); // [String]
    createSpan(/(?<=c\[.*?\]\s+[^\s\n"']+\s+)[^\s\n"']+/g, "var", "Root Source Path"); // Resource root
    createSpan(/(?<=c\[.*?\]\s+)[^\s\n"]+/g, "var", "Character Variable Name"); // script_name
    createSpan(/c(?=\[.*?\])/g, "function", "Character Definition"); // c[]
    
    // Dialog Definitions
    createSpan(/d(?=\d+)/g, "value"); // dxx[]
    
    // VALUE
    createSpan(/\d+\.\d+|\d+/g, "value");

    // CLASS
    // createSpan(/(?<!\w)console(?!\w)/g, "class");
    // createSpan(/(?<!\w)Promise(?!\w)/g, "class");
    // createSpan(/(?<!\w)JSON(?!\w)/g, "class");
    
    // FUNCTION
    // createSpan(/\w+(?=\s*\([\w\W\n]*\))/g, "function");
    
    // VAR
    createSpan(/(?<=\()[\w\W\n]+?(?=\))/g, "var");
    // createSpan(/(?<=\.)\w+/g, "var");
    // createSpan(/(?<=(?<!\w)char\s+)\w+/g, "var");
    // createSpan(/(?<!\w)dialog(?!\w)/g, "keyword");
    
    // SKEYWORD
    // createSpan(/(?<!\w)function(?!\w)/g, "skeyword");
    // createSpan(/(?<!\w)return(?!\w)/g, "skeyword");
    
    // KEYWORD
    // createSpan(/(?<!\w)char(?!\w)/g, "keyword");
    
    // ACTIONS
    createSpan(/(?<=\|\s*\w+\s+).*/gm, "var");

    createSpan(/(?<=\|\s*)MoveRel/g, "base");
    createSpan(/(?<=\|\s*)Move/g, "base");
    createSpan(/(?<=\|\s*)Zoom/g, "base");
    createSpan(/(?<=\|\s*)PlayAudio/g, "base");
    createSpan(/(?<=\|\s*)PlayMusic/g, "base");
    createSpan(/(?<=\|\s*)Order/g, "base");
    createSpan(/(?<=\|\s*)Jump/g, "base");
    createSpan(/(?<=\|\s*)ChangeSrc/g, "base");
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

/**
 * 
 * @param {string} string 
 * @param {number} index 
 * @param {string} stringToInsert 
 */
function insertStringAt(string, index, stringToInsert) {
  var str1 = string.substring(0, index);
  var str2 = string.substring(index);
  var caretIndex = stringToInsert.length;
  var caretEndIndex = stringToInsert.length;
  for (let i = 0; i < stringToInsert.length; i++) {
    const char = stringToInsert[i];
    if (char == "§") {
      if (caretIndex == stringToInsert.length) {
        caretIndex = str1.length+i;
        caretEndIndex = caretIndex;
        stringToInsert = stringToInsert.substring(0, i)+stringToInsert.substring(i+1);
      }
      else {
        caretEndIndex = str1.length+i;
        stringToInsert = stringToInsert.substring(0, i)+stringToInsert.substring(i+1);
        break;
      }
    }
  }
  return {
    caretStart: caretIndex,
    caretEnd: caretEndIndex,
    string: str1+stringToInsert+str2
  };
}