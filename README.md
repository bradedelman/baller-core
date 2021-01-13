# Baller Views (Alpha 0.1)



## Getting Started with Writing Views 
Now that you've seen the sample running on Android, iOS and Web, lets takea look at the sample View itself and learn how we can edit, transpile and run.

1. Start the Local Transpile Server


	To make it easy to iterate, we use a simple local Python server that knows how to run the TypeScript compiler and serve the results.
	
	````
	cd baller-core          (wherever you cloned it)
	python3 server.py       (python3 should already be installed on OSX)
	
	when it starts, it will print to the console
	
	Starting Baller Transpile Server on Port 3000...	````

2. Let's modify 1 or more sample apps to use the locally served script.  Basically, we just need to update the URL for where to get the script (note the change from https to http as well):

	````
	Android
	
	in MainActivity, change:
   val contents = URL("https://www.cleverfocus.com/baller/sample.js").readText()
   to
   val contents = URL("http://127.0.0.1:3000/sample.js").readText()
	````   

	````
	iOS

	in ViewController, change:
   if let url = URL(string: "https://www.cleverfocus.com/baller/sample.js") {
	to
   if let url = URL(string: "http://127.0.0.1:3000/sample.js") {
	````
	
	````
	Web
	
	in index.html, change:
	baseUrl: 'https://www.cleverfocus.com/baller/'
	to
	baseUrl: 'http://127.0.0.1:3000/'
	change
	````
	
3. Now run and see that everything is the same as before (list of 1,000 items). Yay! Ok, now let's try some changes to the view.	
4. Open the sample code.  While technically, you could just edit sample.ts in any text editor, I recommend opening the baller-core directory as a Project in IntelliJ.  IntelliJ understand TypeScript and will provide syntax checking, coloring, code validation, etc.

	Once it is open, you can select the sample.ts file and you should see this:

	![](README_Images/IntelliJProject.png) 

5. 	Let's make a simple change.  Change "Hello Baller" to "Hello World"

6. Ok, refresh index.html (or re-run your iOS/Android app) - it's changed!

	Obviously, hitting refresh in the brower is fastest/easiest.  In fact, the reason the Web Platform is supported for this Framework which is meant for Android/iOS is for development velocity and quick iterations.

### That's it!  Easy iterations :-)  Docs coming soon on the View types and richer examples.