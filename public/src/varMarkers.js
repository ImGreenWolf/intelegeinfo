class GhostTextManager {
    constructor(editor) {
      this.editor = editor;
      this.session = editor.getSession();
      this.renderer = editor.renderer;
      this.tokenizer = this.session.getMode().getTokenizer();
      this.markers = [];
    }
  
    add(word, ghostText) {
      this.clear();
  
      const Range = ace.require("ace/range").Range;
  
      for (let row = 0; row < this.session.getLength(); row++) {
        const line = this.session.getLine(row);
       

        const tokenizer = this.session.getMode().getTokenizer();

        // Try using "start" as the initial state:
        const tokenData = tokenizer.getLineTokens(line, "start");
        console.log("Tokens:", tokenData.tokens);
        let col = 0;
        tokenData.tokens.forEach(token => {
            if(token.type=="identifier")
            {
                
            const vari = variables.find((vari) => vari.varname===token.value);
                if(vari!=null)
                {

                    const marker = {
                        range: new Range(row, 30 + word.length, row, 30 + word.length),
                        class: "ghost-text",
                        type: "text",
                        renderer: {
                          update: (html, markerLayer, session, config) => {
                            const screenPos = session.documentToScreenPosition(row, col + word.length);
                            const top = markerLayer.$getTop(screenPos.row, config);
                            const left = markerLayer.$padding + screenPos.column * config.characterWidth;
            
                            html.push(
                              `<div class='ghost-text' style='
                                position:absolute;
                                top:${top}px;
                                left:${left}px;
                                color:#888;
                                opacity:0.5;
                                font-style:italic;
                                pointer-events:none;
                              '>${ghostText}</div>`
                            );
                          }
                        }
                      };

                      if(vari.type!="array")this.renderer.addToken(vari.value, "text", row, 0 + word.length)
                      const markerId = this.session.addMarker(marker.range, marker.class, marker.type, true);
                      marker._id = markerId;
                      console.log(marker)
                      this.session.addDynamicMarker(marker, true);
                    this.markers.push(marker);

                }
                //col += token.value.length;
                
            }
        });



           
  
            
        //   }
  
        //   col += token.value.length;
        // });
      }
    }
  
    clear() {
      this.markers.forEach(marker => {
        this.session.removeMarker(marker._id);
       
      });
      this.markers = [];
    }
  }