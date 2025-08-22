import type {
  CopyObjectCommandInput,
  CreateBucketCommandInput,
  DeleteBucketCommandInput,
  DeleteObjectCommandInput,
  GetObjectCommandInput,
  HeadObjectCommandInput,
  ListObjectsV2CommandInput,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";

import {
  CopyObjectCommand,
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configuration interface
export interface TigrisConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
  endpoint?: string;
}

// Upload options interface
export interface UploadOptions {
  bucket: string;
  key: string;
  body: Buffer | Uint8Array | string | ReadableStream;
  contentType?: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  expires?: Date;
  serverSideEncryption?: string;
  storageClass?: string;
}

// Download options interface
export interface DownloadOptions {
  bucket: string;
  key: string;
  range?: string; // e.g., "bytes=0-1023"
  ifModifiedSince?: Date;
  ifUnmodifiedSince?: Date;
  ifMatch?: string;
  ifNoneMatch?: string;
}

// List objects options interface
export interface ListObjectsOptions {
  bucket: string;
  prefix?: string;
  delimiter?: string;
  maxKeys?: number;
  continuationToken?: string;
  startAfter?: string;
}

// Object metadata interface
export interface ObjectMetadata {
  key: string;
  lastModified?: Date;
  etag?: string;
  size?: number;
  storageClass?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

// Presigned URL options interface
export interface PresignedUrlOptions {
  bucket: string;
  key: string;
  expiresIn?: number; // seconds, default 3600 (1 hour)
  operation?: "GET" | "PUT" | "DELETE";
}

// Copy object options interface
export interface CopyObjectOptions {
  sourceBucket: string;
  sourceKey: string;
  destinationBucket: string;
  destinationKey: string;
  metadata?: Record<string, string>;
  metadataDirective?: "COPY" | "REPLACE";
  contentType?: string;
}

export class TigrisClient {
  private s3Client: S3Client;

  constructor(config: TigrisConfig) {
    this.s3Client = new S3Client({
      region: config.region || "auto",
      endpoint: config.endpoint || "https://fly.storage.tigris.dev",
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true, // Required for Tigris
    });
  }

  /**
   * Upload a file to Tigris storage
   */
  async uploadFile(options: UploadOptions): Promise<string> {
    try {
      const uploadParams: PutObjectCommandInput = {
        Bucket: options.bucket,
        Key: options.key,
        Body: options.body,
        ContentType: options.contentType,
        Metadata: options.metadata,
        CacheControl: options.cacheControl,
        ContentDisposition: options.contentDisposition,
        ContentEncoding: options.contentEncoding,
        Expires: options.expires,
        // ServerSideEncryption: options.serverSideEncryption,
        // StorageClass: options.storageClass,
      };

      // For large files, use multipart upload
      if (this.isLargeFile(options.body)) {
        const upload = new Upload({
          client: this.s3Client,
          params: uploadParams,
          partSize: 5 * 1024 * 1024, // 5MB parts
          queueSize: 4, // 4 parallel uploads
        });

        const result = await upload.done();
        console.log("Upload result", result);
        return result.ETag || "";
      }
      else {
        const command = new PutObjectCommand(uploadParams);
        const result = await this.s3Client.send(command);
        return result.ETag || "";
      }
    }
    catch (error) {
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  /**
   * Download a file from Tigris storage
   */
  async downloadFile(options: DownloadOptions): Promise<{
    body: ReadableStream | Blob | Buffer;
    metadata: ObjectMetadata;
  }> {
    try {
      const downloadParams: GetObjectCommandInput = {
        Bucket: options.bucket,
        Key: options.key,
        Range: options.range,
        IfModifiedSince: options.ifModifiedSince,
        IfUnmodifiedSince: options.ifUnmodifiedSince,
        IfMatch: options.ifMatch,
        IfNoneMatch: options.ifNoneMatch,
      };

      const command = new GetObjectCommand(downloadParams);
      const result = await this.s3Client.send(command);

      if (!result.Body) {
        throw new Error("No body returned from download");
      }

      const metadata: ObjectMetadata = {
        key: options.key,
        lastModified: result.LastModified,
        etag: result.ETag,
        size: result.ContentLength,
        storageClass: result.StorageClass,
        contentType: result.ContentType,
        metadata: result.Metadata,
      };

      return {
        body: result.Body as ReadableStream | Blob | Buffer,
        metadata,
      };
    }
    catch (error) {
      console.log("Failed to donwload file:", error);
      throw new Error(`Failed to download file: ${error}`);
    }
  }

  /**
   * Get file metadata without downloading the file
   */
  async getFileMetadata(bucket: string, key: string): Promise<ObjectMetadata> {
    try {
      const params: HeadObjectCommandInput = {
        Bucket: bucket,
        Key: key,
      };

      const command = new HeadObjectCommand(params);
      const result = await this.s3Client.send(command);

      return {
        key,
        lastModified: result.LastModified,
        etag: result.ETag,
        size: result.ContentLength,
        storageClass: result.StorageClass,
        contentType: result.ContentType,
        metadata: result.Metadata,
      };
    }
    catch (error) {
      throw new Error(`Failed to get file metadata: ${error}`);
    }
  }

  /**
   * Delete a file from Tigris storage
   */
  async deleteFile(bucket: string, key: string): Promise<void> {
    try {
      const params: DeleteObjectCommandInput = {
        Bucket: bucket,
        Key: key,
      };

      const command = new DeleteObjectCommand(params);
      await this.s3Client.send(command);
    }
    catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  /**
   * List objects in a bucket
   */
  async listObjects(options: ListObjectsOptions): Promise<{
    objects: ObjectMetadata[];
    isTruncated: boolean;
    nextContinuationToken?: string;
  }> {
    try {
      const params: ListObjectsV2CommandInput = {
        Bucket: options.bucket,
        Prefix: options.prefix,
        Delimiter: options.delimiter,
        MaxKeys: options.maxKeys,
        ContinuationToken: options.continuationToken,
        StartAfter: options.startAfter,
      };

      const command = new ListObjectsV2Command(params);
      const result = await this.s3Client.send(command);

      const objects: ObjectMetadata[] = (result.Contents || []).map(obj => ({
        key: obj.Key || "",
        lastModified: obj.LastModified,
        etag: obj.ETag,
        size: obj.Size,
        storageClass: obj.StorageClass,
      }));

      return {
        objects,
        isTruncated: result.IsTruncated || false,
        nextContinuationToken: result.NextContinuationToken,
      };
    }
    catch (error) {
      throw new Error(`Failed to list objects: ${error}`);
    }
  }

  /**
   * Create a new bucket
   */
  async createBucket(bucketName: string, region?: string): Promise<void> {
    try {
      const params: CreateBucketCommandInput = {
        Bucket: bucketName,
        // CreateBucketConfiguration: region ? { LocationConstraint: region } : undefined,
      };

      const command = new CreateBucketCommand(params);
      await this.s3Client.send(command);
    }
    catch (error) {
      throw new Error(`Failed to create bucket: ${error}`);
    }
  }

  /**
   * Delete a bucket
   */
  async deleteBucket(bucketName: string): Promise<void> {
    try {
      const params: DeleteBucketCommandInput = {
        Bucket: bucketName,
      };

      const command = new DeleteBucketCommand(params);
      await this.s3Client.send(command);
    }
    catch (error) {
      throw new Error(`Failed to delete bucket: ${error}`);
    }
  }

  /**
   * List all buckets
   */
  async listBuckets(): Promise<Array<{ name: string; creationDate?: Date }>> {
    try {
      const command = new ListBucketsCommand({});
      const result = await this.s3Client.send(command);

      return (result.Buckets || []).map(bucket => ({
        name: bucket.Name || "",
        creationDate: bucket.CreationDate,
      }));
    }
    catch (error) {
      throw new Error(`Failed to list buckets: ${error}`);
    }
  }

  /**
   * Copy an object from one location to another
   */
  async copyObject(options: CopyObjectOptions): Promise<string> {
    try {
      const params: CopyObjectCommandInput = {
        CopySource: `${options.sourceBucket}/${options.sourceKey}`,
        Bucket: options.destinationBucket,
        Key: options.destinationKey,
        Metadata: options.metadata,
        MetadataDirective: options.metadataDirective,
        ContentType: options.contentType,
      };

      const command = new CopyObjectCommand(params);
      const result = await this.s3Client.send(command);
      return result.CopyObjectResult?.ETag || "";
    }
    catch (error) {
      throw new Error(`Failed to copy object: ${error}`);
    }
  }

  /**
   * Generate a presigned URL for temporary access
   */
  async generatePresignedUrl(options: PresignedUrlOptions): Promise<string> {
    try {
      let command;

      switch (options.operation || "GET") {
        case "GET":
          command = new GetObjectCommand({
            Bucket: options.bucket,
            Key: options.key,
          });
          break;
        case "PUT":
          command = new PutObjectCommand({
            Bucket: options.bucket,
            Key: options.key,
          });
          break;
        case "DELETE":
          command = new DeleteObjectCommand({
            Bucket: options.bucket,
            Key: options.key,
          });
          break;
        default:
          throw new Error(`Unsupported operation: ${options.operation}`);
      }

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: options.expiresIn, // expiresIn udefined for indefinite
      });

      return signedUrl;
    }
    catch (error) {
      throw new Error(`Failed to generate presigned URL: ${error}`);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(bucket: string, key: string): Promise<boolean> {
    try {
      await this.getFileMetadata(bucket, key);
      return true;
    }
    catch {
      return false;
    }
  }

  /**
   * Stream upload for large files
   */
  async streamUpload(
    bucket: string,
    key: string,
    stream: ReadableStream,
    options?: {
      contentType?: string;
      metadata?: Record<string, string>;
    },
  ): Promise<string> {
    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: bucket,
          Key: key,
          Body: stream,
          ContentType: options?.contentType,
          Metadata: options?.metadata,
        },
        partSize: 5 * 1024 * 1024, // 5MB parts
        queueSize: 4,
      });

      // Track upload progress
      upload.on("httpUploadProgress", (progress) => {
        console.log(`Upload progress: ${progress.loaded}/${progress.total} bytes`);
      });

      const result = await upload.done();
      return result.ETag || "";
    }
    catch (error) {
      throw new Error(`Failed to stream upload: ${error}`);
    }
  }

  /**
   * Batch delete multiple objects
   */
  async deleteMultipleFiles(bucket: string, keys: string[]): Promise<void> {
    const deletePromises = keys.map(key => this.deleteFile(bucket, key));
    await Promise.all(deletePromises);
  }

  /**
   * Helper method to determine if a file is large enough for multipart upload
   */
  private isLargeFile(body: any): boolean {
    if (body instanceof Buffer) {
      return body.length > 5 * 1024 * 1024; // 5MB
    }
    if (typeof body === "string") {
      return Buffer.byteLength(body, "utf8") > 5 * 1024 * 1024;
    }
    return false; // For streams, always use multipart upload
  }
}

// Example usage
export class TigrisService {
  private client: TigrisClient;

  constructor(config: TigrisConfig) {
    this.client = new TigrisClient(config);
  }

  /**
   * Example: Upload a text file
   */
  async uploadTextFile(bucket: string, fileName: string, content: string): Promise<string> {
    return await this.client.uploadFile({
      bucket,
      key: fileName,
      body: content,
      contentType: "text/plain",
      metadata: {
        uploadedAt: new Date().toISOString(),
        fileType: "text",
      },
    });
  }

  /**
   * Example: Upload an image file
   */
  async uploadImageFile(
    bucket: string,
    fileName: string,
    imageBuffer: Buffer,
    mimeType: string,
  ): Promise<string> {
    return await this.client.uploadFile({
      bucket,
      key: `images/${fileName}`,
      body: imageBuffer,
      contentType: mimeType,
      metadata: {
        uploadedAt: new Date().toISOString(),
        fileType: "image",
      },
      cacheControl: "max-age=31536000", // Cache for 1 year
    });
  }

  /**
   * Example: Download and convert to string
   */
  async downloadTextFile(bucket: string, key: string): Promise<string> {
    const result = await this.client.downloadFile({ bucket, key });

    if (result.body instanceof Buffer) {
      return result.body.toString("utf-8");
    }

    // Handle ReadableStream
    if (result.body instanceof ReadableStream) {
      const reader = result.body.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done)
          break;
        chunks.push(value);
      }

      const buffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
      return buffer.toString("utf-8");
    }

    throw new Error("Unsupported body type");
  }

  /**
   * Example: Get all files in a directory
   */
  async getFilesInDirectory(bucket: string, directory: string): Promise<ObjectMetadata[]> {
    const result = await this.client.listObjects({
      bucket,
      prefix: directory.endsWith("/") ? directory : `${directory}/`,
    });

    return result.objects;
  }

  /**
   * Example: Create a temporary download link
   */
  async createDownloadLink(
    bucket: string,
    key: string,
    expiresInMinutes?: number,
  ): Promise<string> {
    return await this.client.generatePresignedUrl({
      bucket,
      key,
      operation: "GET",
      expiresIn: expiresInMinutes ? expiresInMinutes * 60 : undefined, // Convert minutes to seconds
    });
  }
}

// Usage example:
/*
const tigrisConfig: TigrisConfig = {
  accessKeyId: process.env.TIGRIS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.TIGRIS_SECRET_ACCESS_KEY!,
  region: 'auto', // Tigris uses 'auto' for global distribution
};

const tigrisService = new TigrisService(tigrisConfig);

// Example usage:
async function example() {
  try {
    // Upload a file
    const etag = await tigrisService.uploadTextFile(
      'my-bucket',
      'hello.txt',
      'Hello, Tigris!'
    );
    console.log('Uploaded with ETag:', etag);

    // Download the file
    const content = await tigrisService.downloadTextFile('my-bucket', 'hello.txt');
    console.log('Downloaded content:', content);

    // List files
    const files = await tigrisService.getFilesInDirectory('my-bucket', '');
    console.log('Files:', files);

    // Create temporary link
    const downloadLink = await tigrisService.createTemporaryDownloadLink(
      'my-bucket',
      'hello.txt',
      30 // 30 minutes
    );
    console.log('Temporary download link:', downloadLink);
  } catch (error) {
    console.error('Error:', error);
  }
}
*/
