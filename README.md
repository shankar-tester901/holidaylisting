# holidaylisting
Serverless Computing Example using Zoho Catalyst using Applogic

So wow, we have made quite some progress.

We started with Chuck Norris and then we made the Dog Dictionary. 

So till now we have learnt about quite somethings. 



Now let us add some more to our knowledge.

Catalyst assets used :-

1. Client

2. Applogic

3. DataStore

4. ZCQL 

5. Cache

6. Mail



Cache and Mail are the new increments this time. 

So let us begin :-

A. Create a project and name it HolidayListing

B. Install the CLI 

C. Create an empty directory called holidaylisting

D. Initialize your project with catalyst login command

E. As we had discussed earlier, this application will have a client and a server, so Select client and App Logic by pressing the space bar and click Enter.  Since we have already created a project ‘HolidayListing’ via the web console earlier, just choose that again.

F. Now, you will be asked for the Client (static content) name. Just choose any name or just click Enter.

G. Then you will be asked for a package name, entry point and author of your App Logic. Here, click Enter so that the default values will be applied. Next, you will be asked to install the required dependencies. Just click Enter which will install the required dependencies as shown below,

H. Now you will find the following inside the dog dictionary folder :-

applogic	catalyst.json	client



I. Inside apologic, you will find a folder holiday_listing







J. Inside dog_dictionary folder, you will have the following :-

catalyst-config.json

	index.js		

node_modules	

	package-lock.json	package.json









K. Now, let us see what does the client folder hold -



client-package.json

	index.html	

	main.css	

	main.js



The index.html is where you make your client.

In the client, this time we will have a button which will fetch and store in the Datastore all the US holidays.

Then we will have a text field where we will have a date and we need to check if that date is a holiday or not.

Quite simple, right ?



I love Holidays
Is it a holiday on :  Holiday?

Populate Holiday List

The logic will be like this -



1. We click on Populate Holiday List button. This in turn fetches and stores and renders the holidays.

2. We key in some date. And then we click on Holiday? to check if that day is a holiday. If it indeed is a holiday a joyful message is shown. Else a less-joyful message is shown ;-).



So here is the code for the index.html file.



<!DOCTYPE html>

<html>



<head>

    <meta charset="utf-8" />

    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <title>Holiday List </title>

    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" type="text/css" media="screen" href="main.css" />

    <script src="https://code.jquery.com/jquery-3.4.1.min.js"> </script>

    <script src="main.js"></script>

</head>



<body>

    <h1>I love Holidays</h1>



    <div>

        Is it a holiday on :



        <input type="text" name="date_of_holiday" id="date_of_holiday" placeholder="YYYY-MM-DD" required

            pattern="(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])/(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])/(?:30))|(?:(?:0[13578]|1[02])-31))"

            title="Enter a date in this format YYYY/MM/DD" />



        <button class="button isHoliday" id="submitDate" type="submit"

            onclick="checkIfHoliday();return false;">Holiday?</button>



    </div>



    <button class="button hol_details" id="submit" type="submit" onclick="getHolidayDetails();return false;">Populate

        Holiday List</button>



    <div class="row">



        <div id="holiday_confirmation_Details"></div>

    </div>



    <div class="holiday_Details" id="holiday_Details">



    </div>





</body>



</html>





So let us look at the above code.

I have added the jquery library

I have also referred the main.js file so that the button action can be invoked in main.js file.


There is some date-field testing. 

The holidays are fetched and shown in the holiday_Details div.



The holiday_confirmation_Details div displays the joyous or the less-joyous message.





Now, let us look at the main.js file. This file is the heart of the client operations. So all the client-side magic goes here.


function getHolidayDetails() {

  $('#holiday_Details').html('<img src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif"/>');

  $('#holiday_confirmation_Details').empty();

  $.ajax({

    type: 'GET',

    url: '/server/holiday_listing/getDetails',

    contentType: 'application/json',

    success: function (data) {

      $('#holiday_Details').html(data);

    },

    error: function (error) {

      alert(error);

    }

  });



}



function checkIfHoliday() {



  $('#holiday_confirmation_Details').html('<img src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif"/>');



  $.ajax({

    type: 'POST',

    url: '/server/holiday_listing/check_if_holiday',

    contentType: 'application/json',

    data: JSON.stringify({

      "holiday_date": $('#date_of_holiday').val()

    }),

    success: function (serverData) {

      $('#holiday_confirmation_Details').html(serverData);

    },

    error: function (error) {

      alert("Error received from Server :" + error);

    }

  });



}













Let us look at the above file. 



So let us analyse the flow here.



When we click the Populate Holiday List button on the client, that button-click triggers the getHolidayDetails() method here in main.js.

The main.js file in turn calls the getDetails method in the server side file, that is , main.js. When the response comes,it populates the data in the holiday_Details div in the client. Simple, no?





