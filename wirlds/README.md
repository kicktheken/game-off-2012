# Wirlds (Github Gameoff 2012 version)

Wirlds is a game where your hero explores a procedurally generated world to gather resources to craft the Branch of Nordrassil. [The game is hosted here.](http://ihasacode.com/wirlds/)

<img src="http://i.imgur.com/PWTem.jpg" style="border:0">

## Gameplay Notes
* Treasure chests increase your line of sight as well as increase your final score
* Your final score is inversely proportional to the distance your hero traveled plus the amount of treasure chests found
* Ores randomly give you a nonwood resource or none at all
* Crystals correspond to one of the five environments you'll encounter (badlands, desert, grassland, forest, tundra).
* Gold, sulfur, mercury, and gems appear at increasing altitudes away from water in that order
* You can cheat by adding `?mapreveal` in front of the url as a GET parameter (.ie http://localhost/wirlds?mapreveal)
* You can revisit a certain world by copying the seed number and putting it as your GET parameter (.ie http://localhost/wirlds/?1354314043038)

## Setup

Download image assets [here](http://dl.dropbox.com/u/1065170/img.tar.gz) and save them to wirlds/client/img. This is because these are various sprites taken from Heroes of Might and Magic&#174; 3, World of Warcraft&#174;, and [BrowserQuest](http://browserquest.mozilla.org/). Then simply run the game by pointing your web server to wirlds/client. Tested on various platforms:
*iOS 5, 6 on iPhone 4, 4S, 5
*Android 2.3, 3.1, 4.1 on various tablets and mobile devices
*IE 9, Chrome 21+, Firefox 16+, Safari 6.0+

Alternatively, you can build a minified version by simply running `sh wirlds/build.sh` and will create a `clientbuild` directory that can run the game

## Credits
*[Johannes Baagøe](baagoe@baagoe.org) for the [Alea Javascript PRNG](http://baagoe.org/en/w/index.php/Better_random_numbers_for_javascript#Alea)
*[Jonas Wagner](http://29a.ch/) for the [javascript simplex-noise library](https://github.com/jwagner/simplex-noise.js)
*[Brian Grinstead](http://www.briangrinstead.com/blog/) for [Tinycolor](http://bgrins.github.com/TinyColor/) and [javascript-astar](https://github.com/bgrins/javascript-astar)

