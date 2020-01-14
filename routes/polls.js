const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const dbParams = require("../lib/db.js");
const db = new Pool(dbParams);
db.connect();

// Resource: poll
// get all GET     /polls/new
// get     GET     /polls/:id
// create  POST    /polls/new
// delete  DELETE  /polls/:id
// update  PUT     /polls/:id

// Helper Functions --------------------------------------------------------------------
// Generate 6 random alphanumeric characters
const generateRandomString = function() {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let length = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * length));
  }
  return result;
};

// Add polls by inserting a new poll into database
const addPoll = data => {
  let pollURL = String(generateRandomString());
  const dataValues = [
    // data.id,
    pollURL,
    data.title,
    data.description,
    data.creator_name,
    data.creator_email
  ];
  console.log(dataValues, '<--- data values')
  const dataQuery = `INSERT INTO polls
  (id, title, description, creator_name, creator_email)
  VALUES ($1,$2,$3,$4,$5)
  RETURNING * ;`;

  return db.query(dataQuery, dataValues)
   .then(res => {
    console.log('This is res.rows!!!!' + res.rows);
    return res.rows[0]});
};

// Returns the whole table data in an array
const getTableDataByRow = function(url) {
  const dataQuery =
  `SELECT submissions.submitter_name as name, poll_options.date_option as date, poll_options.time_option as time, submission_responses.submission_response as true_false
  FROM polls
  JOIN poll_options ON polls.id = poll_id
  JOIN submission_responses ON poll_option_id = poll_options.id
  JOIN submissions ON submission_id = submissions.id
  WHERE polls.id = $1;`;

  return db.query(dataQuery, [url])
  .then(res => {
    console.log(res.rows, '<--- tableData values');
    return res.rows;
  });
};

const checkIfPollIdExists = (id) => {
  const idQuery =
  ` SELECT id
    FROM polls
    WHERE id =  $1;`;

  return db.query(idQuery, [id])
  .then(res => {
    console.log(res.rows,'<--- data values');
    return res.rows.length === 1});
};

const getDate = (dateTime) => {
  dateTimeArray = dateTime.split('T');
  return dateTimeArray[0];
};

const getTime = (dateTime) => {
  dateTimeArray = dateTime.split('T');
  return dateTimeArray[1];
};



// Routes -----------------------------------------------------------------------
module.exports = db => {
  // CREATE New Poll
  router.post("/", (req, res) => {
    // Get poll data from form
    addPoll({ ...req.body })
      .then(poll => {
        res.redirect(`/${poll.id}`)})
      .catch(e => {
        console.error(e);
        res.send(e);
      });


  });

  // Polls Submission
  router.post("/submit", (req, res) => {
///check
     res.redirect(`/${pollURL}`); //polls.id
  });

  // UPDATE Polls
  router.post("/update", (req, res) => {
    res.redirect(`/${pollURL}`); //polls.id
  });



  // GET Polls (home route)
  router.get("/new", (req, res) => {
    res.render("index");
  });
   // GET Polls (home route)
   router.get("/", (req, res) => {
    res.redirect('/new')
  });

  // GET polls/randomURL (generated polls page)
  router.get("/:pollURL", (req, res) => {

    checkIfPollIdExists(req.params.pollURL)
    .then((exists) => {
      if (exists) {

        getTableDataByRow(req.params.pollURL)
        .then(tableData => {
          console.log(tableData, '<--- tableData again');



          res.render("show");
          });
      } else {
        res.redirect('/polls/new');
        return null;
      }
    })
    .catch(e => {
      console.error(e);
      res.send(e);
    });
  });
  return router;
};

