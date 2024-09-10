

import express from 'express'
import http from 'http';
import { Server } from 'socket.io'
import mediasoup from 'mediasoup'
import path from 'path'

import mongoose from 'mongoose';

import authenticateToken from './middleware/authMiddleware.js';
import checkLinkActivation from './middleware/checkLinkActivation.js'; 
import checkCourseAccess from './middleware/checkCourseAccess.js';

import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';  
import mentorRoutes from './routes/mentor.js'; 
import menteeRoutes from './routes/mentee.js'; 
import connectDB from './config/db.js';

import Blog from './models/Blog.js';

import Mentor from './models/Mentor.js'; 
import Mentee from './models/Mentee.js'
import Course from './models/Course.js';
import CourseAccess from './models/Access.js';

import dotenv from 'dotenv';

dotenv.config();
connectDB();

const app = express()
const port = 3000;  

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

const __dirname = path.resolve()
app.use(express.static(path.join(__dirname))); 

//<-------------------------------show courses---------------------------------->

app.get('/courses', async (req, res) => {
  console.log("request reached");
  try {
      const courses = await Course.find().exec();
      console.log(courses);
      res.json(courses);
  } catch (err) {
      res.status(500).json({ message: 'Error fetching courses', error: err });
  }
});



app.get('/3courses', authenticateToken, async (req, res) => {
  try {
      const courses = await Course.find().limit(3).exec();
      res.json(courses);
  } catch (err) {
      res.status(500).json({ message: 'Error fetching courses', error: err });
  }
});

app.get('/course/:menteeId/:courseId',authenticateToken, checkCourseAccess,  async (req, res) => {
  try {
    const { courseId } = req.params;
    const { hasAccess } = req;

    // Fetch the course details
    const course = await Course.findById(courseId).exec();
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }


    const response = {
      title: course.title,
      description: course.description,
      amount: course.amount,
      avatar: course.avatar,
      category: course.category,
      createdAt: course.createdAt,
    };

    if (hasAccess) {
      response.lectures = course.lectures;
    } else {
      response.lectures = course.lectures.map(lecture => ({
        thumbnail: lecture.thumbnail,
      }));
    }

    res.json({ course: response });
    console.log(response);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching course details', error: err });
  }
});

app.get('/courses/:menteeId/:courseId',authenticateToken,(req,res)=>{
  res.sendFile(path.join(__dirname,'courseDetails.html'));
})



app.get('/courses/:category', authenticateToken, async (req, res) => {
  const {  category } = req.params;

  try {
      
      const courses = await Course.find({ category: category }).exec();

      res.json(courses);
  } catch (err) {
      // Handle errors
      res.status(500).json({ message: 'Error fetching courses', error: err });
  }
});

app.get('/access-course/:menteeId', async (req, res) => {
  const menteeId = req.params.menteeId;

  try {
      // Find course IDs for the given mentee
      // const accessEntries = await CourseAccess.find({ menteeId: mongoose.Types.ObjectId(menteeId) });
      const accessEntries = await CourseAccess.find({ menteeId:new mongoose.Types.ObjectId(menteeId) });
      const courseIds = accessEntries.map(entry => entry.courseId);

      // Fetch course details
      const courses = await Course.find({ _id: { $in: courseIds } });

      // Return courses
      res.json(courses);
  } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
  }
});

//<-----------------------------------upload course----------------------------------------->
import { upload } from './middleware/uploadMiddleware.js';
import { uploadCourse,uploadPhoto } from './controllers/uploadController.js';

app.post('/upload', upload.array('courseFiles'), uploadCourse);
 
app.post('/uploadi', upload.fields([
  { name: 'lecture0_thumbnail', maxCount: 1 },
  { name: 'lecture0_video', maxCount: 1 },
  { name: 'lecture1_thumbnail', maxCount: 1 },
  { name: 'lecture1_video', maxCount: 1 },
]), uploadCourse);
//<------------------------------------------------------------------------------------------------->
app.get('/blogs', async (req, res) => {
  try {
      const blogs = await Blog.find();
      res.json(blogs);
  } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'landing1.html'));
})

// app.get('/courses/:id',authenticateToken, (req,res)=>{
//   res.sendFile(path.join(__dirname,'courses-all.html'));
// })

