<template></template>

<script>
$("#btnLogin").click(function () {
    var url =
        "http://web.fc.utm.my/ttms/web_man_webservice_json.cgi?entity=authentication&login=" +
        $("#login").val() +
        "&password=" +
        $("#password").val();
    fetch(url)
        .then((res) => res.json())
        .then((jsonInst) => {
            alert("Success login to the system!");
            localStorage.setItem(
                "web.fc.utm.my_usersession",
                JSON.stringify(jsonInst[0])
            );
            window.location.replace("ttms-main.html");
        })
        .catch((err) => {
            alert("Invalid credential!");
            console.error(err);
        });
});
</script>
