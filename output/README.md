## Using the GitHub web editor for minor updates

The fastest way to contribute documentation to an existing page is to browse in the GitHub web UI to the relevant markdown file in the master branch of this repository and click the edit button.  When you save your work by committing it, GitHub will automatically create a fork and a PR for you or commit your change directly if you're a project committer.  To make documentation contributions easier, pull requests to this repository do not require the creation of JIRA ticket.  Nevertheless, a Drill project committer will still need to check and merge a submitted PR.

## Overview

The Apache Drill website is built by [Jekyll](http://jekyllrb.com/) from Markdown sources in designated branches of this repository.  The build process flows from left to right in the following table.

| Source Markdown branch                                                  | Generated HTML branch                                                           | Publish URL                     |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------- |
| [drill-site/master](https://github.com/apache/drill-site/tree/master)   | [drill-site/asf-site](https://github.com/apache/drill-site/tree/asf-site)       | https://drill.apache.org        |
| [drill-site/staging](https://github.com/apache/drill-site/tree/staging) | [drill-site/asf-staging](https://github.com/apache/drill-site/tree/asf-staging) | https://drill.staged.apache.org |

## Continuous Integration

When new commits are pushed to any of the listed source Markdown branches, a Jekyll website build will be kicked off.  You can monitor the build, which normally runs in about 3 minutes, and view its logs at https://ci2.apache.org/.  Once the build completes, the resulting website will automatically be committed to the corresponding HTML branch in the table above.  The commit to the HTML branch will result in a deployment to the corresponding publish URL.  While it is possible to push commits directly to the HTML branches to effect website updates, it's almost certain that you never want to do this and should be working in one of the Markdown branches.

At the time of writing, the staging website has no designated reponsibility and you may freely use it to test things out without worrying about what you clobber there.  Note that this means that others can freely clobber your staging deployments too.

## Building locally

For more extensive documentation contributions it is beneficial to build and serve the website locally.

## Configuring env

1. Install the Ruby language and Bundler.
2. Clone this repository and checkout a source Markdown branch.
3. In the project root directory, install gems with `bundle install`.
4. Install Python 3.

## Documentation Guidelines

The documentation pages are placed under `_docs`. You can modify existing .md files, or you can create new .md files to add to the Apache Drill documentation site. Create pull requests to submit your documentation updates. The Kramdown Markdown processor employed by Jekyll supports [a dialect of Markdown](https://kramdown.gettalong.org/quickref.html) which is a superset of standard Markdown.

### Creating New Markdown Files

If you create new Markdown (.md) files, include the required YAML front matter and name the file using the methods described in this section.

The YAML front matter has three important parameters:

- `title:` - This is the title of the page enclosed in quotation marks. Each page must have a _unique_ title
- `slug:` - Set this to the same value as `title`, it will be slugified automatically by Jekyll.
- `date:` - This field is needed for Jekyll to write a last-modified date. Initially, leave this field blank.
- `parent:` - This is the title of the page's parent page. It should be empty for top-level sections/guides, and be identical to the title attribute of another page in all other cases.

The name of the file itself doesn't matter except for the alphanumeric order of the filenames. Files that
share the same parent are ordered alphanumerically. Note that the content of parent files is ignored, so add an
overview/introduction child when needed.

Best practices:

- Prefix the filenames with `010-foo.md`, `020-bar.md`, `030-baz.md`, etc. This allows room to add files in-between
  (eg, `005-qux.md`).
- Use the slugified title as the filename. For example, if the title is "Getting Started with
  Drill", name the file `...-getting-started-with-drill.md`. If you're not sure what the slug is, you should be
  able to see it in the URL and then adjust (the URLs are auto-generated based on the title attribute).

## Developing and Previewing the Website

To preview the website on your local machine:

```bash
bundle exec jekyll build
bundle exec jekyll serve [--livereload] [--incremental]
```

Once you're happy with the results, commit to the source Markdown branch and push to your fork, or directly to drill-site if you're a Drill committer.

## One Time Setup for Last-Modified-Date

To automatically add the `last-modified-on date`, a one-time local setup is required:

1.  In your cloned directory of Drill, in `drill/.git/hooks`, create a file named `pre-commit` (no extension) that contains this script:

```
#!/bin/sh
# Contents of .git/hooks/pre-commit

git diff --cached --name-status | grep "^M" | while read a b; do
  cat $b | sed "/---.*/,/---.*/s/^date:.*$/date: $(date -u "+%Y-%m-%d")/" > tmp
  mv tmp $b
  git add $b
done
```

2. Make the file executable.

```
chmod +x pre-commit
```

On the page you create, in addition to the title, and `parent:`, you now need to add `date:` to the front matter of any file you create. For example:

```
---
title: "Configuring Multitenant Resources"
parent: "Configuring a Multitenant Cluster"
date:
---
```

Do not fill in or alter the date: field. Jekyll and git take care of that when you commit the file.

## Multilingual

Multilingual support was added to the website in June 2021 using the polyglot Jekyll plugin. The fallback language is set to English which means that when a translated page is not available the English version will be shown. This means that a language which is incompletely translated is still deployable with no adverse effects.

### Add a new language

1. Add the two-letter language code (`lang-code` forthwith) to the `languages` property in \_config.yml.
2. Add a `lang-code/` subdirectory to the root directory.
3. Add a `lang-code/` subdirectory to each collection that will be translated, e.g. `_docs/lang-code/`.
4. Check the `exclude_from_localization` list in \_config.yml to ensure that the content you
   want to translate is not excluded from processing by the multlingual plugin.

### Add translated site pages

The English versions of "site" pages such as index.html are stored in the root directory. Create corresponding translated pages under `lang-code/` in which you set `lang` in the front matter to `lang-code` and leave the `permalink` the same as the English page.

### Add translated collection pages

The English versions of "collection" pages such as the markdown under \_docs/ are stored in an en/ subdirectory of the collection root. Create corresponding translated pages in the collection under `lang-code/` in which you translate both `title` and `parent` in the front matter but leave the `slug` the same as the English page and set `lang` to `lang-code`. Once you've translated the `title` of a parent page, you will need to provide files for each of its children (which can still contain the original English content) and in each set `parent` to the translated `title` of the parent.

