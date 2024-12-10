const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const path = require('path');
const bcryptjs = require('bcryptjs')

const { Server } = require('socket.io');
const ACTIONS = require('../frontend/src/Actions');
const { constrainedMemory } = require('process');

const server = http.createServer(app);
const io = new Server(server,{cors:{origin:'*'}});

// for deployment purposes
app.use(express.static('build'));
// app.use((req, res, next) => {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

// create a new object to mapping userName with their soket id
// For production we have to store this object in some database or any where
const userSocketMap ={};
// create a function to get all client which are connected to same roomId
function getAllConnectedClients(roomId)
{
     /*
        io.sockets.adapter.rooms.get(roomId) is used to get all connected clients
        in a same roomId and return a MAP, but we want Array. So we use Array.from
        After that we use map function and we get a socketId of all connected clients, then 
        we return an object with socketId and useName usinf userSoketMap object
    */
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[socketId],
        };
    });
}

// When socket is connected then this event will be fired
io.on('connection',(socket) => {
    console.log('Socket Connnected' , socket.id);

    // we have to listen here the which is emit from client side when server is Join
    socket.on(ACTIONS.JOIN,({ roomId, username}) =>{
        // here we have to map the user name with their socker id
        userSocketMap[socket.id] = username;
        // join the room with socket
        socket.join(roomId);

        /*
            Here there are two cases are possible
            i) Single user joined
            ii) Multiple user joined

            when single user joined, there is no problem
            but when there is multiple user joined then we have to notify the all other
            users which are already joined
            For that, we have to get all the users which are present in same room Id
        */
        const clients= getAllConnectedClients(roomId);

        // now we are notify the all other users that someone has joined with name
        console.log(clients);
        clients.forEach(({socketId}) => {
            io.to(socketId).emit(ACTIONS.JOINED,{
                clients,
                username,
                socketId: socket.id,
            });
        });
    });
    // Listen for the CODE CHANGE event
    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        // ye roomId and code client se mila ahi and we have to send that code to another client, so here we send that code from this server to the other client to yahan se jo code bheje hain usko client main receive karna hoga

        // here io.to means emit the event for all the clients within the rool but, I want to send the event to all clients except the client who code changed.
        // For that we have to write soket.in
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    // Listen for the SYNCH_CODE event
    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        // here we use io.to because we have to emit only that soketID
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    //listen here for disconnecting  Code for disconnecting from soket, pura disconnected hone se pehele ye event
    // call hota hai
    socket.on('disconnecting', () => {
        // soket.rooms return a map, so we have to convert into Array
        const rooms =[...socket.rooms];
        // notify the connected clients, that one user is disconnected with name
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED,{
                socketId :socket.id,
                username: userSocketMap[socket.id],
            });
        });
        // remove that user from userSoketMap
        delete userSocketMap[socket.id];
        // to leave any room in soket io
        socket.leave();
    })
});

app.use(express.json());
app.use(cors({origin:"http://localhost:3000", credentials: true})); //reactjs project will connect to express app on port 4000


mongoose.connect("mongodb+srv://tusharkumargupta8532:8532904320@cluster0.gstrkkx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0v")
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// API creation
app.get("/",(req,res) => {
    res.send("Express  App is running");
});

//schema creating API for users model
const Users = mongoose.model('User',{
    name:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        require:true,
        unique:true,
    },
    password:{
        type:String,
        require:true,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

//Creating Endpoints for registering the user
app.post('/signup', async (req,res)=>{
    const  {name,email,password} = req.body;

    try{
        if (!email || !password || !name) {
            return res.status(400).json({ message: "Please fill in all fields" });
          }

          const userAlreadyExists = await Users.findOne({ email }).exec();
          console.log("userAlreadyExists", userAlreadyExists);
      
          if (userAlreadyExists) {
            return res.status(400).json({ message: "User already exists" });
          }
          
          console.log(email, password, name);

          const hashedpassword = await bcryptjs.hash(password,10);
          const user = new Users({
            email,
            password: hashedpassword,
            name,
          });
        await user.save();

        //creating a token that is generate through the signup 
        const data = {user:{id:user.id}}
        //generating token through jwt.sign method
        const token =jwt.sign(data,'secret_ecom');
        res.status(201).json({success:true,token});
    }
    catch(err)
    {
        res.status(400).json({ success: false, message: err.message });
    } 
});

//creating Endpoint API to login the user
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Please fill in all fields" });
      }
  
      // Find user by email
      const user = await Users.findOne({ email }).exec();
      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }
  
      // Validate password
      const isPasswordValid = await bcryptjs.compare(password, user.password);
      if (isPasswordValid) {
        // Create a JWT token
        const data = { user: { id: user.id } };
        const token = jwt.sign(data, 'secret_ecom', { expiresIn: '1h' });
  
        // Respond with the token and user information (except password)
        return res.status(200).json({
          success: true,
          message: "Logged in successfully",
          token, // Include the token in the response
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          }
        });
      } else {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }
    } catch (err) {
      console.error("Error in login:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
  

app.post('/logout',async (req,res) =>{
    //  res.send("logout route");
    res.clearCookie('token');
    res.status(200).json({success: true, message: "Logged out successfully"});
  });
  

server.listen(port, () => console.log(`listening on port ${port}`));
