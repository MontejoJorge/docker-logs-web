const express = require("express");
const { createServer } = require('node:http');
const { Server } = require("socket.io");
const { spawn } = require('node:child_process');

const app = express();
const server = createServer(app);

app.get("/", async(req, res) => {
   res.setHeader("Content-Type", "text/html; charset=utf-8");

   res.end(`
   <!DOCTYPE html>
      <html>
      <head>
         <title>Container Logs</title>
      </head>
      <body>
         <h1>Container Logs</h1>
         <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
         <script>
            const socket = io();
            socket.on('logs', (data) => {
               console.log(data);
               const logLine = document.createElement("p");
               logLine.innerText = data;
               document.getElementById("logs").appendChild(logLine);
            });
         </script>
         <button onClick="socket.emit('viewLogs')";>Logs</button>
         <button onClick="socket.emit('stopLogs')";>STOP</button>
         <div id="logs"></div>
      </body>
   </html>
 `);
});

const io = new Server(server);

io.on('connection', (socket) => {
   console.log('a user connected');

   socket.on('disconnect', () => {
      console.log('user disconnected');
   });

   socket.on('viewLogs', () => {
      console.log('logs');
      const ls = spawn('bash', ['-c', 'docker logs test -n 1 -f']);

      ls.on('error', (err) => {
         console.error( err);
      });

      ls.stdout.on('data', (data) => {
         console.log(data.toString().trim())
         socket.emit('logs', data.toString().trim())
      });

      const stop = () => {
         console.log('stop');
         ls.kill();
      }

      socket.on('stopLogs', stop);
      socket.on('disconnect', stop);

   });

});

server.listen(3000, () => {
   console.log('server running at http://localhost:3000');
});