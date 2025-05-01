<template>
    <body
        class="bg-[url('https://www.transparenttextures.com/patterns/beige-paper.png')] bg-repeat min-h-screen flex items-center justify-center px-4"
    >
        <div
            class="w-full max-w-xs bg-[#e0c28b] p-6 rounded-2xl shadow-lg text-center"
        >
            <img
                src="images/UTM-LOGO-FULL.png"
                alt="UTM Logo"
                class="mx-auto w-20 mb-2"
            />
            <h1 class="text-3xl font-bold text-[#730000] tracking-wide mb-1">
                UTM
            </h1>
            <p class="text-[#730000] font-semibold text-sm -mt-2 mb-4">
                UNIVERSITI TEKNOLOGI MALAYSIA
            </p>

            <h2 class="text-xl font-bold text-[#730000] mb-2">TTMS-FK</h2>
            <button
                class="bg-[#730000] text-white px-4 py-1 rounded-full mb-4 shadow"
            >
                Staff/Pelajar
            </button>

            <div class="mb-3 text-left">
                <label class="text-sm font-bold text-gray-700">Login</label>
                <input
                    type="text"
                    id="login"
                    value="A16CS4016"
                    class="w-full px-3 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#730000]"
                />
            </div>
            <div class="mb-4 text-left">
                <label class="text-sm font-bold text-gray-700">Password</label>
                <input
                    type="password"
                    id="password"
                    value="201608M10112"
                    class="w-full px-3 py-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#730000]"
                />
            </div>
            <button
                id="btnLogin"
                class="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded w-full"
            >
                Submit
            </button>
        </div>
    </body>
</template>

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
