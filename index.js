const net = require('net');
const fs = require('fs');


const PORT = 8124;


const server = net.createServer();

server.on('error', (err) => {
  console.error('SERVER ERROR:', err);
});

server.on('close', () => {
  console.log('Server closed');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

server.on('connection', (clientToProxySocket) => {
  console.log('Client connected to proxy');

  clientToProxySocket.once('data', (data) => {
    let isTLSConnection = data.toString().startsWith('CONNECT');
    let serverPort = isTLSConnection ? 443 : 80;
    let serverAddress;
    
    if (isTLSConnection) {
        serverAddress = data.toString()
        .split('CONNECT ')[1]
        .split(' ')[0].split(':')[0];
        console.log(` URL: ${serverAddress}`);
      ache(serverAddress, (err, isValuePresent) => {
        if (err) {
          console.error('Error reading file:', err);
          clientToProxySocket.end();
          return;
        }

        if (isValuePresent) {
          console.log(`Blocked URL: ${serverAddress}`);
          clientToProxySocket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
          return clientToProxySocket.end();
        } else {
        
          setupConnection();
        }
      });
    } else {
    
      serverAddress = data.toString()
        .split('Host: ')[1]?.split('\r\n')[0] || 'localhost';
      setupConnection();
    }

    function setupConnection() {
      const proxyToServerSocket = net.createConnection({ host: serverAddress, port: serverPort });

      proxyToServerSocket.on('connect', () => {
        console.log('Connected to target server');

        if (isTLSConnection) {
          clientToProxySocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        } else {
          proxyToServerSocket.write(data);
        }

        clientToProxySocket.pipe(proxyToServerSocket);
        proxyToServerSocket.pipe(clientToProxySocket);
      });

      proxyToServerSocket.on('error', (err) => {
        console.error('PROXY TO SERVER ERROR:', err);
        clientToProxySocket.end();
      });

      clientToProxySocket.on('error', (err) => {
        console.error('CLIENT TO PROXY ERROR:', err);
        proxyToServerSocket.end();
      });

      clientToProxySocket.on('end', () => {
        console.log('Client disconnected');
        proxyToServerSocket.end();
      });

      proxyToServerSocket.on('end', () => {
        console.log('Target server disconnected');
        clientToProxySocket.end();
      });
    }
  });
});

function ache(valueToCheck, callback) {
  fs.readFile('url.txt', 'utf8', (err, data) => {
    if (err) {
      return callback(err);
    }

    // Split the file content by lines and check for the value
    const values = data.split('\n').map(line => line.trim());
    const isValuePresent = values.includes(valueToCheck);
    
    callback(null, isValuePresent);
  });
}
