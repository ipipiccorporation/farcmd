const http = require('http');
const { exec } = require('child_process');

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
        res.end(`
       <script>
      document.write('<link rel="stylesheet" href="main.css">');
      </script>
      <form method="post">
        <label for="command">Command:</label><br>
        <textarea id="command" name="command" rows="4" cols="50"></textarea><br>
        <input type="submit" value="Submit">
      </form>
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
    console.log('Server started!');
});
