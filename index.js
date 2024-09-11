var creatorOptions = {};
var creator = new SurveyCreator.SurveyCreator("creatorElement", creatorOptions);
var authToken = "tvqazq6ElMKZBEQJnN6oatOZS4TRrOUY";
Survey.ChoicesRestfull.onBeforeSendRequest = function (sender, options) {
  options.request.setRequestHeader("APIkey", authToken);
};

var getMentorsArray = [];

const surveyJson = {
  elements: [
    {
      name: "FirstName",
      title: "Enter your first name:",
      type: "text",
    },
    {
      name: "LastName",
      title: "Enter your last name:",
      type: "text",
    },
    {
      type: "dropdown",
      name: "Mentors",
      title: "Select a Mentor",
      description:
        "A full list of countries is queried from a RESTful web service.",
      choices: [],
    },
    {
      type: "dropdown",
      name: "Slots",
      title: "Select a Slot",
      description:
        "A full list of slots for user is queried from a RESTful web service.",
      choices: [],
    },
  ],
};

const survey = new Survey.Model(surveyJson);

document.addEventListener("DOMContentLoaded", function () {
  survey.render(document.getElementById("surveyContainer"));

  fetch(`https://apim.quickwork.co/Quickwork2/test/v1/get-mentors`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      APIkey: authToken,
    },
  })
    .then((res) => res.json())
    .then((response) => {
      getMentorsArray = response.data;
      temp = response.data;
      const data = {};
      for (let i = 0; i < temp.length; i++) {
        if (
          data.hasOwnProperty(temp[i].Mentor) == false &&
          temp[i].Availability == "TRUE"
        ) {
          data[temp[i].Mentor] = "exist";
        }
      }
      console.log(data);
      const filteredMentors = Object.keys(data);
      survey.getQuestionByName("Mentors").choices = filteredMentors;
    });
});

survey.onValueChanged.add(function (sender, options) {
  if (options.question.name == "Mentors") {
    const mentorName = sender.data["Mentors"];

    fetch(`https://apim.quickwork.co/Quickwork2/test/v1/post/slots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        APIkey: authToken,
      },
      body: JSON.stringify({ mentorName: mentorName }),
    })
      .then((res) => res.json())
      .then((response) => {
        const slotQuestion = sender.getQuestionByName("Slots");
        const filteredSlots  = response.data.filter((slot) => {
          return slot.Availability == true;
        })
        console.log(filteredSlots);
        slotQuestion.choices = filteredSlots.map((res) => {
          return { value: res["Time Slot"], text: res["Time Slot"] };
        });

        slotQuestion.visible = false;
        slotQuestion.visible = true;
      })
      .catch((error) => {
        console.error("Error fetching slots:", error);
      });
  }
});

survey.onComplete.add(alertResults);

function alertResults(sender) {
  let rowValue = 0;
  console.log(getMentorsArray);
  for (let i = 0; i < getMentorsArray.length; i++) {
    if (
      getMentorsArray[i].Mentor == sender.data["Mentors"] &&
      getMentorsArray[i]["Time Slot"] == sender.data["Slots"]
    ) {
      rowValue = parseInt(getMentorsArray[i]["ID"]);
      console.log(rowValue);
      break;
    }
  }

  data = {
    row: rowValue,
    mentor: sender.data["Mentors"],
    date: "09/05/2024",
    slot: sender.data["Slots"],
    bookedBy: sender.data["FirstName"] + " " + sender.data["LastName"],
  };
  console.log(rowValue);
  fetch(`https://apim.quickwork.co/Quickwork2/test/v1/post/booking-info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      APIkey: authToken,
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((response) => {
      console.log(response);
      if (response.success == true) {
        alert("Booking Successful");
      } else {
        alert("Booking Failed");
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

