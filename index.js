var creatorOptions = {};
var creator = new SurveyCreator.SurveyCreator("creatorElement", creatorOptions);
var authToken = "tvqazq6ElMKZBEQJnN6oatOZS4TRrOUY";
Survey.ChoicesRestfull.onBeforeSendRequest = function(sender, options) {
  options.request.setRequestHeader("APIkey", authToken);
};


const surveyJson = {
    elements: [{
        name: "FirstName",
        title: "Enter your first name:",
        type: "text"
    }, {
        name: "LastName",
        title: "Enter your last name:",
        type: "text"
    },  {
        "type": "dropdown",
        "name": "Mentors",
        "title": "Select a Mentor",
        "description": "A full list of countries is queried from a RESTful web service.",
        "choicesByUrl": {
          "url": "https://apim.quickwork.co/Quickwork2/test/v1/get-mentors",
          "path": "data",
          "valueName": "Mentor"
        
        }
      }, {
        "type": "dropdown",
        "name": "Slots",
        "title": "Select a Slot",
        "description": "A full list of slots for user is queried from a RESTful web service.",
        "choices": []
      }]
};

const survey = new Survey.Model(surveyJson);

document.addEventListener("DOMContentLoaded", function() {
    survey.render(document.getElementById("surveyContainer"));
});

survey.onValueChanged.add(function(sender, options) {
    if (options.question.name == 'Mentors') {
        const mentorName = sender.data["Mentors"];
        
        fetch(`https://apim.quickwork.co/Quickwork2/test/v1/post/slots`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'APIkey': authToken
            },
            body: JSON.stringify({ mentorName: mentorName })
        })
        .then((res) => res.json())
        .then((response) => {
            const slotQuestion = sender.getQuestionByName("Slots");
            slotQuestion.choices = response.data.map((res) => {
                return { value: res['Time Slot'], text: res['Time Slot'] };
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
    const results = JSON.stringify(sender.data);
    data = {
        
            "mentor": sender.data['Mentors'],
            "date": "09/05/2024",
            "slot": sender.data['Slots'],
            "bookedBy": sender.data['FirstName'] + ' ' + sender.data['LastName'] 
          

    }
    fetch(`https://apim.quickwork.co/Quickwork2/test/v1/post/booking-info`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'APIkey': authToken
        }, 
        body: JSON.stringify(data)

    })
    .then((res) => res.json())
    .then((response) => {
        if (response.data.success == true) {
            alert("Booking Successful")
        } else {
            alert("Booking Failed")
        }
    }).catch((err) => {
        console.error(err);
    })

}