app.get('/coursess/:menteeId',authenticateToken, (req,res)=>{
  res.sendFile(path.join(__dirname,'courses-all.html'));
})
app.get('/language/:menteeId',authenticateToken,(req,res)=>{
  res.sendFile(path.join(__dirname,'language.html'));
})

app.get('/blogi/:menteeId',authenticateToken,(req,res)=>{
  res.sendFile(path.join(__dirname,'blog-mentee.html'));
})

app.get('/photography/:menteeId',authenticateToken,(req,res)=>{
  res.sendFile(path.join(__dirname,'photography.html'));
})
app.get('/photo/:menteeId',authenticateToken,(req,res)=>{
  res.sendFile(path.join(__dirname,'photography.html'));
})

app.get('/your-courses/:menteeId',authenticateToken, (req,res)=>{
  res.sendFile(path.join(__dirname,'your-courses.html'));
})

app.get('/mock-interviews/:menteeId',authenticateToken, (req,res)=>{
  res.sendFile(path.join(__dirname,'mock-interviews.html'));
})



app.get('/page', authenticateToken,(req,res)=>{
  res.sendFile(path.join(__dirname,'page.html'));
})
app.get('/mentor/details/:id',authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname,  'mentor-details.html'));
});

app.get('/mentor/courses/:id', authenticateToken,(req,res)=>{
  res.sendFile(path.join(__dirname,  'mentor-courses.html'));
})

app.get('/mentor/create-course/:id/:id1', authenticateToken,(req,res)=>{
  res.sendFile(path.join(__dirname,  'create-course.html'));
})

app.use('/auth', authRoutes);
app.use('/mentor', mentorRoutes);
app.use('/mentee', menteeRoutes);

app.get('/auth/mentee/signup', (req, res) => {
  res.sendFile(path.join(__dirname,'mentee-signup.html'));
});

app.get('/auth/mentee/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'mentee-login.html'));
});

app.get('/auth/mentor/signup', (req, res) => {
  res.sendFile(path.join(__dirname,'mentor-signup.html'));
});

app.get('/auth/mentor/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'mentor-login.html'));
});



app.get('/mentor/profile', authenticateToken, (req, res) => {
  const mentorId = req.query.mentorId;
  res.sendFile(path.join(__dirname, 'mentor-profile.html'),{mentorId});
});
app.get('/mentor/dashboard', authenticateToken, (req, res) => {
  const mentorId = req.query.mentorId;
  res.sendFile(path.join(__dirname, 'page2.html'),{mentorId});
});
app.get('/mentee/profile', authenticateToken, (req, res) => {
  const menteeId= req.query.mentorId;
  res.sendFile(path.join(__dirname, 'mentee-profile.html'),{menteeId});
  
});

app.get('/mentee/dashboard', authenticateToken, (req, res) => {
  const menteeId = req.query.menteeId;
  res.sendFile(path.join(__dirname, 'page.html'),{menteeId});
});


//<--------------------------------------------------------------------------------------------------------------------------------->

app.get('/paymentFailed',authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'paymentFailed.html'));
});
app.get('/paymentButton',authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'paymentButton.html'));
});

app.get('/:id/courses',authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'mentor-own-courses.html'));
});

app.get('/mentor/:id/course/:id',authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'mentor-lecture.html'));
});

// app.get('/courses/:courseId/lecturess', async (req, res) => {
//   const { courseId } = req.params;

//   console.log('Received request for course ID:', courseId); // Log the course ID received

//   try {
//       // Find the course and populate its lectures
//       const course = await Course.findById(courseId).populate('lectures');

//       if (!course) {
//           console.log('Course not found for ID:', courseId); // Log if course is not found
//           return res.status(404).json({ message: 'Course not found' });
//       }

//       console.log('Course data:', course); // Log the course data before sending response
//       res.json(course.lectures);
//   } catch (error) {
//       console.error('Error fetching lectures:', error); // Log any errors that occur
//       res.status(500).json({ message: 'Internal Server Error' });
//   }
// });



const httpsServer = http.createServer( app)
httpsServer.listen(port, () => {
  console.log('listening on port: ' + ( port))
})

const io = new Server(httpsServer) //initializing the new socket.io instance and attaching it to existing server 


