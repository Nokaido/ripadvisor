///**
// * New node file
// */
 var phantom = require('phantom');
 phantom.create(function(ph) {
   return ph.createPage(function(page) {
     return page.open("http://www.tripadvisor.com/Restaurant_Review-g32655-d2439499-Reviews-Baco_Mercat-Los_Angeles_California.html", function(status) {
       console.log("opened site? ", status);         
       
             page.injectJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() 
            	 {
             
                 //jQuery Loaded.
                 //Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.
                 setTimeout(function() 
                	 {
                 
                	 
                	 
                	 var elementOffset = page.evaluate(function() 
                		 {
                		 var temp = new Array();
                		 
                		 $('.moreLink').each(function()
                			 {
                			 	temp.push($(this).attr('onclick'));
                			 }); 
                		 return temp;
                		/// });
                	 console.log(elementOffset);
                	// 
                	 
                	 

                     /*return page.evaluate(function() 
                    	 {*/
  
                         //Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object.
                         var temp = new Array();
                         //ta.call('ta.servlet.Reviews.expandReviews',event,this,'review_172434118', '1', 4444);
                         //$('.moreLink:first').select();
  
                        // return temp;
                     	}, function(result) {
                     		//page.sendEvent('click', result.left + 1, result.top + 1);
                    	 //page.sendEvent('keypress', 'Enter', null, null);
                         console.log(result);
                         console.log('gohghfkhgtfikutfoufoutfluzfozlhvfofuvogvfuhgfgv');
                         console.log('gohghfkhgtfikutfoufoutfluzfozlhvfofuvogvfuhgfgv');
                         console.log('gohghfkhgtfikutfoufoutfluzfozlhvfofuvogvfuhgfgv');
                         page.render('testx.png');
                         console.log('done');
                         ph.exit();
                     });
                 }, 5000);
  
             });
     });
     });
 });

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

//var db = require("./modules/DataBase");
//
//var next = function()
//{
//		console.log("hui");
//		db.getFirstRawResult(function(err, row)
//			{
//				console.log(row);
//				
//				return result(row[0]);
//			});
//		console.log("holla");
//		
//
//	console.log("ende");
//	return;
//};
//
//var result = function(res)
//{
//	console.log("here is your result " + res.res_adress);
//};
//
//return next(0);
//console.log("aus");


