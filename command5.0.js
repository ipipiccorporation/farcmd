const http = require('http');

const {exec} = require('child_process');
var child_process = require('child_process');
var iconv = require('iconv-lite');
var encoding = 'cp936';
var binaryEncoding = 'binary';
child_process.exec('ipconfig', { encoding: binaryEncoding }, function(err, stdout, stderr){
    console.log(iconv.decode(new Buffer(stdout, binaryEncoding), encoding), iconv.decode(new Buffer(stderr, binaryEncoding), encoding));
});
const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            exec(body, (error, stdout, stderr) => {
                if (error) {
                    res.writeHead(500);
                    res.end(error.message);
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(stdout);
                const output = document.createElement('pre');
                output.textContent = stdout;
                document.body.appendChild(output);
            });
        });
    } else {
        const auth = req.headers['authorization'];
        if (!auth || auth.indexOf('Basic ') !== 0) {
            res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Command Runner"' });
            res.end();
            return;
        }
        const credentials = Buffer.from(auth.slice(6), 'base64').toString().split(':');
        const username = credentials[0];
        const password = credentials[1];
        if (username !== 'admin' || password !== 'password') {
            res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Command Runner"' });
            res.end();
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html>
<html lang="cn">
<head>
    <meta charset="cp936">
    <title>命令提示符</title>
</head>
     <style>
        body{
            background-color: #ffffff;

        }


        input{
            background: transparent;
            color: #000000;
            padding: 1% 2%;
            outline: none;
            border-radius: 8px;
            margin-right:1%;
        }
        
        form{
            margin-top: 2%;
            border: 2px solid #000000;
            background: transparent;
            text-transform: uppercase;
            color: #000000;
            padding: 1% 2%;
            outline: none;
            border-radius: 8px;
            margin-right:1%;
        }
        label{
            margin-top: 2%;
            border: 2px solid #000000;
            background: transparent;
            color: #000000;
            padding: 1% 2%;
            outline: none;
            border-radius: 8px;
            margin-right:1%;
        }
        textarea{
            margin-top: 2%;
            border: 2px solid #000000;
            background: transparent;
            text-transform: uppercase;
            color: #000000;
            padding: 1% 2%;
            outline: none;
            border-radius: 8px;
            margin-left:30%;
            width: 40%;
            height: 200px; 
        }
    </style>
        <body>
        <form method="post">
        <label for="command" >命令:</label><br>
        <textarea id="command" name="command" rows="4" cols="50"></textarea><br>
        <input type="submit" value="Submit">
        <div>
        <input type="button" value="Clear" onclick="document.querySelector('#command').value=''">
        </div>
      </form>
        </body>>
      <script>
        alert('Server started!');
        const form = document.querySelector('form');
        form.addEventListener('submit', event => {
          event.preventDefault();
          const command = document.querySelector('#command').value;
          fetch(form.action, {
            method: 'POST',
            body: command,          
          })
            .then(response => response.text())
            .then(text => {
              const output = document.createElement('pre');
              output.textContent = text;
              document.body.appendChild(output);
            })
            .catch(error => {
              alert(error.message);
            });
        });
        
      </script>
    `);
    }
});

server.listen(3000, () => {
    console.log('服务器运行在端口3000');
});