import React, { useEffect, useRef, useState } from 'react'
import Client from '../component/Client'
import Editor from '../component/Editor'
import { initSocket } from '../socket'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import  toast  from 'react-hot-toast'

const EditorPage = () => {

    //socket instance change hone se humara component re-render na ho isliye humne isse
    //useRef ki help se banaya he 
    
const socketRef=useRef(null)
const reactNavigator = useNavigate();

const location=useLocation()

const { roomId } = useParams();
 const codeRef=useRef(null)
  
useEffect(()=>{


    const init=async()=>{
        socketRef.current=await initSocket()
        socketRef.current.on('connect_error', (err) => handleErrors(err));
        socketRef.current.on('connect_failed', (err) => handleErrors(err));
        function handleErrors(e) {
            console.log('socket error', e);
            toast.error('Socket connection failed, try again later.');
            reactNavigator('/');
        }
        socketRef.current.emit("join",{
            roomId,
            username:location.state?.username
        })
        socketRef.current.on(
            "joined",
            ({ clients, username, socketId }) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} joined the room.`);
                    console.log(`${username} joined`);
                }
                setClients(clients);
                //JAISE NEW CLIENT JOINED HO JA RAHA HE 
                //HUME AB CODE SYNC KRNA HE ..DONO ME SO HERE I WILL EMIT EVENT
                socketRef.current.emit("sync-code", {code:codeRef.current,socketId}

                   
                );
            }
        );

        socketRef.current.on("disconnected",({socketId,username})=>{
             toast.success(`${username} left the room.`);
             setClients((prev) => {
                return prev.filter(
                    (client) => client.socketId !== socketId
                );
            });
        })
    }
    init()


//hume clear krna bht jaruri he because memory leak hone ka chance he and unexpected behavior hoga

    return () => {
        socketRef.current.disconnect();
        socketRef.current.off("joined");
        socketRef.current.off("disconnect");
    };
},[])


    const [clients,setClients]=useState([])

const copyRoomId=async(e)=>{

try{

    await navigator.clipboard.writeText(roomId)
    toast.success(`room ID has been copied to your clipboard`)
}
catch(err){
toast.error(`could not copy room ID`)
}

}

const leaveRoom=(e)=>{
    reactNavigator('/');

}

if (!location.state) {
    return <Navigate to="/" />;
}
  return (
    <div className="mainWrap">
    <div className="aside">
        <div className="asideInner">
            <div className="logo">
                <img
                    className="logoImage"
                    src="/code-sync.png"
                    alt="logo"
                />
            </div>
            <h3>Connected</h3>
            <div className="clientsList">
                {clients.map((client) => (
                    <Client
                        key={client.socketId}
                        username={client.username}
                    />
                ))}
            </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>
            Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
            Leave
        </button>
    </div>
    <div className="editorWrap">
        <Editor
             socketRef={socketRef}
             roomId={roomId}
             onCodeChange={(code)=>{codeRef.current=code}}
            
        />
    </div>
</div>
  )
}

export default EditorPage