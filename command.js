const express = require('express');
const child_process = require('child_process');
const app = express();

app.use(express.json()); // for parsing application/json

app.post('/exec', (req, res) => {
    const { command } = req.body;

    // 在服务器上执行命令
    const child = child_process.exec(command, { stdio: 'pipe' });

    // 将命令的输出流到浏览器
    child.stdout.pipe(res);
    child.stderr.pipe(res);

    child.on('close', (code) => {
        res.status(code).end(); // 返回命令的退出码给浏览器
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});