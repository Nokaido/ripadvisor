
var DB = require('./modules/DataBase');
var step, webScraper;

var locations = getLocations();
console.log(locations);

var phantom = require('phantom');

webScraper = function(phantom, callbackInfo, callBackEnd)
{
	

phantom.create(function(ph) 
	{

	return ph.createPage(function(page) 
		{
		var temp = new Array();
		var url = "http://www.tripadvisor.com/RestaurantSearch?geo=32655&q=" + locations[0] + "=&pid=";
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
						return page.evaluate(function() {
							// Get what you want from the page using jQuery. A
							// good way is to populate an object with all the
							// jQuery commands that you need and then return the
							// object.
							var adr = new Array();

							// page.render('test.png');

							/* Sitecount: $('.paging.pageDisplay').text()
							 *
							 * Nextpage:
							 * $('guiArw.sprite-pageNext').attr('href') ->
							 * adresse
							 */

							$('.listing').each(function(){ adr.push("http://www.tripadvisor.com"+ $(this).find('.quality.easyClear>a').attr('href'));});

							return adr;
						}, function(result) 
						{
							console.log(result);
							ph.exit();
						});
					}, 5000);

				});
		});
	});
});
};