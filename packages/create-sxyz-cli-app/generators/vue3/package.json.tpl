{
  "name": "<%= name %>",
  "version": "1.0.0",
  "description": "",
  "main": "lib/<%= name %>.js",
  "module": "es/index.js",
  "style": "lib/index.css",
  "typings": "lib/index.d.ts",
  "files": [
    "lib",
    "es"
  ],
  "scripts": {
    "dev": "sxyz-cli dev",
    "lint": "sxyz-cli lint",
    "test": "sxyz-cli test",
    "build": "sxyz-cli build",
    "build:site": "sxyz-cli build-site",
    "release": "sxyz-cli release --tag next",
    "release:site": "pnpm build:site && npx gh-pages -d site-dist",
    "test:watch": "sxyz-cli test --watch",
    "test:coverage": "open test/coverage/index.html"
  },
  "author": "",
  "nano-staged": {
    "*.md": "prettier --write",
    "*.{ts,tsx,js,vue,less,scss}": "prettier --write",
    "*.{ts,tsx,js,vue}": "eslint --fix"
  },
  "peerDependencies": {
    "vue": "^3.3.4"
  },
  "devDependencies": {
    "@sxyz/cli": "*",
    "vue": "^3.3.4",
    "sass": "^1.49.7"
  },
  "eslintConfig": {
    "root": true,
    "extends": [
      "@sxyz"
    ]
  },
  "prettier": {
    "singleQuote": true
  },
  "browserslist": [
    "Chrome >= 51",
    "iOS >= 10"
  ]
}
