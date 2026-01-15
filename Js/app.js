

// XREIAZOME NPM INSTALL GIA NA TREXW TON SERVER
//  npm install express mysql2 cors express-session


const express = require('express');
const session = require('express-session');//cookies
const path = require('path');
const cors = require('cors'); 
const { initDatabase, dropDatabase } = require('./database');
const { insertUser, insertBand } = require('./databaseInsert');
const { getAllUsers, getUserByCredentials, checkExistence, updateUser } = require('./databaseQueriesUsers');
const { createReview, getReviews, updateReviewStatus, deleteReview } = require('./databaseQueriesReviews');
// --PROJECT---
const { deleteUser, getPendingReviews, getAdminStats } = require('./databaseQueriesAdmin'); //import admin functions
const { 
    getBandByCredentials, getAllBandEvents, getBandRequests, 
    updateRequestStatus, getMessages, sendMessage, addCalendarEvent,
    getAllBands, updateBand, deleteBand, getBandEarnings,
    getPublicEventsForExplore, getFuturePublicEventsForMap, getBandsFiltered, getBandById, getBandPublicEventsByBandId,
    getBandAvailabilityByBandId, createPrivateEventRequest

} = require('./databaseQueriesBands');
const { getUserPrivateEvents, markPrivateEventDone} = require('./databaseQueriesUsers');
const { get } = require('http');



const app = express();
const PORT = 3000;


app.use(cors());

//Serve files from the 'html' folder ( visit /normal_login.html directly)
app.use(express.static(path.join(__dirname, '../html')));
app.use('/Js', express.static(__dirname));
app.use(express.static(path.join(__dirname, '../')));

app.use(express.json()); //parsing JSON from main.js 
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'asd', 
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } //one day
}));

//askisi 2

//login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const users = await getUserByCredentials(username, password);
        if (users.length > 0) {
            req.session.loggedIn = true;
            req.session.username = users[0].username;
            req.session.userData = users[0];

            //tha doume an leitoyrgei svsta isos einai blakeia!!!! 
            req.session.isAdmin = false;
            req.session.isBand = false;
            req.session.bandUsername = null;
            req.session.bandData = null;
            
            res.status(200).json({ message: "Bravo correct login perfect", username: users[0].username });
        } else {
            res.status(401).json({ error: "Invalid username or password" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// have to check if logged in
app.get('/check-auth', (req, res) => {
    if (req.session.loggedIn) {
        res.json({ 
            loggedIn: true, 
            userData: req.session.userData 
        });
    } else {
        res.json({ loggedIn: false });
    }
});

//logout route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).send('Error logging out');
        res.send('Logged out');
    });
});

