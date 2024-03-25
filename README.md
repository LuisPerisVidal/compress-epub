# compress-epub

compress-epub is an npm package designed to compress .epub files up to 91% of their original size by compressing the images included in the epubs. It allows specifying a compression level from 1 to 10.

## Installation
You can install the package via npm:

```sh
npm install compress-epub
```

## Import

```javascript
const compressEpub = require('compress-epub');
import compressEpub from 'compress-epub';
```

## Examples


```javascript

// Return a buffer with the new epub compressed
const buffer = await compressEpub('stephenking.epub');

// Save the new file in the indicated path
await compressEpub('stephenking.epub', {output: './newfile.epub'});

// Example with all options
await compressEpub('stephenking.epub', {
	quality: 10, /* 1 to 10 */
	output: './newfile.epub',
	outputDir: '/tmp/out', // where epub are decompressed
	debug: false,
});

```



## Try online
You can try it in this page: https://compressepub.com/