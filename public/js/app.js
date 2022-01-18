function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

function getSendedEmails() {
  $.ajax({
    url: `${window.location.origin}/api/email/sended`,
    method: "GET",
    timeout: 0,
    headers: {
      Authorization: "Bearer " + getCookie("uid"),
    },
  }).done((response) => {
    $("#emails").empty();
    response.data.forEach((mail) => {
      $("#emails").append(`<div>
			<p>To: ${mail.to_email}</p>
			<p>Subject: ${mail.subject}</p>
			<p>Text: ${mail.html}</p>
			<p>-------</p>
			</div>`);
    });
  });
}

function getReceivedEmails() {
  $.ajax({
    url: `${window.location.origin}/api/email/refresh_list`,
    method: "GET",
    timeout: 0,
    headers: {
      Authorization: "Bearer " + getCookie("uid"),
    },
  }).done((response) => {
    $.ajax({
      url: `${window.location.origin}/api/email/received`,
      method: "GET",
      timeout: 0,
      headers: {
        Authorization: "Bearer " + getCookie("uid"),
      },
    }).done((response) => {
      $("#emails").empty();
      response.data.forEach((mail) => {
        $("#emails").append(`<div>
				  <p>To: ${mail.to_email}</p>
				  <p>Subject: ${mail.subject}</p>
				  <p>Text: ${mail.html}</p>
				  <p>-------</p>
				  </div>`);
      });
    });
  });
}
