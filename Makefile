include .env
export

.PHONY: deploy build sync invalidate dev preview

dev:
	@echo "Starting development server..."
	bun run dev

build:
	@echo "Building project..."
	bun run build

preview:
	@echo "Previewing build..."
	bun run preview

sync:
	@echo "Syncing to S3..."
	aws s3 sync dist/ s3://${S3_BUCKET_NAME} --delete

invalidate:
	@echo "Invalidating CloudFront cache..."
	@if [ -z "$$CLOUDFRONT_DISTRIBUTION_ID" ]; then \
		echo "Warning: CLOUDFRONT_DISTRIBUTION_ID not set in .env, skipping cache invalidation"; \
	else \
		aws cloudfront create-invalidation --distribution-id $$CLOUDFRONT_DISTRIBUTION_ID --paths "/*"; \
		echo "Cache invalidation initiated - changes will be live shortly"; \
	fi

deploy: build sync invalidate
	@echo "Deployment complete!"