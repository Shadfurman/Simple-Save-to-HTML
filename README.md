# Simple Save to HTML

![](SSHTML_icon.png)

I tried to get this installed through the Google extensions store, it was an incredible pain in the ass trying to jump through their hoops with vauge instructions. If someone wants to do it and let me know so I can share, that would be great. There is no liscense, "Do what thou wilt with this code shall be the whole of the liscence."

I made this because I wanted to be able to save a Google docs document as simple, clean, HTML that would be easy to integrate into my website, for blogs and the like. It only does the headings formatting at the moment, mostly because thats what I use. I tried to do inline text formatting, but I couldn't figure it out without going character by character. This will give you plain HTML code of your document. You can optionally get the code wrapped in an \<article> tag, the headers for a whole webpage. It renders fairly close to the Google docs formatting without CSS, but if you want it nearly identical (I can't tell the difference) there is also CSS code that should "just work" if you select "Full page HTML" save it both the HTML and CSS to the same directory.

To install, click on Extentions in the Menu bar of a Google doc you're working on, select Apps Script, you need two files one names Code.gs, and one named SaveDialog.html. I don't know how case senstitive it is, so just to be sure, make it the exact same case. Copy and paste the contents of those to files, close the Apps Script page to return to your Google doc, and there should be a new Menu item named Simple HTML.

Good luck, best wishes.
