const urlParams = new URLSearchParams(window.location.search);

if (!urlParams.get("redirect") && getCookie("uid"))
  window.location = window.location.origin;

$("#login-btn").prop(
  "disabled",
  !(
    /^[\w](?!.*?\.{2})[\w.]{2,28}[\w]$/.test($("#username").val()) &&
    $("#password").val().length >= 5
  )
);
$("input").keyup(() => {
  $("#login-btn").prop(
    "disabled",
    !(
      /^[\w](?!.*?\.{2})[\w.]{2,28}[\w]$/.test($("#username").val()) &&
      $("#password").val().length >= 5
    )
  );
});

$("#username").bind("keypress", function (event) {
  var regex = new RegExp("^[a-zA-Z0-9._]+$");
  var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
  if (!regex.test(key)) {
    event.preventDefault();
    return false;
  }
});

$(document).on("keypress", function (e) {
  if (e.which == 13) login();
});

function login() {
  if (
    /^[\w](?!.*?\.{2})[\w.]{2,28}[\w]$/.test($("#username").val()) &&
    $("#password").val().length >= 5
  ) {
    $.ajax({
      url: `${window.location.origin}/api/auth/login`,
      method: "POST",
      timeout: 0,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        username: $("#username").val(),
        password: $("#password").val(),
      }),
    })
      .done((response) => {
        if (response.success) {
          if ($("#stay-logged").is(":checked"))
            setCookie("uid", response.data.token, 14);
          else setSessionCookie("uid", response.data.token);
          if (urlParams.get("redirect") != null) {
            var url = new URL(decodeURI(urlParams.get("redirect")));
            url.searchParams.append("token", response.data.token);
            window.location = url.toString();
          } else {
            window.location = window.location.origin;
          }
        }
      })
      .fail((error) => {
        $("#error").text(error.responseJSON.error);
        console.log(error.responseJSON);
      });
  }
}

function setSessionCookie(cname, cvalue) {
  document.cookie = cname + "=" + cvalue + ";path=/";
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

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
