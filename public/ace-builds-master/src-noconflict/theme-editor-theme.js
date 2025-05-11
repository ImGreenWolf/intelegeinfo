

ace.define("ace/theme/editor-theme",["require","exports","module","ace/theme/editor-theme","ace/lib/dom"], function(require, exports, module){exports.isDark = true;
exports.cssClass = "editor-theme";
exports.cssText = `
.editor-theme .ace_gutter {
    background: #232323;
    color: #E2E2E2
  }
  
  .editor-theme .ace_print-margin {
    width: 1px;
    background: #232323
  }
  
  .editor-theme {
    background-color: #141414;
    color: #F8F8F8
  }
  
  .editor-theme .ace_cursor {
    color: #A7A7A7
  }
  
  .editor-theme .ace_marker-layer .ace_selection {
    background: rgba(221, 240, 255, 0.20)
  }
  
  .editor-theme.ace_multiselect .ace_selection.ace_start {
    box-shadow: 0 0 3px 0px #141414;
  }
  
  .editor-theme .ace_marker-layer .ace_step {
    background: rgb(102, 82, 0)
  }
  
  .editor-theme .ace_marker-layer .ace_bracket {
    margin: -1px 0 0 -1px;
    border: 1px solid rgba(255, 255, 255, 0.25)
  }
  
  .editor-theme .ace_marker-layer .ace_active-line {
    background: rgba(255, 255, 255, 0.031)
  }
  
  .editor-theme .ace_gutter-active-line {
    background-color: rgba(255, 255, 255, 0.031)
  }
  
  .editor-theme .ace_marker-layer .ace_selected-word {
    border: 1px solid rgba(221, 240, 255, 0.20)
  }
  
  .editor-theme .ace_invisible {
    color: rgba(255, 255, 255, 0.25)
  }
  
  .editor-theme .ace_keyword,
  .editor-theme .ace_meta {
    color: #CDA869
  }
  
  .editor-theme .ace_constant,
  .editor-theme .ace_constant.ace_character,
  .editor-theme .ace_constant.ace_character.ace_escape,
  .editor-theme .ace_constant.ace_other,
  .editor-theme .ace_heading,
  .editor-theme .ace_markup.ace_heading,
  .editor-theme .ace_support.ace_constant {
    color: #CF6A4C
  }
  
  .editor-theme .ace_invalid.ace_illegal {
    color: #F8F8F8;
    background-color: rgba(86, 45, 86, 0.75)
  }
  
  .editor-theme .ace_invalid.ace_deprecated {
    text-decoration: underline;
    font-style: italic;
    color: #D2A8A1
  }
  
  .editor-theme .ace_support {
    color: #9B859D
  }
  
  .editor-theme .ace_fold {
    background-color: #AC885B;
    border-color: #F8F8F8
  }
  
  .editor-theme .ace_support.ace_function {
    color: #DAD085
  }
  
  .editor-theme .ace_list,
  .editor-theme .ace_markup.ace_list,
  .editor-theme .ace_storage {
    color: #F9EE98
  }
  
  .editor-theme .ace_entity.ace_name.ace_function,
  .editor-theme .ace_meta.ace_tag {
    color: #AC885B
  }
  
  .editor-theme .ace_string {
    color: #8F9D6A
  }
  
  .editor-theme .ace_string.ace_regexp {
    color: #E9C062
  }
  
  .editor-theme .ace_comment {
    font-style: italic;
    color: #5F5A60
  }
  
  .editor-theme .ace_variable {
    color: #7587A6
  }
  
  .editor-theme .ace_xml-pe {
    color: #494949
  }
  
  .editor-theme .ace_indent-guide {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWMQERFpYLC1tf0PAAgOAnPnhxyiAAAAAElFTkSuQmCC) right repeat-y
  }
  
  .editor-theme .ace_indent-guide-active {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWMQERFpYLC1tf0PAAgOAnPnhxyiAAAAAElFTkSuQmCC) right repeat-y;
  }
  
`
var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass, false);

});                (function() {
                    ace.require(["ace/theme/editor-theme"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            