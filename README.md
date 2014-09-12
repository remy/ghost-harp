# Ghost -> Harp

This code will port a Ghost (*dev*) database to static markdown files and prepare the [harp](http://harpjs.com) `_data.json` file for you.

**Disclaimer** I wrote this for my own single use. It's not been battled tested on anything other than my own database, so feel free to fork, fix, tweak, etc to make it more compatible.

## Install

Via npm as a global utility:

```text
npm install -g ghost-harp
```

## Usage

From the command line:

```text
ghost-harp --input <ghost dir> --output <target dir>
```

For example:

```text
ghost-harp --input ../remysharp-ghost/ --output .
```

This will read from `../remysharp-ghost` and look for the `config.js`, then it'll find the `development` sqlite database and output a directory like this:

```text
.
├── harp.json
└── public
    ├── _data.json
    ├── about.md
    ├── blog
    │   ├── 2007-moments.md
    │   ├── 8-questions-after-ie-pissed-the-community-off.md
    │   ├── _data.json
    │   ├── _drafts
    │   │   ├── _data.json
    │   │   ├── my-velveteen-rabbit.md
    │   │   ├── what-went-in-to-remote-tilt-com.md
    │   │   └── why-i-prefer-mobile-web-apps-to-native-apps.md
    │   ├── a-better-twitter-search.md
    │   ├── a-few-more-jquery-plugins-crop-labelover-and-pluck.md
    │   ├── wordpress-smiles.md
    │   ├── wordpress-tagging-and-textmate.md
    │   └── youre-paying-to-speak.md
    ├── talks.md
    └── twitter.md
```