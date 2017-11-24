Web interface for the VAMDC query store
=============================================

Javascript
-----------

The site is displayed thanks to bundle.js script in static/javascript

	build.js is built from main.js using packages imported with npm

required packages : 
react, react-dom, jquery, classnames, moment, react-datetime, bibtex-parser, babelify, babel-preset-es2015, babel-preset-react

the build procedure uses browserify :

	- browserify -t [ babelify --presets [ es2015 react ] ] ./main.js -o ./bundle.js

Deployment instructions
------------------------

1. Build javascript application with :

  - build.sh : build a dev version with React errors and warnings

  - build_prod.sh : build a prod version without warnings but quicker

Both are located in  ROOT_DIRECTORY/web/javascript directory

2. Make the web directory available from a web server ( public_html , /var/www, ...)


Notes
-----

- References of a query in the website are not shown if there is neither article title nor journal name


