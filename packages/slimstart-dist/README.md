# slimstart-dist

The project sitepackage to use together with `slimstart`. This is meant to be customized per project. Its "just" a boilerplate. `slimstart` is a standalone extension that is meant to be upgradable.

## Content Elements

Most of the cores content elements are disabled by default to provide a minimal starting point. We use [Content Blocks](https://docs.typo3.org/p/friendsoftypo3/content-blocks/main/en-us/) and its recommended to create custom content elements as Content Blocks. You can use the custom `make:content-block` DDEV command to generate new Content Blocks.

## Frontend

`slimstart-dist` uses [Vite](https://vitejs.dev/) for the frontend assets and [Tailwind CSS](https://tailwindcss.com/) for styling.
