const nunjucks = require('nunjucks');
const fs = require('fs');
const json = './json/data.json';
const mkdirp = require('mkdirp');
const obj = JSON.parse(fs.readFileSync(json, 'utf8'));
const projectCount = obj.projects.length;

const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader('./src/templates')
);

const makeFileName = title => {
  return title
    .replace(/ /g, '_')
    .replace(/,/g, '')
    .replace(/'/g, '')
    .toLowerCase();
};

const processInfo = () => {
  for (let i = 0; i < projectCount; i++) {
    const info = obj.projects[i];
    info.title = obj.projects[i].S_Title_t;
    info.template = obj.projects[i].S_template;
    info.content = obj.projects[i].S_Screen;
    info.outfile = makeFileName(info.title);

    if (i !== 0) {
      info.prevTitle = obj.projects[i - 1].S_Title_t;
    } else {
      info.prevTitle = obj.projects[projectCount - 1].S_Title_t;
    }
    info.pagePrev = makeFileName(info.prevTitle);

    if (i < projectCount - 1) {
      info.nextTitle = obj.projects[i + 1].S_Title_t;
    } else {
      info.nextTitle = obj.projects[0].S_Title_t;
    }
    info.pageNext = makeFileName(info.nextTitle);

    const infile = `./src/templates/${info.template}.njk`;
    render_for_info(info, infile);
  }
};

const processIndex = () => {
  let indexGrid = '';
  for (let i = 0; i < projectCount; i++) {
    const title = obj.projects[i].S_Title_t;
    const fn = makeFileName(title);
    indexGrid += `
    <article>
      <figure>
        <a href="${fn}.html">
          <picture>
            <source media="(min-width: 30em)" srcset="images/thumb-${fn}-lg.${
      obj.projects[i].S_thumb_format
    }">
            <img src="images/thumb-${fn}-sm.${
      obj.projects[i].S_thumb_format
    }" alt="${title}">
          </picture>
        </a>
        <figcaption class="visually-hidden">${title}</figcaption>
      </figure>
      <h2><a href="${fn}.html">${title}</a></h2>
      <p>${obj.projects[i].S_Blurb}</p>
    </article>
    `;
  }

  const infile = './src/templates/index.njk';
  const str = fs.readFileSync(infile, 'utf8');
  const res = env.renderString(str, {
    projectGrid: indexGrid
  });
  const dir = './build/';
  mkdirp.sync(dir);
  fs.writeFileSync(`${dir}index.html`, res, 'utf8');
};

const render_for_info = (info, infile) => {
  const str = fs.readFileSync(infile, 'utf8');
  const res = env.renderString(str, info);
  const dir = './build/';
  mkdirp.sync(dir);
  fs.writeFileSync(`${dir}${info.outfile}.html`, res, 'utf8');
};

processInfo();
processIndex();
