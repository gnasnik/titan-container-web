import { useEffect, useState } from 'react';
import { Terminal, ITerminalOptions, ITerminalInitOnlyOptions } from 'xterm';
// import { WebLinksAddon } from 'xterm-addon-web-links';
import { FitAddon } from 'xterm-addon-fit';
import "xterm/css/xterm.css"

const Term = ({websocketUrl, serviceName}) => {
    const options = { ...ITerminalOptions, ...ITerminalInitOnlyOptions };
    const term = new Terminal({  
            rendererType: 'canvas',  
            cursorBlink: true,  
            convertEol: true,  
            disableStdin: false,
            scrollback: 0,  
            rows: 60,
            cols: 100,
            options,
            theme: {    
                foreground: "#ECECEC", 
                background: "#000000", 
                cursor: "help",
                lineHeight: 20
            }
        });

    term.prompt = () => {
        term.write('\r\n\u001b[32m\u001b[37m');
    };

    const connectStr = `${websocketUrl}?cmd0=sh&pod=${serviceName}&tty=1&stdin=1`;
    const socket = new WebSocket(connectStr);
    
    let count = 0;
    useEffect(() => {
        const container = document.getElementById('terminal-container');
        term.open(container);
        term.write('\r\nWelcome to Titan Container web intepreter!');
        term.prompt();
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        fitAddon.fit(); 
    },[count])

    term.onResize( size => {
        console.log(size)
    })

    term.onKey((e) => {
        const printable =
        !e.domEvent.altKey &&
        !e.domEvent.altGraphKey &&
        !e.domEvent.ctrlKey &&
        !e.domEvent.metaKey

        // if (e.domEvent.code == 'ArrowUp' || e.domEvent.code == 'ArrowDown' || e.domEvent.code == 'ArrowLeft' || e.domEvent.code == 'ArrowRight') {
        //     printable = false
        // }
                
        if (printable) {
            if (e.domEvent.code != 'Backspace' && e.domEvent.code != 'Tab' ) {
                term.write(e.key);
            }   
            // term.write(e.key);
        }

        Send(e.key);

    });
    
    // ShellCodeStdout         = 100 0x64
    // ShellCodeStderr         = 101 0x65
    // ShellCodeResult         = 102 0x66
    // ShellCodeFailure        = 103 0x66
    // ShellCodeStdin          = 104 0x68
    // ShellCodeTerminalResize = 105 0x69
    // ShellCodeEOF            = 106 0x6a

    // const Resize = (e) => {
    //     SendResize(e.target.innerWidth, e.target.innerHeight);
    // }

    const SendResize = (width, height) => {
        var buffer = new ArrayBuffer(5);
        var view = new DataView(buffer);
        view.setUint8(0, 105);
        view.setUint16(1, width, false);
        view.setUint16(3, height, false);
        socket.send(buffer);
    }
    

    const Send = (message) => {
        const length = message.length;
        var buffer = new ArrayBuffer(length + 1);
        const bufView = new Int8Array(buffer);

        bufView[0] = 0x68;
        for (var i=0, strLen=message.length; i<strLen; i++) {
            bufView[i+1] = message.charCodeAt(i);
        }

        socket.send(buffer);
    };


    const operate = {      
        onError: function (error) {             
            term.write('Error: ' + error + '\r\n');      
        },      
        onConnect: function () {               
            // socket.send(JSON.stringify())      
            // socket.send('\r connected');
            // const container = document.getElementById('terminal-container').getBoundingClientRect()
    
            // SendResize(container.width, container.height);
        },      
        onClose: function () {           
            term.write("\rconnection closed"); 
            // socket.close();
        },      
        onData: function (data) {   
            term.write(data);    
            term.focus();      
        }    
    }

    if (window.WebSocket) {      
        console.log("good!!!")    
    } else {        
        operate.onError('WebSocket Not Supported');      
        return;    
    }    

    window.addEventListener('resize', () => {
        const container = document.getElementById('terminal-container');
        const width = container.parentElement.clientWidth;
        const height = container.parentElement.clientHeight;
        SendResize(width, height);
    } );
        
    socket.onopen = function () {      
        operate.onConnect();
    };    
        
    socket.onmessage = function (evt) { 
        const reader = new FileReader();
        reader.onload = () => {
            const buffer = reader.result;
            const bytes = new Uint8Array(buffer);
            const msgId = bytes.slice(0,1).toString();
            const decoder = new TextDecoder("utf-8");
            const msg = decoder.decode(bytes.slice(1));
            console.log(msgId, msg)
            // stdout
            if (msgId == 100 && msg.length > 1) {
                operate.onData(msg);   
            }else if (msgId == 102) {
                term.prompt();
                const result = JSON.parse(msg);
                if (result) {
                    const errMsg = result.message ? result.message : 'code ' + result.exit_code;
                    operate.onData('process exited: ' + errMsg);
                }
            }else if (msgId == 105) {
                console.log("resiz",msg);
            }
            
        }
        reader.readAsArrayBuffer(evt.data);
    };    
        
    socket.onclose = function (evt) {
        operate.onClose();
    };  

    return <div style={{ width: '90%', height: '100%', background: '#000', overflow: 'scroll'}}>
        <div id='terminal-container'></div>
    </div>
}

export default Term;