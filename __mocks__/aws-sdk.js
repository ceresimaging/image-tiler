import fs from 'fs-extra';

export default {
  CloudFront: jest.fn(() => ({
    createInvalidation: jest.fn((params) => ({
      promise: jest.fn().mockResolvedValue({
        Invalidation: params
      })
    })),
    waitFor: jest.fn((state, params) => ({
      promise: jest.fn().mockResolvedValue()
    }))
  })),
  S3: jest.fn(() => ({
    getObject: jest.fn(({ Bucket, Key }) => ({
      promise: [process.env.IMAGERY_BUCKET, process.env.CUSTOM_LAYERS_BUCKET].includes(Bucket)
        ? jest.fn().mockResolvedValue({
          Body: fs.readFileSync(`${process.cwd()}/test/fixtures/${Bucket}/${Key}${Bucket === process.env.CUSTOM_LAYERS_BUCKET ? '.zip' : ''}`)
        })
        : jest.fn().mockRejectedValue({ code: 'NoSuchKey' })
    }))
  }))
};
