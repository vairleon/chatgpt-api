import * as net from "net"
const server = net.createServer(socket => {
    console.log('chatgpt socket connected')
    socket.on('close', () => console.log('chatgpt socket disconnected'))
    socket.on('error', err => console.error(err.message))
    socket.on('data', async prompt => {
        console.log(`receive: ${prompt}`)
        // res = await oraPromise(api.sendMessage(prompt), {
        //     text: prompt
        //   })
        // socket.write(res.text)
        console.log(`send: ${prompt}`)
    })
})
server.listen(8888)