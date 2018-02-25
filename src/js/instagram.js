var token = "3044031543.ccc9de9.cc907f9298aa4a2fac1183a6e311c61b",
    userid = 3044031543,
    num_photos = 28;

$.ajax({
    url: "https://api.instagram.com/v1/users/self/media/recent",
    dataType: "jsonp",
    type: "GET",
    data: { access_token: token, count: num_photos },
    success: function(data) {
        for (var x in data.data) {
            $(".gallery ul").append('<li><img src="' + data.data[x].images.standard_resolution.url + '"></li>');
        }
    },
    error: function(data) {
        console.log(data);
    }
});