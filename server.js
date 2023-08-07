const express=require("express")
const app = express();
const cors=require("cors")

app.use(cors({
    origin:"http://localhost:3000"
}))

const http=require("http")
const server=http.createServer(app)

const {Server}=require("socket.io");
const { Socket } = require("socket.io-client");
const io=new Server(server,{
    cors: {
        origin: "http://localhost:3000",
        credentials: true
      }  
})

const userSocketMap = {};
function getAllConnectedClients(roomId) {
    //ye code kya krega ki apke jitne vi room he 
    //apke adapter ke andar --pure socket server ke andar
    //usme mese jiski room id ye heusko get krega
    //ab iska type map hota he
    // /io.sockets.adapter.rooms.get(roomId) ye hume map return krega so we are using from method tats why

    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}



io.on("connection",(socket)=>{
    console.log('sokcet connected')
socket.on("join",({roomId,username})=>{
    userSocketMap[socket.id] = username;
    socket.join(roomId)
    const clients = getAllConnectedClients(roomId);
    console.log(clients)

clients.forEach(({socketId})=>{
    io.to(socketId).emit("joined",{
        clients,
        username,
        socketId:socket.id //jo user join krna chaha raha he --uski current sokcet ki id
    })

})
})

socket.on("code-change", ({ roomId, code }) => {

    //isme io.to)() isliye nai kia because ye usko vi vej de raha he jsine ye type kia he
    //isse ye ho raha he ki
    //so server se woh same text phir usko aa jayenga 
    //and woh earlier  text override ho ke cursor fir starting me aa jayenga
    socket.in(roomId).emit("code-change", { code });
});


socket.on('sync-code', ({ socketId, code }) => {
    io.to(socketId).emit("code-change", { code });
});


//hume disconnecting krna he because agar hum disconnect krnege --to hume avialabe room nai mileneg



socket.on('disconnecting',()=>{
const rooms=[...socket.rooms]
rooms.forEach((roomId)=>{
    socket.in(roomId).emit("disconnected",{
        socketId:socket.id,
        username:userSocketMap[socket.id]
    })
})

delete userSocketMap[socket.id]
socket.leave()

})

})


server.listen(5000,()=>{
    console.log("listening on port 5000")
})



