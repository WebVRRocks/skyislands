# skyislandsvr

Greetings, fellow VR-heads!

I will be adding a how-to guide for people interested in developing their own VR app with GearVR and Unity, and also describing my experiences with learning to produce VR content.

Project updates on the SkyIslands game will be posted on
__www.skyislandsvr.com__


## Local development

First, clone this repo:

```bash
git clone git@github.com:321C4/skyislandsvr.com.git && cd skyislandsvr.com
```

You'll need a local development server to work on this project.

Included in this repo is a Browsersync server that out of the box handles live-reloading and tunnelling (useful for loading sites on other networks and mobile devices).

To install the [Node](https://nodejs.org/en/download/) dependencies:

```bash
npm install
```

To start the server:

```bash
npm start
```

If you'd rather not depend on Node, there are [several other options of running the content locally](https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally).
