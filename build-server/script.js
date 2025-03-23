const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const mime = require('mime-types')

// AWS S3 Config
const s3Client = new S3Client({
    // region: '', // Example: "us-east-1"
    // credentials: {
    //    accessKeyId: '',
    //     secretAccessKey: '' 
    //} uncomment this 
});

// Get project directory
const projectDir = process.cwd();

// Step 1: Check for both 'dist' and 'build' folders
const distFolderPath = path.join(projectDir, 'dist');   // Vite
const buildFolderPath = path.join(projectDir, 'build'); // Create React App

let outputFolderPath = null;

// Step 2: Determine which folder exists
if (fs.existsSync(distFolderPath)) {
    outputFolderPath = distFolderPath;
} else if (fs.existsSync(buildFolderPath)) {
    outputFolderPath = buildFolderPath;
} else {
    console.error('Error: Neither "dist" nor "build" folder found.');
    process.exit(1);
}

console.log(`Deploying files from ${outputFolderPath}`);

// Step 3: Upload files to S3
const folderContents = fs.readdirSync(outputFolderPath, { recursive: true });

(async () => {
    for (const file of folderContents) {
        const filePath = path.join(outputFolderPath, file);
        if (fs.lstatSync(filePath).isDirectory()) continue;

        console.log(`Uploading ${filePath}`);

        const s3UploadCommand = new PutObjectCommand({
            Bucket: "your-bucket-name",  // Replace with your bucket
            Key: `_outputs/${file}`, // S3 path
            Body: fs.createReadStream(filePath),
            ContentType: mime.getType(filePath) || "application/octet-stream",
        });

        await s3Client.send(s3UploadCommand);
        console.log(`Uploaded: ${filePath}`);
    }
})();
