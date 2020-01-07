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

   
  var temp = "";
  //Initialize Catalyst SDK

  var catalystApp = catalyst.initialize(req);

  
  const requestUrl =
    "https://calendarific.com/api/v2/holidays?&api_key=cd4033621a91a04976ebacfdd6a6d711d3569350&country=US&year=2019";



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
