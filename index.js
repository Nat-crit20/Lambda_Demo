import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

export const handler = async (event) => {
  // Read data from event object.
  const region = event.Records[0].awsRegion;
  const sourceBucket = event.Records[0].s3.bucket.name;
  const sourceKey = event.Records[0].s3.object.key;
  // Instantiate a new S3 client.
  try {
    const s3Client = new S3Client({
      region: region,
    });
    const params = {
      Bucket: sourceBucket,
      Key: sourceKey,
    };

    const { Body } = await s3Client.send(new GetObjectCommand(params));

    // Resize the image
    const resizedImage = await sharp(Body)
      .resize(200, 200) // Specify the desired dimensions
      .toBuffer();

    // Upload the resized image to the target S3 bucket
    await s3Client.send(
      new PutObjectCommand({
        Bucket: "mylambas3bucketdemo",
        Key: sourceKey, // Use the same key as the original image
        Body: resizedImage,
      })
    );

    return "Image resized and uploaded successfully";
  } catch (error) {
    console.error(error);
    throw error;
  }
};
