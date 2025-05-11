# TCP Proxy Server with URL Blocking

This project implements a basic TCP proxy server that listens for incoming HTTP and HTTPS client requests, forwards them to the target server, and checks for specific blocked URLs. If the target URL is found in a block list (`url.txt`), the connection is blocked with an HTTP 403 Forbidden response.

## Features

- **TCP Proxy**: Listens for incoming client connections and forwards the requests to the target server (both HTTP and HTTPS).
- **URL Blocking**: Reads a block list from `url.txt` and denies connections to any URLs found in the list.
- **Support for HTTP & HTTPS**: Handles both regular HTTP requests and secure HTTPS connections (via `CONNECT` method).
- **Connection Management**: Efficiently forwards data between the client and the target server while handling errors.



## How It Works

- The proxy server listens on port `8124` by default.
- When a client sends a request, the server checks if the request is for HTTPS (via the `CONNECT` method).
- If the URL is found in the `url.txt` block list, the proxy sends an HTTP 403 Forbidden response and terminates the connection.
- If the URL is not blocked, the server forwards the request to the target server, and the response is sent back to the client.

## Error Handling

The server will log errors for both client-server and proxy-server connections, ensuring proper termination of connections when needed.
