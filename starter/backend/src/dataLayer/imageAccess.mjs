import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3"
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'
import {createLogger} from "../utils/logger.mjs";

const logger = createLogger('image-access')


export class ImageAccess {
    constructor(
        bucketName = process.env.IMAGES_S3_BUCKET,
        urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION),
        s3Client = new S3Client()
    ) {
        this.s3Client = s3Client
        this.bucketName = bucketName
        this.urlExpiration = urlExpiration
    }

    async getSignedUrl(todoId) {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: todoId
        })
        const url = await getSignedUrl(this.s3Client, command, {
            expiresIn: this.urlExpiration
        })
        return url
    }
}