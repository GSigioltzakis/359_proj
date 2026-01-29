<div id="header" align="center">
  <img src="https://media.tenor.com/SkKQMYdLjZIAAAAM/bugs-bunny.gif" width="100"/>
</div>

# WebDEV project notes
 To parse the data from resource.js into the database (without doing them one by one manually), I made a script that takes them all directly and puts them in the database. dbScript.js and to run it we write: node dbScript.js. We run it X times until we see the green tick (yes I got it ready-made).
## To lauch succcesfuly the project do:
```
1) npm install express mysql2 cors express-session
2) cd Js
3) node dbScript.js
4) node app.js
0) open the mySQL database from a server (lets say XAAMP)
```
# (1) event A, ADMIN panel
## addition of all queries except!: /// pie-chart: number of public private/events ////
1) creation of admin_dashboard.html for the dashboard that only the admin will see via route. This dashboard is connected to:
    1. app.js -> we check if it is indeed the admin via password
    2. app.js -> with get/delete we process user data (and bands further down)
    3. app.js -> another 2 get requests for user reviews (we get them so the admin can see and approve them) and for the pie-chart.
    4. adminLogin.css for styling the dashboard route.

2) creation of a separate login due to the addition of the admin:
    1. main.js -> if we see "admin" in the username, then we go to the corresponding admin_dashboard.html
    2. main.js -> otherwise we simply open the JS file with the profile that each user can edit for themselves.

3) creation of a new file for SQL code:
    1. databaseQueriesAdmin.js -> for deleteUser, getReview and stats for the chart.

# (2) creation of a diagram bc I didn't have anything else to do:
--> diagram.html (sxediagrama.html)

# (3) in the bands folder I created 2 new files (I will put another 2 later), for a smoother login process.
1) band_user.hmtl -> similar to normal_user.html, just an image to press the buttons.
2) band_login -> implementation of the login similar to normal_login.html (sort of).
3) 1. .(band_dashboard.html)
   2. .(band_profile.html) tba

# (4) event C, bands-> band_dashboard
## NOTE: run with data from the database. (they already have useful things inside, so we can do queries A B C D independently)

1) creation of band_dashboard.html (after I have done the login). Implementation of the full band dashboard:
    1. 2 sides: half left and right. On the left side there is the calendar taken from https://fullcalendar.io/ .
    
    2. band_dashboard.html -> Left side dashboard: calendar implemented with id=calendar, so it goes to the JS script a bit further down (inside the html file), and I implement the following for the calendar: an event listener that contains the date click, the storage of information inside the date and add_events for events that already exist in the database.
    
    3. band_dashboard.html -> Right side dashboard: 
        1. Pulls reservation requests from the backend. If the status is 'requested', it shows a button for Accept/Reject. If accepted, the status changes to 'to be done' and the event becomes active.
        2. For 'to be done' events, it activates a chat box. The band can exchange messages with the user for details. Messages update automatically every 5 seconds (polling).
        3. Allows the band to mark an active event as DONE (completed) to close the reservation and finally calculates and displays the band's total earnings from completed events.
    
    4. band_dashboard.html -> top right and bottom right contains: a button "edit profile" to redirect to band_profile.html where the user can edit their profile, and bottom right there are the earnings (simple block).
    
    5. band_dash.css implementation of a different file (css) for styling with google help.
2) backend implementation for the band users(with connection to dbQuerriesBand.js):
    1. app.js -> for the calendar: addition of already existing events inside the calendar.
    
    2. app.js -> implementation of requests as accept/reject so that after we get the users' requests, we can update later and have it show (if they were accepted or not).
    
    3. app.js -> final implementation for the chat display. There are already some users communicating in the database as an example (resources.js), so we take them and implement them, accepted->(button), so it opens the chat meaning it finds (and displays) from the database the "Conversation". NOTE: perhaps beyond existing messages we might not be able to add new ones, but if we press done (mark as done), and refresh->the balance will have updated accordingly.
    
    4. databaseQuerriesBands.js -> update of already existing file with addition: 
        1. Retrieves both Public and 'Accepted' Private events for display on the calendar, while allowing the registration of new availability (public event) by the band with get and addbands.
        2. Fetches all pending and active requests (reservations) combined with user details (using JOIN) and updates their status (e.g. accepted/rejected).
        3. Fetches all pending and active requests (reservations) combined with user details (using JOIN) and updates their status (e.g. accepted/rejected).
        4. Saves new messages and retrieves chat history for specific events. Finally, it calculates the band's net earnings by summing the value of completed ('done') events and subtracting a 15% commission.

# (5) event C, bands-> user_profile.
For the user_profile regarding the bands, it was implemented by allowing the band to see the reviews made for it after these reviews have been approved by the admin, and then the corresponding band sees them too. Also for extra, the notice board is also on the band's profile.

# (6) Guest user: 
## general Elis progress
1. The home page index2.html is the one the guest user sees. From there they can Log in/ sign in either as a user or as a band from the account button. More specifically, in the normal user form, the button at the very bottom that says "back to home" sends you as a guest user and so you can see all the bands (and those created by the form), and the corresponding events that have been posted. Then if you want to see something as a logged-in user/band, you just click "Account" top left and execute the corresponding function you want.

2. Regarding a big change, in the guest view, addition (random from web) of images was done. Creation of images folder and inside it has the 20 bands from resource.js, and a default band image for the bands created by the form.

For user log in, the file normal_login.html opens and then index_user.html opens which is the index + capabilities for a registered user. 

## GOOGLE GEMINI API (404 error)
0) USE OF GOOGLE GEMINI FLASH
1) In this part I try to implement the 3.4, LLM/SQL part. I have done the following:
    1. Creation of API key from: https://aistudio.google.com/app/api-keys
    2. Execution of command: npm install @google/generative-ai, where in the node_modules folder it downloads new data for the implementation of the ai (adds new parts, nothing was modified).
    3. app.js -> addition of API key at the very top of the app.js code
    4. app.js -> initially we receive the user's message e.g. "hi how are you" in the chat and in this way the AI responds accordingly. If something goes wrong (like error 404 for the ai), then it sends message "Sorry, I couldn't process that, write it again please."
    5. app.js -> for the translation of text to SQL query, after we write our prompt, the AI must execute the 3 tasks we have written for it in line 683-685 and translate it specifically to SQL, after it does so, it takes the query and adds it to the database.
6) correction of index2.html (guestt)
    1. index2.html -> change/correction of sendMusic function where after we press enter from app.js to send the prompt, the ai processes it. This processing job will be done by sendMusic. "thinking". (well and it returns 404...)
    2. index2.html -> if all goes well, in line 1047 and onwards, it shows us the answer from our question.

### the error it shows me where we can't use the AI:
```
GoogleGenerativeAIFetchError: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent: [404 Not Found] models/gemini-1.5-flash is not found for API version v1beta, or is not supported for generateContent. Call ListModels to see the list of available models and their supported methods.
    at handleResponseNotOk (C:\Users\georg\Desktop\ετος\359\A3_5504\form_pages\JS\node_modules\@google\generative-ai\dist\index.js:434:11)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async makeRequest (C:\Users\georg\Desktop\ετος\359\A3_5504\form_pages\JS\node_modules\@google\generative-ai\dist\index.js:403:9)
    at async generateContent (C:\Users\georg\Desktop\ετος\359\A3_5504\form_pages\JS\node_modules\@google\generative-ai\dist\index.js:867:22)
    at async C:\Users\georg\Desktop\ετος\359\A3_5504\form_pages\JS\app.js:660:24 {
  status: 404,
  statusText: 'Not Found',
  errorDetails: undefined
}
```