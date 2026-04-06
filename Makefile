include .env
export

# NOTE: Security headers (X-Frame-Options, X-Content-Type-Options, etc.) should
# be configured in the CloudFront distribution's Response Headers Policy.
# See public/_headers for the full list of desired headers.

deploy:
	bun run build
	aws s3 sync dist/ s3://${S3_BUCKET_NAME} --delete
	aws cloudfront create-invalidation --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} --paths "/*"
