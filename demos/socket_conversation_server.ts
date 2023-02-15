import dotenv from 'dotenv-safe'
import { oraPromise } from 'ora'

import { ChatGPTAPI, type ChatMessage } from '../src'
import * as net from "net"
import * as readline from "readline"  

dotenv.config()

const PORT = 8888
const HOST = "127.0.0.1"

/**
 * Demo CLI for testing conversation support.
 *
 * ```
 * npx tsx demos/demo-conversation.ts
 * ```
 */
async function main() {
    const api = new ChatGPTAPI({
        apiKey: process.env.OPENAI_API_KEY,
        debug: false
    })
    
    let res: ChatMessage
    
    readline.emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)

    var session_start = 0
    {
        // const server = 
        const server = net.createServer(socket => {
            console.log('someone connected')
            // socket.on("connect", () => {
            //         console.log('socket connected')
            //         socket.write('chatgpt socket connected')
            //     }
            // )
            socket.on('close', () => {
                    // reset session
                    session_start = 0
                    console.log('chatgpt socket disconnected') }
                )
            socket.on('error', err => {
                    console.error(err.message)
                    socket.end()
                }
            )
            socket.on('data', async prompt => {
                console.log(`receive: ${prompt}`)
                if (session_start == 0){
                    session_start = 1
                    res = await oraPromise(api.sendMessage(prompt.toString()),{
                        text: prompt.toString()
                    })
                }
                else{
                    res = await oraPromise(api.sendMessage(prompt.toString(), {
                        conversationId: res.conversationId,
                        parentMessageId: res.id
                      }))
                }
                socket.write(res.text)
                console.log(`send: ` + res.text)

                // if (prompt.toString() == "kill server"){
                //     socket.end()
                // }
            })
        })
        server.listen(PORT, HOST)
        console.log("listening on " + HOST + ":" + PORT)

        process.stdin.on('keypress', (str, key) =>{
            if (key.ctrl==true && key.name == 'd'){
                console.log('stop server!')
                server.removeAllListeners()
                server.close()
                process.exit(0)
            } 
        })
    }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