const connections = io.of('/vidCalling') //using namespace "vidCalling" to connect with client and have a seperate channel to facilitate video calling with client


//<---------------------------------------------------------------------------------->

app.get('/mentor/:mentorId/courses', async (req, res) => {
  try {
      const { mentorId } = req.params;

      // Find the mentor and populate the courses
      const mentor = await Mentor.findById(mentorId).populate('courses').exec();

      if (!mentor) {
          return res.status(404).json({ message: 'Mentor not found' });
      }

      res.json(mentor.courses);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
  }
});


//<---------------------------------------------------------------------------------->
app.get('/paid-mentorship/:menteeId', async (req, res) => {
  const { menteeId } = req.params;

  try {
      if (!mongoose.Types.ObjectId.isValid(menteeId)) {
          return res.status(400).json({ error: 'Invalid menteeId' });
      }

      const mentee = await Mentee.findById(menteeId)
          .populate({
              path: 'paidMentorships.mentorId',
              select: 'name profileImage',
              model: Mentor
          });

      if (!mentee) {
          return res.status(404).json({ error: 'Mentee not found' });
      }

      // Return the paid mentorship sessions
      res.json(mentee.paidMentorships);
  } catch (error) {
      console.error('Error fetching paid mentorships:', error);
      res.status(500).send('Server error');
  }
});


//<----------------------------------code for payPal integration------------------------------>

import paypal from 'paypal-rest-sdk';
import cors from 'cors';
app.use(cors());
app.use(express.json());

// PayPal configuration
paypal.configure({
    'mode': 'sandbox', 
    'client_id': 'Aah_gxUyc3Bs0fEVCSsZ60sPCUQR5rFZ9_euzh4HTjy7olu6-RigStBN9yavmvo_QbwQ6E9bBgu0wGtX',
    'client_secret': 'EDLxP7fpbOyoF101_joOppoHIMaquCJGSfweH4zOxkvSlOGb9KCYozLsilNQyVKwWRsG7NK6X_PzW5xI'
});

app.post('/payment', async (req, res) => {
  const { mentorId, menteeId, startTime, endTime, returnUrl, type, courseId} = req.body;


  if (type == 'mock interview') {
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": `http://localhost:3000/paymentSuccess?mentorId=${mentorId}&menteeId=${menteeId}&startTime=${startTime}&endTime=${endTime}&returnUrl=${encodeURIComponent(returnUrl)}`,
          "cancel_url": "http://localhost:3000/paymentFailed"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name": "Mentorship Session",
                  "sku": "session",
                  "price": "1.00",
                  "currency": "USD",
                  "quantity": 1
              }]
          },
          "amount": {
              "currency": "USD",
              "total": "1.00"
          },
          "description": "Payment for mentorship session."
      }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
          console.error('Error creating payment:', error);
          res.status(500).send('Error creating payment');
      } else {
          const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
          if (approvalUrl) {
              res.json({ links: [approvalUrl] });
          } else {
              res.status(500).send('Approval URL not found');
          }
      }
  });
}

else if (type === 'course') {
  console.log("payment inititated for course")
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
   "redirect_urls": {
            "return_url": `http://localhost:3000/paymentSuccess1?menteeId=${menteeId}&courseId=${courseId}&returnUrl=${encodeURIComponent(returnUrl)}`,
                "cancel_url": "http://localhost:3000/paymentFailed"
      },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Course Enrollment",
                "sku": "course_enrollment",
                "price": "50.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "50.00"
        },
        "description": "Payment for course enrollment."
    }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    console.log("reached here");
    if (error) {
        console.error('Error creating payment:', error);
        res.status(500).send('Error creating payment');
    } else {
        const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
        if (approvalUrl) {
            res.json({ links: [approvalUrl] });
        } else {
            res.status(500).send('Approval URL not found');
        }
    }
});

