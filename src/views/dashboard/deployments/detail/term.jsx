import { useEffect, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';


const Term = ({websocket}) => {
    let term = new Terminal();
   

    useEffect(() => {
        term = new Terminal({  
            rendererType: 'canvas',  
            cursorBlink: true,  
            convertEol: true,  
            scrollback: 800,  
            row: 70,  
            theme: {    
            foreground: 'white',    
            background: '#181E29'  
        }})
        
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        fitAddon.fit();    
        
        // Open the terminal in #terminal-container
        term.open(document.getElementById('terminal-container'));
        term.writeln('Connecting...');
    },[])

   
    let socket = new WebSocket(websocket+'?cmd0=sh&podIndex=0&tty=1&stdin=1');//地址

    //输入内容 将内容传给服务器
    term.onKey(e => {      
        term.write(e.key);      
        console.log(e.key)      
        let message = new Blob([0])
        // socket.send(JSON.stringify({ "operate": "command", "command": e.key, module: "webssh" }));    
    })

    const operate = {      
        onError: function (error) {             
            term.write('Error: ' + error + '\r\n');      
        },      
        onConnect: function () {               
            // socket.send(JSON.stringify())      
            socket.send('\r connected');
        },      
        onClose: function () {           
            term.write("\rconnection closed");      
        },      
        onData: function (data) {           
            term.write(data);        
            term.focus();      
        }    
    }

    if (window.WebSocket) {      
        //如果支持websocket      
        // this._connection = new WebSocket(websocket);      
        console.log("good!!!")    
    } else {      //否则报错      
        operate.onError('WebSocket Not Supported');      
        return;    
    }    
        
    //连接成功    
    socket.onopen = function () {      
        operate.onConnect()    
    };    
        
    socket.onmessage = function (evt) {      
        const message = async () => {
            const msgId = await evt.data.slice(0,1).text();
            const msg = await evt.data.slice(1).text();    
            operate.onData(msg);   
        }

        message()
    };    
        
    socket.onclose = function (evt) {
        operate.onClose();    
    };  
    // }


    return <div style={{ width: '100%', height: '100%', background: '#000' }}>
        <div id='terminal-container'></div>
    </div>
}

export default Term;