# Revision history for shipitjs

0.3.2 / 2018-08-23
==================

  * Update semver(5.5.1)

0.3.1 / 2017-06-02
==================

  * Use fs.writeSync instead of fs.write

0.3.0 / 2015-01-31
==================

  * Support Semantic Versioning 2.0

0.2.5 / 2015-01-28
==================

  * Remove "preferGlobal" from package.json

0.2.4 / 2014-12-26
==================

  * Fixed error when release subcommand(issue#7)

0.2.3 / 2013-05-27
==================

  * Add configuration for customize the messages generated in the Tag and Commit steps.

0.2.2 / 2013-05-24
==================

  * Improved wording (Thanks to execjosh)
  * Fixed error when step configuration is missing

0.2.1 / 2013-04-16
===================

  * Fixed git repository URL in package.json
  * Fixed typo in README

0.2.0 / 2013-04-15
===================

  * Support versioning from pacakge.ls (clkao)

0.1.15 / 2012-07-19
===================

  * Add "bugs" to package.json

0.1.14 / 2012-07-04
===================

  * Change usage of Readline API(for node v0.8)

0.1.13 / 2012-06-26
===================

  * Change dependency module version for node v0.8 support

0.1.12 / 2012-06-17
===================

  * Change package name

0.1.11 / 2012-06-14
==================

  * node v0.7.10 support

0.1.10 / 2012-06-14
==================

  * Change path.exists() to fs.exists()

0.1.9 / 2012-06-13
==================

  * Remove unused library

0.1.8 / 2012-03-22
==================

  * Fixed runtime error.(Thanks to leecookson.)

0.1.7 / 2011-11-19
==================

  * Change command interface `write-config` to `init` for simplification

0.1.6 / 2011-11-18
==================

  * Change internal methods
  * Improved comments
  * Add keywords in package.json

0.1.5 / 2011-11-16
==================

  * Change internal command processing.

0.1.4 / 2011-11-08
==================

  * Add Mercurial support

0.1.3 / 2011-11-06
==================

  * Fixed document
  * Fixed bug in Git
  * Chage git diff target(HEAD => Tag)

0.1.2 / 2011-11-05
==================

  * Fixed bug in git push

0.1.1 / 2011-11-04
==================

  * Add rollback feature
  * Add deleteTag() in VC/Git
  * Add resetRecentCommit() in VC/Git

0.1.0 / 2011-11-02
==================

  * path.existsSync () fs.readFileSync and () ceased to use
  * Change version replacement pattern

0.0.9 / 2011-10-28
==================

  * Add feature that update version in the main file

0.0.8 / 2011-10-25
==================

  * Remove unnecessary pause()/resume() in CheckChangeLog.js

0.0.7 / 2011-10-25
==================

  * Change option of spawn() for support Node v0.6.x

0.0.6 / 2011-10-23
==================

  * Fixed broken -x option

0.0.5 / 2011-10-23
==================

  * Fixed broken 'write-config' command

0.0.4 / 2011-10-21
==================

  * Change command-line interface
  * Fixed bug that git's settings does not reflected
  * Fixed bug that handling 'SignTag'
  * Documentation improved

0.0.3 / 2011-10-20
==================

  * Change command-line options
  * Dry-Run mode is default.

0.0.2 / 2011-10-19
==================

  * Improve 'CheckChangeLog' stability
  * Add confirm message to 'Publish'

0.0.1 / 2011-09-28
==================

  * Initial release
