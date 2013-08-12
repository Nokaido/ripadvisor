
var DB = require('./modules/DataBase');
var step, webScraper;

var locations = getLocations();
console.log(locations);

var phantom = require('phantom');

webScraper = function(phantom, locations, callbackInfo, callbackEnd)
{
	var step, scrape, nextPage, first, info;
	first = true;
	var url = "http://www.tripadvisor.com/RestaurantSearch?geo=32655&q=" + locations[0] + "=&pid=";
	
	step = function(newUrl, status, dbinput, ph, siteCount)
	{
		if(status === "success")
		{
			info = DB.insert("rawResults", dbinput);
		}
		
		callbackInfo(status, url, info);
		
		if(status === "success")
		{
			url = newUrl;
			siteCount = siteCount-1;
			console.log(siteCount + " sites to be done!");
		}
		else
		{
			console.log("siteError!");
		}
		return nextPage(ph, siteCount, false);
	};
	
	scrape = function()
	{
		phantom.create(function(ph) 
		{
			return nextPage(ph, 0, true)
		});
	};
	
	nextPage = function(ph, siteCount, first)
	{
		if(first || siteCount > 1)
		{
		
		
		ph.createPage(function(page) 
		{
			
		return page.open(url, function(status) 
				{
				console.log("opened site? ", status);
				
				page.injectJs('./jquery-1.10.2.js', function() 
						{
						// jQuery Loaded.
						// Wait for a bit for AJAX content to load on the page.
						// Here, we are waiting 5 seconds.
						setTimeout(function() 
								{
								
								return page.evaluate(function() 
									{
									// Get what you want from the page using jQuery. A
									// good way is to populate an object with all the
									// jQuery commands that you need and then return the
									// object.
									
									var adr = new Array();
									var res = new Array();
									var newUrl = new Array();
									
									$('.paging.taLnk').each(function(){newUrl.push($(this).attr('href'));});

									if(newUrl.length == 2)
									{
										newUrl = "http://www.tripadvisor.com" + newUrl[0];
									}
									if(newUrl.length > 2)
									{
										newUrl = "http://www.tripadvisor.com" + newUrl[1];
									}
									

									var count = new Array();
										
									$('.paging.taLnk').each(function(){count.push($(this).text());});
									if(count.length > 1)
									{
											count = count[count.length -1];
									}
									
									$('.listing').each(function(){ adr.push("http://www.tripadvisor.com"+ $(this).find('.quality.easyClear>a').attr('href'));});

									res.push(newUrl);
									res.push(count);
									res.push(adr);
									
									
									return res;
									}, function(result) 
										{
										
										if(first)
										{
											siteCount = result[1];
											first = false;
										}
										
										page.close();
										return step(result[0], status, result[2], ph, siteCount);
										});
								}, 5000);

						});
				});
		});
		}
		else
		{
			return callbackEnd(ph);
		}
	}


	return scrape();
};

webScraper(phantom, locations, (function(status, url, dbinfo)
		{
			/* callbackInfo */
    		if (status !== "success") {
    			return console.log("Unable to connect to '" + url + "'");
    		} else {
    			return console.log("Page loadet and scraped: '" + url + " DB: " + dbinfo);
    		}
		}), (function(ph)
				{
					/* callbackEnd */
					return ph.exit();
				}));


function getLocations() {
	var search = require('./input/searchInput.json');
	var locations = new Array();

	for ( var item in search["search"]) 
	{
		locations.push(search["search"][item]["location"]);
	}

	return stringManipulator(locations);
}

function stringManipulator(locations) {
	for ( var item in locations) {
		locations[item] = locations[item].replace(/,/g, "%2C");
		locations[item] = locations[item].replace(/ /g, "+");
	}
	return locations;
}




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