app.get('/paymentSuccess1', async (req, res) => {
  console.log("reached there");
    const { courseId, menteeId, paymentId, PayerID } = req.query;

    console.log(paymentId)
    console.log(courseId)
    console.log(menteeId)
    console.log(PayerID)

  if (!courseId || !menteeId || !paymentId || !PayerID) {
      return res.status(400).send('Missing required query parameters');
  }

  paypal.payment.execute(paymentId, { "payer_id": PayerID }, async function (error, payment) {
      if (error) {
          console.error('Error executing payment:', error);
          return res.status(500).send('Payment execution failed');
      }

      try {
        console.log("in try block");
        const mentee = await Mentee.findById(menteeId);
        if (!mentee) {
            console.error('User not found:', menteeId);
            return res.status(404).send('User not found');
        }
        
        const courseAccess = new CourseAccess({
            menteeId: menteeId,
            courseId: courseId
        });
        await courseAccess.save();

        // Redirect to the course page
        res.redirect(`/coursess/${menteeId}`);
    } catch (err) {
        console.error('Error updating user or saving payment record:', err);
        res.status(500).send('Failed to update user or save payment record');
    }


  });
});

}


  
});

//-----------------------------------------------------------------------------------------------------------

app.get('/paymentSuccess', async (req, res) => {
  const { mentorId, menteeId, startTime, endTime, paymentId, PayerID, returnUrl } = req.query;

  console.log('Payment success request received:', { mentorId, menteeId, startTime, endTime, paymentId, PayerID, returnUrl });

  if (!mentorId || !menteeId || !startTime || !endTime || !paymentId || !PayerID || !returnUrl) {
      console.error('Missing required query parameters');
      return res.status(400).send('Missing required query parameters');
  }

  paypal.payment.execute(paymentId, { "payer_id": PayerID }, async function (error, payment) {
      if (error) {
          console.error('Error executing payment:', error.response);
          return res.status(500).send('Payment execution failed');
      }

      console.log('Payment executed successfully:', payment);

      try {
          const mentor = await Mentor.findById(mentorId);
          if (!mentor) {
              console.error('Mentor not found:', mentorId);
              return res.status(404).send('Mentor not found');
          }

          console.log('Mentor found:', mentor);

          let slotFound = false;

          // Iterate through the availability array
          mentor.availability.forEach(availability => {
              // Find the correct slot within the slots array
              const slot = availability.slots.find(slot => 
                  slot.startTime === startTime && slot.endTime === endTime && !slot.booked
              );

              if (slot) {
                  slot.booked = true;
                  slot.bookedBy = menteeId;
                  slotFound = true;
                  console.log('Slot booked successfully:', { slot, menteeId });
              }
          });

          if (slotFound) {
              await mentor.save();

              // Book the mentorship slot and create the mentorship link
              const mentorshipLink = await bookMentorshipSlot(menteeId, mentorId, startTime, endTime);
              console.log('Mentorship link created:', mentorshipLink);
              
              res.redirect(returnUrl);  // Redirect to the original page after updating mentor availability
          } else {
              console.log('No matching available slot found or slot is already booked:', { startTime, endTime });
              res.status(400).send('No available slot found or slot is already booked');
          }
      } catch (err) {
          console.error('Error updating mentor availability:', err);
          res.status(500).send('Failed to update mentor availability');
      }
  });
});

// The bookMentorshipSlot function
const bookMentorshipSlot = async (menteeId, mentorId, dateString, timeString) => {
  try {
      const mentor = await Mentor.findById(mentorId);
      const mentee = await Mentee.findById(menteeId);

      // Combine date and time to create a full Date object
      const dateTime = new Date(`${dateString}T${timeString}:00`);

      // Ensure both the mentor and mentee have proper fields for date and time
      const mentorshipLink = `http://localhost:3000/mentor/room/${mentorId}/${dateString}/${timeString}`;

      const newMentorship = {
          menteeId,
          // date: dateTime,  // Storing the full date and time
          time: timeString, // Optional: if you want to keep the time separate as well
          link: mentorshipLink,
      };

      // Add to mentor's record
      mentor.paidMentorships.push(newMentorship);
      await mentor.save();

      // Add to mentee's record
      const newMenteeMentorship = {
          mentorId,
          // date: dateTime,  
          time: timeString, 
          link: mentorshipLink,
      };
      mentee.paidMentorships.push(newMenteeMentorship);
      await mentee.save();

      return mentorshipLink;
  } catch (error) {
      console.error('Error booking mentorship slot:', error);
      throw error;
  }
};





//<-------------------------------------code for polling -------------------------------------------------->