L. Now let us go to the applogic folder.  Now this is the place where you need to install any package that you may need to run your server side code. This is the heart of the operation literally. So anytime you want to add any third-party package for server side, you install it here. If you are using nodejs, you need to install packages here using the nam install —save xyzzy.



A. Create a database table from the web client. Go to DataStore and create a table by the name HolidayList. Add three new columns - “name”, “description” and “date” to it.

So  let us look at what our index.js looks like.




"use strict";



var express = require("express");

const axios = require("axios");



var app = express();



//If you do not use the following line, then you will never receive any post data

app.use(express.json());



//get the nodejs sdk

var catalyst = require("zcatalyst-sdk-node");

var proceedWithInsert = false;





app.get("/getDetails", (req, res) => {

  console.log(' in getDetails ');

  const requestUrl =

    "https://calendarific.com/api/v2/holidays?&api_key=cd4033621a91a04976ebacfdd6a6d711d3569350&country=US&year=2019";





  var temp = "";

  //Initialize Catalyst SDK



  var catalystApp = catalyst.initialize(req);



  checkDBInsertStatus(catalystApp).then(queryResult => {

    proceedWithInsert = true;

  })



  axios

    .get(requestUrl)

    .then(function (response) {

      for (var i = 0; i < response.data["response"].holidays.length; i++) {

        var h_name = response.data["response"].holidays[i].name;

        var h_description = response.data["response"].holidays[i].description;

        var h_date = response.data["response"].holidays[i].date.iso;





        //     console.log('h_name ' + h_name + ' h_description ' + h_description + '  h_date ' + h_date);

        //insert into database

        insertToDB(catalystApp, h_name, h_description, h_date);



        temp =

          temp +

          "<tr><td>" +

          h_name +

          "</td><td>" +

          h_description +

          "</td><td>" +

          h_date +

          "</td></tr>";

      }



      //send constructed UI to client

      res.send(

        ' <html><body><table style="width:100%" border="1"><tr><th>Holidays</th><th>Description</th><th>Date</th></tr>' +

        temp +

        "</table></body</html>"

      );

    })

    .catch(err => {

      console.log("Error in get  : " + err);

    });

});



/**

 * Function to insert Rows to DB

 */



function insertToDB(catalystApp, name, description, date) {

  let rowData = {

    name: name,

    description: description,

    date: date

  };



  if (proceedWithInsert) {



    let datastore = catalystApp.datastore();

    let table = datastore.table("HolidayList");

    let insertPromise = table.insertRow(rowData);

    insertPromise.then(row => {

      console.log("database insertion done");

    })



  }

}



app.post("/check_if_holiday", (req, res) => {

  var h_date = req.body.holiday_date;

  console.log(" holiday date to check is " + h_date);





  var catalystApp = catalyst.initialize(req);



  //check if the date is present in the cache

  checkPresenceInCache(catalystApp, h_date)

    .then(cacheResp => {

      console.log('cache response is ' + cacheResp);

      if (cacheResp == null) {

        console.log("Data not in Cache. Check with fetchFromDB ");

        fetchFromDB(catalystApp, h_date)

          .then(dbResp => {

            if (dbResp.length != 0) {

              console.log(" flow reaching here " + dbResp);

              insertIntoCache(catalystApp, dbResp.date);

              sendMail(catalystApp, dbResp);



            }



            else {



              res.send('Hurray! It is an escape-from-office-day! It is a holidayyyyyyyy !');

              sendMail(catalystApp, cacheResp);

              //res.send('Sorry! You have to go to office day');

            }

          })

          .catch(err => {

            console.log("Error in fetching from DB " + err);

          });

      }

      else {



        //check if the incoming date and the cached date are the same if so holiday

        if (h_date == cacheResp) {

          res.send('Hurray! It is an escape from office day! It is a holidayyyyyyyy !');

          sendMail(catalystApp, cacheResp);

        }

        else {

          console.log(' cache date not incoming date ');

          fetchFromDB(catalystApp, h_date)

            .then(dbResp => {

              console.log('dbResp is   ' + dbResp);

              if (dbResp != null) {

                if (dbResp.length != 0) {

                  console.log(" date found in db  " + dbResp);

                  insertIntoCache(catalystApp, dbResp.date);

                  sendMail(catalystApp, dbResp);

                  res.send('Hurray! It is an escape from office day! It is a holidayyyyyyyy !');



                }

              }

              else {

                console.log(' date not found in db ');

                res.send('Sorry! You have to go to office day');

              }

            })

            .catch(err => {

              console.log("Error in fetching from DB " + err);

            });

        }

      }

    })

    .catch(err => {

      console.log("Error in checking in Cache " + err);

    });

});



function checkPresenceInCache(catalystApp, h_date) {

  console.log("in checkPresenceInCache method for date ... " + h_date);

  return new Promise((resolve, reject) => {

    let cache = catalystApp.cache();

    let segment = cache.segment();



    let cachePromise = segment.getValue("date");

    resolve(cachePromise);

  })

}









