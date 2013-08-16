///**
// * New node file
// */
// var phantom = require('phantom');
// phantom.create(function(ph) {
//   return ph.createPage(function(page) {
//     return page.open("http://tilomitra.com/repository/screenscrape/ajax.html", function(status) {
//       console.log("opened site? ", status);         
//       
//             page.injectJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {
//                 //jQuery Loaded.
//                 //Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.
//                 setTimeout(function() {
//                     return page.evaluate(function() {
//  
//                         //Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object.
//                         var h2Arr = [],
//                         pArr = [];
//                         pArr.push('hallo');
//                         $('h2').each(function() {h2Arr.push($(this).html());});
//                         $('p').each(function() { pArr.push($(this).html());});
//  
//                         return {
//                             h2: h2Arr,
//                             p: pArr
//                         };
//                     }, function(result) {
//                         console.log(result);
//                         ph.exit();
//                     });
//                 }, 5000);
//  
//             });
//     });
//     });
// });

// page.render('test.png');
// var phantom = require('phantom');
// phantom.create(function(phantomjs)
// {
// return phantomjs.createPage(function(page)
// {
// return page.open("http://www.google.de", function(status)
// {
// console.log("opened google? ", status);
// return page.evaluate(function()
// {
// return document.title;
// },
// function(result)
// {
// console.log("page title is " + result);
// return phantomjs.exit();
// });
// });
// });
// });
// 'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js'


//db = require('./modules/DataBase');
//
//var temp = new Array();
//temp.push("http://www.tripadvisor.com/Restaurant_Review-g32655-d2439499-Reviews-Baco_Mercat-Los");
//
//db.insert("rawResults", temp);

var db = require("./modules/DataBase");

var next = function()
{
		console.log("hui");
		db.getFirstRawResult(function(err, row)
			{
				console.log(row);
				
				return result(row[0]);
			});
		console.log("holla");
		

	console.log("ende");
	return;
};

var result = function(res)
{
	console.log("here is your result " + res.res_adress);
};

return next(0);
console.log("aus");