const pollingNamespace = io.of('/polling');
let polls = {}; 
let userVotes = {};
pollingNamespace.on('connection', (socket) => {
  console.log('Polling functionality active');

//joining the room
socket.on('joinRoom', (roomName) => {
  socket.join(roomName);
  console.log(`User joined room: ${roomName}`);

  // Send initial polls for the room
  const roomPolls = polls[roomName] || {};
  socket.emit('initialPolls', Object.values(roomPolls));
});


  // Handle creating a poll
  socket.on('createPoll', (data) => {
    const { roomName, poll } = data;
    console.log('Poll created:', poll);
    
    if (!polls[roomName]) {
      polls[roomName] = {};
    }
    polls[roomName][poll.id] = poll;

    pollingNamespace.to(roomName).emit('newPoll', poll);
  });

  // Handle voting
  socket.on('vote', (data) => {
    const { roomName, pollId, option } = data;
    console.log('Vote received:', data);

    const roomPolls = polls[roomName] || {};
    const poll = roomPolls[pollId];
    if (!poll) return;

    // Remove user's previous vote if they had one
    if (userVotes[socket.id] && userVotes[socket.id][roomName] && userVotes[socket.id][roomName][pollId]) {
      const previousOption = userVotes[socket.id][roomName][pollId];
      if (poll.votes[previousOption] > 0) {
        poll.votes[previousOption]--;
      }
    }

    // Update the vote
    poll.votes[data.option] = (poll.votes[data.option] || 0) + 1;

    // Track user's new vote
    if (!userVotes[socket.id]) {
      userVotes[socket.id] = {};
    }
    if (!userVotes[socket.id][roomName]) {
      userVotes[socket.id][roomName] = {};
    }
    userVotes[socket.id][roomName][pollId] = option;

    pollingNamespace.to(roomName).emit('updatePoll', poll);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from the polling namespace');
    delete userVotes[socket.id]; // Clean up user votes on disconnect
  });
});



//<------------------------------code for sharing files------------------------------------------------->
io.of('/fileShare').on('connection', (socket) => {
  console.log("File sharing functionality active");

  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    console.log(`User joined room: ${roomName}`);
  });

  socket.on('file-send', ({ fileName, fileData, roomName }) => {
    // Broadcast the file to others in the room
    io.of('/fileShare').in(roomName).emit('file-receive', { fileName, fileData });
    console.log(`File ${fileName} sent to room: ${roomName}`);
  });
});




//<----------------------------------code for chat------------------------------------------->
io.of('/chat').on('connection', (socket) => {
  console.log('Chat functionality active');

  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    console.log(`User joined room: ${roomName}`);
  });

  socket.on('chat-message', ({ message, roomName }) => {
    console.log(`Message received for room ${roomName}: ${message}`);
    io.of('/chat').to(roomName).emit('chat-message', { message, room: roomName });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from chat');
  });
});

//<---------------------------------following mediasoup architecture--------------------------------------->

let worker
let rooms = {}          
let peers = {}           
let transports = []     
let producers = []      
let consumers = []     

app.get('/mentor/room/:mentorId/:date/:time',authenticateToken,checkLinkActivation, (req, res) => {
  res.sendFile(path.join(__dirname, 'room.html'));
});

// creating function to create worker
const createWorker = async () => {
  worker = await mediasoup.createWorker({
    rtcMinPort:2000,                                //defining UDP ports for transmiting media streams
    rtcMaxPort:2050,
  })
  console.log(`worker pid ${worker.pid}`)

  worker.on('died', error => {                    //handling if worker dies
  
    console.error('mediasoup worker has died')
    setTimeout(() => process.exit(1), 2000)     //giving time to cleanup or log error before terminating
  })

  return worker
}

//step1: creating worker
worker = createWorker()

//defining format of media in which steam will be decoded or encoded by mediasoup
const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000,   //increasing bitrate can increase quality of video but can hamper the overall performance
    },
  },
]


//here connections is namespace that we declared earlier will be used to take care of vidCalling channel
//connection is a event of socket, it will be emitted when a new client joins with same namespace as server