function fetchFromDB(catalystApp, h_date) {

  console.log('in fetchFromDB ');

  return new Promise((resolve, reject) => {



    catalystApp

      .zcql()

      .executeZCQLQuery("Select * from HolidayList where date='" + h_date + "'")

      .then(queryResponse => {

        resolve(queryResponse[0].HolidayList);



      })

      .catch(err => {

        resolve(null);

      });

  });

}



function sendMail(catalystApp, dbResp) {

  //Create a config object with the email configuration

  console.log(" in sendmail ..... " + dbResp);

  console.log(" in mail stringified " + JSON.stringify(dbResp));

  let config = {

    from_email: "shankarr+1002@zohocorp.com",

    to_email: "shankarr+1002@zohocorp.com",

    subject: "Holiday Detail",

    content: dbResp.date + " -- " + dbResp.name + " --- " + dbResp.description

  };



  let email = catalystApp.email();

  let mailPromise = email.sendMail(config);

  mailPromise.then(mailObject => {

    console.log("Mail Sent");

  });

}



function insertIntoCache(catalystApp, dbRespDate) {

  console.log("in insertIntoCache ");

  let cache = catalystApp.cache();

  let segment = cache.segment();

  let cachePromise = segment.put("date", dbRespDate);

  cachePromise.then(entity => {

    console.log("Cache updated ...." + entity);

  });

}





function checkDBInsertStatus(catalystApp) {

  console.log(' in checkDBInsertStatus ');

  return new Promise((resolve, reject) => {

    let zcql = catalystApp.zcql();

    let zcqlPromise = zcql.executeZCQLQuery("select * from HolidayList");

    zcqlPromise.then(queryResult => {

      console.log('db rows are ' + queryResult.length);

      if (queryResult.length == 0) {

        resolve(queryResult);

      }



    }).catch(err => {

      reject(err);

    })

  });

}

module.exports = app;









This is quite interesting. Let us look at it closely.

So first things first.

We are using express and axis packages for this program. So we invoke them.

As we are dealing with Catalyst, we need to have the node sdk of catalyst involved. Hence we add that.


Have a look at the /getDetails method. We initialise the catalystApp and then we make a GET request to the API exposing the list of US Holidays.



Then we check if the database already has the data filled in it with the checkDBInsertStatus() . If there are no rows, then we know that we can insert to the table HolidayList.



Then using Axios we make a call the API exposing the list of holidays.

We parse the response and insertToDB and also simultaneously build the client and send the response to the Client where it is rendered in the holiday_Details div.



Now we have the holidays listed in front of us.



Now we enter any date in the text field and then click on the Holiday? Button to check if that day is a holiday.



When we do that we trigger the check_if_holiday method in the index.js file.



The first thing we do is to check if the date is present in the Cache. If not, then we go and fetch the data from the database using the fetchFromDB() method. If the data is found then we inform the client about the joyous news and we also simultaneously update the data in the cache. 



We do this so that the next time some enquiry comes, we can directly pick it up from the cache and avoid a db query. This improves efficiency and response time. Also we sendMail about the leave details as well. 



Else we have to inform the less-joyous news about going to office ;-) !



Keep in mind that in a server less computing environ, you do not start the server. Hence you need to package the code inside the 

module.exports = app line. This is the most important line else your program will NOT run.





M. Now, before we go trigger-happy, we need to install the various packages that we have used. Remember, we are doing heart-surgery here ;-) so we need to get all the relevant packages. 

So now we need to install packages used in the code here as follows :-

 npm install —save express

 npm install —save axios



N. Now we are ready to run the program.



There are 2 ways of testing this. We can test in live or we can test locally. It often makes sense to test locally so that we can fix the errors if any and then push it to server.





Catalyst serve



This will show us the following -

shankarr-0701@shankarr-0701 holidayListing % catalyst serve



ℹ server will start at port 3000

ℹ you can test your applogic[holiday_listing] with URL : http://localhost:3000/server/holiday_listing

ℹ you can test your client[HolidayClient] with URL : http://localhost:3000/app/







So now we can go to http://localhost:3000/app/ and see our creation!

<Take screenshot pls>



So now we see it working in our test setup.



Now let us deploy on the server. Ready?



shankarr-0701@shankarr-0701 holidayListing % catalyst deploy   



ℹ functions(holiday_listing): URL => https://holidaylisting-698653107.development.zohocatalyst.com/server/holiday_listing/

✔ functions(holiday_listing): deploy successful



✔ client: deploy successful

ℹ client: URL => https://holidaylisting-698653107.development.zohocatalyst.com/app/index.html





This will take sometime to respond as deploying on the server takes time. In a little over say 15secs, you will see the following on your screen.



So that is about it. Now, take the client URL that is -https://holidaylisting-698653107.development.zohocatalyst.com/app/index.html

Paste this in a new tab in the browser and .. Voila! Your app is live now.

