const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const sharp = require('sharp');
const crypto = require('crypto');

/**
 * @param original_epub original epub path
 * @param options Options when initializing compress epub, default quality: 5, output: 'buffer', outputDir: '/tmp/out'+random, debug: false
 */
module.exports = async (original_epub, options={}) => {

	const opt = {
		quality: 9,
		output: 'buffer',
		outputDir: '/tmp/out'+crypto.randomBytes(4).toString('hex'),
		debug: false,
		...options
	};
	
	this.debug = opt.debug;
	const outputDir = opt.outputDir;
	const output = opt.output;

	// Functions

		const debug = (message) => {
			if(this.debug) console.log(message);
		}

		const getFilesByExtension = (folder, allowedExtensions, foundFiles = []) => {
			const files = fs.readdirSync(folder);

			files.forEach(file => {
				const fullPath = path.join(folder, file);
				const isDirectory = fs.statSync(fullPath).isDirectory();

				if (isDirectory) {
					getFilesByExtension(fullPath, allowedExtensions, foundFiles);
				} else {
					// Check if the file extension is allowed
					const extension = path.extname(file).toLowerCase();
					if (allowedExtensions.includes(extension)) {
						foundFiles.push(fullPath);
					}
				}
			});

			return foundFiles;
		}

		const reduceImageQuality = async (filePath, quality) => {

			const qualityTable = {1: 1, 2: 10, 3: 30, 4: 40, 5: 50, 6: 60, 7: 70, 8: 80, 9: 90, 10: 100};
		
			try {
				// Check if file exists
				if (!fs.existsSync(filePath)) {
					throw new Error('File not found');
				}
		
				// Check if file is JPG or PNG
				const fileType = filePath.split('.').pop().toLowerCase();
				if (fileType !== 'jpg' && fileType !== 'jpeg' && fileType !== 'png') {
					throw new Error('Unsupported file format. Only JPG and PNG are supported.');
				}
		
				// Read the original image
				const image = sharp(filePath);
		
				// Resize and save with reduced quality
				if (fileType === 'jpeg' || fileType === 'jpg') {
					await image.jpeg({ quality: qualityTable[quality], mozjpeg: true }).toFile(filePath+"_tmp");
				} else if (fileType === 'png') {
					await image.png({compressionLevel: 0, quality: qualityTable[quality] }).toFile(filePath+"_tmp");
				}
		
				const oldFile = fs.statSync(filePath);
				const newFile = fs.statSync(filePath+"_tmp");
		
				if( oldFile.size > newFile.size){
					debug(`${filePath} reduce from ${oldFile.size} to ${newFile.size}`);
					fs.unlinkSync(filePath);
					fs.renameSync(filePath+"_tmp", filePath);
				}else{
					fs.unlinkSync(filePath+"_tmp");
				}
		
			} catch (error) {
				console.error('Error reducing image quality:', error.message);
			}
		}

		const saveNewEpub = async (output, outputDir) => {

			return new Promise((resolve, reject)=>{
		
				const zip = new AdmZip();
		
				zip.addLocalFolder(outputDir);

				if(output === 'buffer'){
					return resolve(zip.toBuffer());
				}

				zip.writeZip(output, function(err) {
					if (err) {
						throw(err);
					}
					
					return resolve(output);
	
				});
			});
		
		
		}


	const zip = new AdmZip(original_epub);

	try {
		zip.extractAllTo(outputDir, true);
		debug('Decompression completes successfully');

		const filesImage = getFilesByExtension(outputDir, ['.jpg', '.jpeg', '.png']);
	
		for (const file of filesImage) { await reduceImageQuality(file, opt.quality); }

		const out = await saveNewEpub(output, outputDir);

		fs.rmSync(outputDir, { recursive: true, force: true });
		debug(`Remove outputDir: ${outputDir}`);

		return out;

	  } catch (error) {
		throw(error);
	  }

}