connections.on('connection', async socket => {
  console.log(socket.id)
  socket.emit('connection-success', {               //now emitting or telling client that the connection was successful
    socketId: socket.id,                            //giving socket id of connection to client
  })

  const removeItems = (items, socketId, type) => {      //creating function which will help us to remove items of client when it gets disconnected
    items.forEach(item => {
      if (item.socketId === socket.id) {
        item[type].close()                        //closing resources for that peer
      }
    })
    items = items.filter(item => item.socketId !== socket.id)

    return items
  }


  socket.on('disconnect', () => {                           //if client gets disconnected from server
    console.log('peer disconnected');
  
   
    const peer = peers[socket.id];
    if (peer) {
      consumers = removeItems(consumers, socket.id, 'consumer');      //removing consumers of that peer
      producers = removeItems(producers, socket.id, 'producer');    //removing producers of that peer
      transports = removeItems(transports, socket.id, 'transport');   //removing transports of that peer
  
      const { roomName } = peer;                    //getting room number in which that peer was residing
  
      rooms[roomName] = {
        router: rooms[roomName].router,
        peers: rooms[roomName].peers.filter(socketId => socketId !== socket.id)   //removing that peer from room
      };
  
      delete peers[socket.id];                         //deleting that peer from peers
    } else {
      console.log('Socket ID not found in peers');    //for getting aware of some unexpected error
    }
  });
  

  socket.on('joinRoom', async ({ roomName }, callback) => {     //when client will ask for joining the rooom
      
    const router1 = await createRoom(roomName, socket.id)     // using routers to create rooms

    peers[socket.id] = {
      socket,
      roomName,           
      transports: [],
      producers: [],
      consumers: [],
      peerDetails: {
        name: '',
        isAdmin: false,
      }
    }

   
    const rtpCapabilities = router1.rtpCapabilities

    
    callback({ rtpCapabilities })                                 //giving media capabilities to client
  })

  const createRoom = async (roomName, socketId) => {
   
    let router1
    let peers = []
    if (rooms[roomName]) {                      //if that room is already present 
      router1 = rooms[roomName].router            //get that router
      peers = rooms[roomName].peers || []             //and get peers
    } else {
      router1 = await worker.createRouter({ mediaCodecs, })       //if not, then create a new router
    }
    
    console.log(`Router ID: ${router1.id}`, peers.length)       

    rooms[roomName] = {                       
      router: router1,                          //set router of that client
      peers: [...peers, socketId],              //and set its socketID in list of peer i.e make in a peer in that room
    }

    return router1                              //return with router or room
  }

  


  socket.on('createWebRtcTransport', async ({ consumer }, callback) => {  //received event from client and info about consumer 
    
    const roomName = peers[socket.id].roomName  //getting room from socket id of peer

    const router = rooms[roomName].router       //getting router from rooms this will help us to handle streams in particular room


    createWebRtcTransport(router).then(
      transport => {
        callback({
          params: {
            id: transport.id,                     //unique id of each transport
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
          }
        })

      
        addTransport(transport, roomName, consumer) //adding info about newly created transport to the server's data with its room name and whether it is being used for consumer or not
      },
      error => {
        console.log(error)
      })
  })


  //defining a function to add all details about a newly created transport in server
  const addTransport = (transport, roomName, consumer) => {

    transports = [
      ...transports,
      { socketId: socket.id, transport, roomName, consumer, }
    ]

    peers[socket.id] = {
      ...peers[socket.id],
      transports: [
        ...peers[socket.id].transports,
        transport.id,
      ]
    }
  }

  const addProducer = (producer, roomName) => {
    producers = [
      ...producers,
      { socketId: socket.id, producer, roomName, }
    ]

    peers[socket.id] = {
      ...peers[socket.id],
      producers: [
        ...peers[socket.id].producers,
        producer.id,
      ]
    }
  }

  const addConsumer = (consumer, roomName) => {
    
    consumers = [
      ...consumers,
      { socketId: socket.id, consumer, roomName, }
    ]

   
    peers[socket.id] = {
      ...peers[socket.id],
      consumers: [
        ...peers[socket.id].consumers,
        consumer.id,
      ]
    }
  }

  socket.on('getProducers', callback => {
   
    const { roomName } = peers[socket.id]

    let producerList = []
    producers.forEach(producerData => {
      if (producerData.socketId !== socket.id && producerData.roomName === roomName) {
        producerList = [...producerList, producerData.producer.id]
      }
    })

    
    callback(producerList)
  })

  const informConsumers = (roomName, socketId, id) => {
    console.log(`just joined, id ${id} ${roomName}, ${socketId}`)
   
    producers.forEach(producerData => {
      if (producerData.socketId !== socketId && producerData.roomName === roomName) {
        const producerSocket = peers[producerData.socketId].socket
        
        producerSocket.emit('new-producer', { producerId: id })
      }
    })
  }

  ////gets the transport object ass. with the socket id
  const getTransport = (socketId) => {
    const [producerTransport] = transports.filter(transport => transport.socketId === socketId && !transport.consumer)
    return producerTransport.transport
  }


  socket.on('transport-connect', ({ dtlsParameters }) => {
    console.log('DTLS PARAMS... ', { dtlsParameters })
    
    getTransport(socket.id).connect({ dtlsParameters })  //gets the transport object ass. with the socket id and then complete the connection process of WebRTC using coonect method of mediasoup
  })


  socket.on('transport-produce', async ({ kind, rtpParameters, appData }, callback) => {
 
    const producer = await getTransport(socket.id).produce({
      kind,
      rtpParameters,
    })

   
    const { roomName } = peers[socket.id]

    addProducer(producer, roomName)

    informConsumers(roomName, socket.id, producer.id)

    console.log('Producer ID: ', producer.id, producer.kind)

    producer.on('transportclose', () => {
      console.log('transport for this producer closed ')
      producer.close()
    })

   
    callback({
      id: producer.id,
      producersExist: producers.length>1 ? true : false
    })
  })

  socket.on('transport-recv-connect', async ({ dtlsParameters, serverConsumerTransportId }) => {
    console.log(`DTLS PARAMS: ${dtlsParameters}`)
    const consumerTransport = transports.find(transportData => (
      transportData.consumer && transportData.transport.id == serverConsumerTransportId
    )).transport
    await consumerTransport.connect({ dtlsParameters })
  })

  socket.on('consume', async ({ rtpCapabilities, remoteProducerId, serverConsumerTransportId }, callback) => {
    try {

      const { roomName } = peers[socket.id]
      const router = rooms[roomName].router
      let consumerTransport = transports.find(transportData => (
        transportData.consumer && transportData.transport.id == serverConsumerTransportId
      )).transport

      
      if (router.canConsume({
        producerId: remoteProducerId,
        rtpCapabilities
      })) {
       
        const consumer = await consumerTransport.consume({
          producerId: remoteProducerId,
          rtpCapabilities,
          paused: true,
        })

        consumer.on('transportclose', () => {
          console.log('transport close from consumer')
        })

        consumer.on('producerclose', () => {
          console.log('producer of consumer closed')
          socket.emit('producer-closed', { remoteProducerId })

          consumerTransport.close([])
          transports = transports.filter(transportData => transportData.transport.id !== consumerTransport.id)
          consumer.close()
          consumers = consumers.filter(consumerData => consumerData.consumer.id !== consumer.id)
        })

        addConsumer(consumer, roomName)

       
        const params = {
          id: consumer.id,
          producerId: remoteProducerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          serverConsumerId: consumer.id,
        }

      
        callback({ params })
      }
    } catch (error) {
      console.log(error.message)
      callback({
        params: {
          error: error
        }
      })
    }
  })

  socket.on('consumer-resume', async ({ serverConsumerId }) => {
    console.log('consumer resume')
    const { consumer } = consumers.find(consumerData => consumerData.consumer.id === serverConsumerId)
    await consumer.resume()
  })
})

const createWebRtcTransport = async (router) => {
  return new Promise(async (resolve, reject) => {
    try {
      
      const webRtcTransport_options = {
        listenIps: [
          {
            ip: '0.0.0.0',
             announcedIp: '172.30.128.1',
          }
        ],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
      }

      let transport = await router.createWebRtcTransport(webRtcTransport_options)
      console.log(`transport id: ${transport.id}`)

      transport.on('dtlsstatechange', dtlsState => {
        if (dtlsState === 'closed') {
          transport.close()
        }
      })

      transport.on('close', () => {
        console.log('transport closed')
      })

      resolve(transport)

    } catch (error) {
      reject(error)
    }
  })
}