//update user data route with put
app.put('/update/user', async (req, res) => {
    if (!req.session.loggedIn) return res.status(403).json({ error: "Not logged in" });

    const newData = req.body;
    const username = req.session.username;

    try {
        await updateUser(username, newData);
        req.session.userData = { ...req.session.userData, ...newData };
        
        res.json({ message: "Data updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index2.html'));
});

//AJAX Check Route
app.get('/check/:entity/:field', async (req, res) => {
    const field = req.params.field; 
    const value = req.query[field]; 
    if (!['username', 'email', 'telephone'].includes(field)) {
      return res.status(400).json({ error: 'Invalid field check' });
    }
  
    try {
      //uses the function we added to databaseQueriesUsers.js
      const exists = await checkExistence(field, value);
      res.json({ exists: exists });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

app.post('/signup/user', async (req, res) => {
    const userData = req.body;
    try {
        if (await checkExistence('username', userData.username)) {
             return res.status(403).json({ error: 'Username already taken' });
        }
        if (await checkExistence('email', userData.email)) {
             return res.status(403).json({ error: 'Email already registered' });
        }

        await insertUser(userData);
        
        res.status(200).json({
            message: "Sign up well done!", data: userData
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/signup/band', async (req, res) => {
    const bandData = req.body;
    try {
        if (await checkExistence('username', bandData.username)) {
             return res.status(403).json({ error: 'Username already taken' });
        }
        if (await checkExistence('email', bandData.email)) {
             return res.status(403).json({ error: 'Email already registered' });
        }

        await insertBand(bandData);

        res.status(200).json({
            message: "Sign up well done!", data: bandData
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/users', async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).send(error.message);
    }
});
app.get('/initdb', async (req, res) => {
    try {
        const result = await initDatabase(); //Calls the function from database.js
        res.send(result);
    } catch (error) {
        res.status(500).send('Init Error: ' + error.message);
    }
});

app.get('/dropdb', async (req, res) => {
    try {
        const result = await dropDatabase();
        res.send(result);
    } catch (error) {
        res.status(500).send('Drop Error: ' + error.message);
    }
});


//post
app.post('/review/', async (req, res) => {
    const { band_name, sender, review, rating } = req.body;
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(406).json({ message: "Rating must be an integer between 1 and 5." });
    }

    try {
        const reviewId = await createReview({ band_name, sender, review, rating });
        
        console.log("rest api post request was successfully created!!");
        res.status(200).json({ 
            message: "Review created successfully",
            reviewId: reviewId 
        });
    } catch (err) {
        if (err.message === "Band not found") {
            res.status(404).json({ message: "Band name not found in database." });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

//get
app.get('/reviews/:band_name', async (req, res) => {
    const { band_name } = req.params;
    const { ratingFrom, ratingTo } = req.query;

    if (ratingFrom && ratingTo && parseInt(ratingFrom) > parseInt(ratingTo)) {
        return res.status(406).json({ message: "ratingFrom cannot be greater than ratingTo" });
    }

    try {
        const reviews = await getReviews(band_name, ratingFrom, ratingTo);
        res.status(200).json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
//put
app.put('/reviewStatus/:review_id/:status', async (req, res) => {
    const { review_id, status } = req.params;

    if (status !== 'published' && status !== 'rejected') {
        return res.status(406).json({ message: "Status must be 'published' or 'rejected'." });
    }

    try {
        const updated = await updateReviewStatus(review_id, status);
        if (updated) {
            res.status(200).json({ message: `Review ${review_id} status updated to ${status}.` });
        } else {
            res.status(403).json({ message: "Review ID not found or not pending." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
//delete
app.delete('/reviewDeletion/:review_id', async (req, res) => {
    const { review_id } = req.params;

    try {
        const deleted = await deleteReview(review_id);
        if (deleted) {
            res.status(200).json({ message: `Review ${review_id} successfully deleted.` });
        } else {
            res.status(403).json({ message: "Review ID not found." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//FOR ADMIN PURPOSES (routes)
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    //elenxos kodikou
    if (username === 'admin' && password === 'admiN12@*') {
        req.session.isAdmin = true;
        res.status(200).json({ message: "Admin login success" });
    } else {
        res.status(401).json({ error: "Invalid admin credentials" });
    }
});

//elenxoume an einai admin alios aporiptei
function checkAdmin(req, res, next) {
    if (req.session.isAdmin) next();
    else res.status(403).json({ error: "Access denied" });
}
//get, pernoume ola ta dedomena ton users (aristero panel)
app.get('/admin/users', checkAdmin, async (req, res) => {
    try {
        const users = await getAllUsers(); //from databaseQueriesUsers.js
        res.json(users);
    } catch (err) { res.status(500).json({error: err.message}); }
});
app.delete('/admin/user/:username', checkAdmin, async (req, res) => {
    try {
        const success = await deleteUser(req.params.username);
        if (success) res.json({ message: "User deleted" });
        else res.status(404).json({ error: "User not found" });
    } catch (err) { res.status(500).json({error: err.message}); }
});

//gia reviews miso-dexia pano panel
app.get('/admin/reviews/pending', checkAdmin, async (req, res) => {
    try {
        const reviews = await getPendingReviews();
        res.json(reviews);
    } catch (err) { res.status(500).json({error: err.message}); }
});

//stats pie chart kato dexia mesi
app.get('/admin/stats', checkAdmin, async (req, res) => {
    try {
        const stats = await getAdminStats();
        res.json(stats);
    } catch (err) { res.status(500).json({error: err.message}); }
});

//additional info gia bands management (delete band)-------
app.get('/admin/bands', checkAdmin, async (req, res) => {
    try {
        const bands = await getAllBands();
        res.json(bands);
    } catch (err) { res.status(500).json({error: err.message}); }
});

app.delete('/admin/band/:username', checkAdmin, async (req, res) => {
    try {
        const result = await deleteBand(req.params.username);
        if (result === 'User deleted successfully.') { 
             res.json({ message: "Band deleted" });
        } else {
             res.status(404).json({ error: result }); 
        }
    } catch (err) { res.status(500).json({error: err.message}); }
});

//routes gia band login 
app.post('/band/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const bands = await getBandByCredentials(username, password);
        
        if (bands && bands.length > 0) {
            req.session.loggedIn = true;
            req.session.isBand = true; //flag that this is a band login
            req.session.bandUsername = bands[0].username;
            req.session.bandData = bands[0];

            //isos blakeia kai auto
            req.session.isAdmin = false;
            req.session.username = null;
            req.session.userData = null;

            res.status(200).json({ message: "Band login success" });
        } else {
            res.status(401).json({ error: "Invalid band credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/*new dashboard routes for band*/

//events for calendar + requests + chat + earnings
app.get('/band/calendar_events', async (req, res) => {
    if (!req.session.isBand) return res.status(403).json({ error: "Access denied" });
    try {
        const events = await getAllBandEvents(req.session.bandData.band_id);
        res.json(events);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

//posthiki event sto calendar
app.post('/band/add_event', async (req, res) => {
    if (!req.session.isBand) return res.status(403).json({ error: "Access denied" });
    try {
        await addCalendarEvent({ //data apo databaseQueriesBands.js (omoios tetoia events kai se ala post get)
            band_id: req.session.bandData.band_id,
            title: req.body.title,
            start: req.body.start
        });
        res.json({ message: "Event added" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

//dexia meria gia ta requests (private public idk)
app.get('/band/requests', async (req, res) => {
    if (!req.session.isBand) return res.status(403).json({ error: "Access denied" });
    try {
        const reqs = await getBandRequests(req.session.bandData.band_id); //sindesi me to databaseQueriesBands.js
        res.json(reqs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

//enimerosi status ama einia accepted i rejected:
app.put('/band/request/:id', async (req, res) => {
    if (!req.session.isBand) return res.status(403).json({ error: "Access denied" });
    try {
        await updateRequestStatus(req.params.id, req.body.status);
        res.json({ message: "Status updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

//afou patisoume to chat button kai einai accepted to event, pernoume ta messages gia to sygkekrimeno event
app.get('/band/messages/:eventId', async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const msgs = await getMessages(eventId);
        res.json(msgs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/band/message', async (req, res) => {
    try {
        await sendMessage({ event_id: req.body.event_id, message: req.body.message, sender: req.body.sender });
        res.json({ message: "Sent" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

//gia ta earnings ton band
app.get('/band/earnings', async (req, res) => {
    if (!req.session.isBand) return res.status(403).json({ error: "Access denied" });
    try {
        const amount = await getBandEarnings(req.session.bandData.band_id);
        res.json({ earnings: amount });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// public events for calendar + results
app.get('/band/public_events', async (req, res) => {
  try {
    const events = await getPublicEventsForExplore();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// public events with pins for maps
app.get('/public_events/map', async (req, res) => {
  try {
    const events = await getFuturePublicEventsForMap();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// bands filtered for explore page
app.get('/band/bands', async (req, res) => {
  try {
    const bands = await getBandsFiltered(req.query);
    res.json(bands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/band/band/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

    const band = await getBandById(id); 
    if (!band) return res.status(404).json({ error: "Not found" });

    res.json(band);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get private events for a user 
app.get('/user/private_events', async (req, res) => {
  if (!req.session.loggedIn) return res.status(403).json({ error: "Not logged in" });

  try {
    const events = await getUserPrivateEvents(req.session.userData.user_id);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//put private event  DONE 
app.put('/user/private_events/:id/done', async (req, res) => {
  if (!req.session.loggedIn) return res.status(403).json({ error: "Not logged in" });

  try {
    const ok = await markPrivateEventDone(req.session.userData.user_id, req.params.id);
    if (!ok) return res.status(400).json({ error: "Cannot mark done (status/date)" });
    res.json({ message: "Event marked done" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/user/private_events', async (req, res) => {
  if (!req.session.loggedIn) return res.status(403).json({ error: "Not logged in" });

  try {
    const createdId = await createPrivateEventRequest({
      user_id: req.session.userData.user_id,
      band_id: req.body.band_id,
      event_type: req.body.event_type,
      people_count: req.body.people_count,
      city: req.body.city,
      address: req.body.address,
      notes: req.body.notes
    });
    res.json({ message: "Request created", id: createdId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function requireUser(req, res, next) {
  if (req.session?.loggedIn && req.session?.userData?.user_id) return next();
  return res.status(403).json({ error: "Not logged in as user" });
}

// single band info (public)
app.get('/api/bands/:id', async (req, res) => {
  try {
    const band = await getBandById(Number(req.params.id));
    if (!band) return res.status(404).json({ error: "Band not found" });
    res.json(band);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/private_events/request', async (req, res) => {
  // πρέπει να είναι logged in user (όχι band)
  if (!req.session.loggedIn || req.session.isBand) {
    return res.status(403).json({ error: 'Not logged in as user' });
  }

  try {
    const user_id = req.session.userData.user_id;

    const {
      band_id, event_type, event_datetime,
      event_city, event_address, event_description
    } = req.body;

    if (!band_id || !event_type || !event_datetime || !event_city || !event_address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const out = await createPrivateEventRequest({
      user_id,
      band_id,
      event_type,
      event_datetime,
      event_city,
      event_address,
      event_description
    });

    res.json({ private_event_id: out.private_event_id, status: 'requested' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// availability slots for a band (public)
app.get('/api/bands/:id/availability', async (req, res) => {
  try {
    const events = await getBandPublicEventsByBandId(req.params.id);
    const slots = events.map(e => ({ id: e.id, title: e.title || 'Available', start: e.start }));
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





console.log("ROUTES:");
app._router.stack
  .filter(r => r.route)
  .forEach(r => console.log(Object.keys(r.route.methods).join(",").toUpperCase(), r.route.path));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});