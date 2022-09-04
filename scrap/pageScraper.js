const scraperObject = {
	url: 'https://twitter.com/search?q=%23claudiasheinbaum&src=typeahead_click',
	async scraper(browser) {
		let page = await browser.newPage();
		await page.setViewport({
			width: 1920,
			height: 900,
		});
		await page.goto(this.url);

		// Wait for the required DOM to be rendered
		await page.waitForSelector('article');
		await page.screenshot({path: 'example.png'});

		let count = 1;
		let yOffsetMap = [];
		while(count <  5) {
			count++
			await autoScroll(count, page, yOffsetMap)
			// const profile = await page.evaluate(() => {
			// 	const $ = (selector) => document.querySelector(selector);
	
			// 	return {
			// 		profileName: $('[data-testid="UserName"] div span').innerText,
			// 		username: $('[data-testid="UserName"] div:nth-of-type(2) span').innerText,
			// 		followers: $('a[href$="/followers"]').innerText,
			// 		following: $('a[href$="/following"]').innerText,
			// 	};
			// })
	
			const tweets = await page.evaluate(() => {
				return [...document.querySelectorAll("article")].map((el) => {
					const data =  {
						text: el.querySelector('[data-testid="tweetText"]').innerText,
						submitted: el.querySelector("time").dateTime,
						replies: el.querySelector('[data-testid="reply"]').innerText,
						retweets: el.querySelector('[data-testid="retweet"]').innerText,
						likes: el.querySelector('[data-testid="like"]').innerText,
					};
					if(data.likes > 20) {
						return data
					}
				});
			})
	
			// const metrics = await page.evaluate(() => {
			// 	return [...document.querySelectorAll("article")].map((el) => {
			// 		return {
			// 			submitted: el.querySelector("time").dateTime,
			// 			replies: el.querySelector('[data-testid="reply"]').innerText,
			// 			retweets: el.querySelector('[data-testid="retweet"]').innerText,
			// 			likes: el.querySelector('[data-testid="like"]').innerText,
			// 		};
			// 	});
			// })

			console.log("results", tweets)
		}


	}
}

async function autoScroll(num_scrolls, page, yOffsetMap) {
	let offsets = await page.evaluate(async (num_scrolls) => {
	  return await new Promise((resolve, reject) => {
		var distance = 100;
		var scrollCount = 0;
		var totalHeight = 0;
		var timer = setInterval(() => {
		  scrollCount++;
  
		  window.scrollBy(0, distance);
  
		  totalHeight += distance;
		  if (scrollCount >= num_scrolls) {
			clearInterval(timer);
			resolve(window.pageYOffset);
		  }
		}, 100);
	  });
	}, num_scrolls);
	yOffsetMap = yOffsetMap.map((e) => {
	  if (e.id === page.mainFrame()._id) {
		if (!e.offsets) e.offsets = [];
		e.offsets.push(offsets);
		return { id: e.id, offsets: e.offsets };
	  }
	  return e;
	});
  }

module.exports = scraperObject;