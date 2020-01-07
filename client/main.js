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



