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
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
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
