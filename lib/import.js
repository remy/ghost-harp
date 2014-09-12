var sqlite3 = require('sqlite3');
var fs = require('then-fs');
var path = require('path');
var Promise = require('promise');
var moment = require('moment');
var config = {};
var data = {
  blog: {},
  draft: {},
  page: {}
};

function slug(s) {
  return s.toLowerCase().trim().replace(/([^a-z0-9-\s]|[-+])/g, '').replace(/\s+/g, '-');
}

function write(type) {
  return function () {
    var dirs = [config.output, 'public'];

    if (type === 'blog' || type === 'draft') {
      dirs.push('blog');
    }

    if (type === 'draft') {
      dirs.push('_drafts');
    }

    dirs.push('_data.json')

    var dir = path.resolve.apply(path, dirs);

    console.log('writing %s config to %s', type, dir);

    return fs.writeFile(dir, JSON.stringify(data[type], '', 2), 'utf8');
  };
}

function save(tags) {
  return function saveRow(error, row) {
    var md = !!row.markdown;
    var ext = '.' + (md ? 'md' : 'html');
    var body = md ? row.markdown : row.html;

    body = '# ' + row.title + '\n\n' + body;

    var post = {};
    post.title = row.title;
    post.date = moment(row.created_at).zone(0).format('YYYY-MM-DD HH:mm:ss');
    post.published = row.status === 'published';

    if (row.slug.indexOf('temp-slug') === 0) {
      row.slug = slug(row.title);
    }

    post.tags = tags[row.id];

    console.log(post.tags);

    var dirs = [config.output, 'public'];

    if (row.page !== 1) {
      dirs.push('blog');
      if (post.published) {
        data.blog[row.slug] = post;
      } else {
        dirs.push('_drafts');
        data.draft[row.slug] = post;
      }
    } else {
      data.page[row.slug] = post;
    }

    dirs.push(row.slug + ext);

    var dir = path.resolve.apply(path, dirs);

    fs.writeFile(dir, body, 'utf8')
      .catch(function (error) {
        console.log('---------');
        console.error(error.stack);
        process.exit(1);
      });
  };
}

function importer() {
  var db = null;
  return new Promise(function (resolve, reject) {
    console.log('reading sqlite3 %s', config.database);
    db = new sqlite3.Database(config.database, sqlite3.OPEN_READONLY);

    db.all('SELECT pt.post_id, t.slug FROM posts_tags pt, tags t WHERE pt.tag_id = t.id', function (error, ids) {
      if (error) {
        return reject(error);
      }

      var data = {};

      ids.forEach(function (id) {
        if (!data[id.post_id]) {
          data[id.post_id] = [];
        }

        data[id.post_id].push(id.slug);
      });

      resolve(data);
    });
  })
  .then(function (tags) {
    return new Promise(function (resolve, reject) {
      db.each('SELECT * FROM posts', save(tags), resolve);
    });
  })
  .then(write('blog'))
  .then(write('draft'))
  .then(write('page'))
  .then(function () {
    console.log('database closed, done with posts');
    db.close();
  })
  .catch(function (error) {
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = function (c) {
  return new Promise(function () {
    config = c;
    return importer();
  });
}