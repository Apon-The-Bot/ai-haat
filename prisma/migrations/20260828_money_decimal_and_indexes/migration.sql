-- Migration: 20260828_money_decimal_and_indexes
-- Description: Hardens financial precision from Float to DECIMAL(12, 2) and adds critical FK indexes
-- Tested and Prepared for Production Maintenance Window

-- 1. Create RateLimitBucket Table for PM2 Shared Cluster Rate Limiting
CREATE TABLE IF NOT EXISTS `rate_limit_buckets` (
    `key` VARCHAR(191) NOT NULL,
    `count` INT NOT NULL DEFAULT 1,
    `windowStart` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    PRIMARY KEY (`key`),
    INDEX `rate_limit_buckets_expiresAt_idx` (`expiresAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Foreign Key & Performance Indexes
ALTER TABLE `orders` ADD INDEX IF NOT EXISTS `orders_userId_idx` (`userId`);
ALTER TABLE `order_items` ADD INDEX IF NOT EXISTS `order_items_orderId_idx` (`orderId`);
ALTER TABLE `order_items` ADD INDEX IF NOT EXISTS `order_items_productId_idx` (`productId`);
ALTER TABLE `order_items` ADD INDEX IF NOT EXISTS `order_items_variationId_idx` (`variationId`);
ALTER TABLE `delivered_keys` ADD INDEX IF NOT EXISTS `delivered_keys_orderId_idx` (`orderId`);
ALTER TABLE `delivered_keys` ADD INDEX IF NOT EXISTS `delivered_keys_userId_idx` (`userId`);
ALTER TABLE `delivered_keys` ADD INDEX IF NOT EXISTS `delivered_keys_orderItemId_idx` (`orderItemId`);
ALTER TABLE `proofs` ADD INDEX IF NOT EXISTS `proofs_orderId_idx` (`orderId`);

-- 3. Financial Precision: Float -> DECIMAL(12, 2) Conversion
-- Users
ALTER TABLE `users` MODIFY `walletBalanceBDT` DECIMAL(12, 2) NOT NULL DEFAULT 0.00;

-- Products
ALTER TABLE `products` 
    MODIFY `minPriceBDT` DECIMAL(12, 2) NOT NULL,
    MODIFY `maxPriceBDT` DECIMAL(12, 2) NOT NULL,
    MODIFY `regularPriceBDT` DECIMAL(12, 2) NULL,
    MODIFY `salePriceBDT` DECIMAL(12, 2) NULL,
    MODIFY `costPriceBDT` DECIMAL(12, 2) NULL;

-- Variations
ALTER TABLE `variations` 
    MODIFY `priceBDT` DECIMAL(12, 2) NOT NULL,
    MODIFY `regularPriceBDT` DECIMAL(12, 2) NULL,
    MODIFY `salePriceBDT` DECIMAL(12, 2) NULL,
    MODIFY `costPriceBDT` DECIMAL(12, 2) NULL;

-- Orders
ALTER TABLE `orders` 
    MODIFY `subtotalBDT` DECIMAL(12, 2) NOT NULL,
    MODIFY `discountBDT` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    MODIFY `totalBDT` DECIMAL(12, 2) NOT NULL,
    MODIFY `refundedBDT` DECIMAL(12, 2) NOT NULL DEFAULT 0.00;

-- Order Items
ALTER TABLE `order_items` 
    MODIFY `priceBDT` DECIMAL(12, 2) NOT NULL,
    MODIFY `refundedBDT` DECIMAL(12, 2) NOT NULL DEFAULT 0.00;

-- Wallet Transactions
ALTER TABLE `wallet_transactions` 
    MODIFY `amountBDT` DECIMAL(12, 2) NOT NULL;

-- Coupons
ALTER TABLE `coupons` 
    MODIFY `discountValue` DECIMAL(12, 2) NOT NULL,
    MODIFY `minOrderBDT` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    MODIFY `maxDiscountBDT` DECIMAL(12, 2) NULL;

-- Refunds
ALTER TABLE `refunds` 
    MODIFY `requestedAmountBDT` DECIMAL(12, 2) NOT NULL,
    MODIFY `approvedAmountBDT` DECIMAL(12, 2) NULL;

-- Affiliate Profiles
ALTER TABLE `affiliate_profiles` 
    MODIFY `customRatePercent` DECIMAL(5, 2) NULL,
    MODIFY `earningsBalanceBDT` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    MODIFY `totalEarnedBDT` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    MODIFY `totalPaidBDT` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    MODIFY `totalReferredGMVBDT` DECIMAL(12, 2) NOT NULL DEFAULT 0.00;

-- Affiliate Commissions
ALTER TABLE `affiliate_commissions` 
    MODIFY `orderTotalBDT` DECIMAL(12, 2) NOT NULL,
    MODIFY `commissionRatePercent` DECIMAL(5, 2) NOT NULL,
    MODIFY `commissionAmountBDT` DECIMAL(12, 2) NOT NULL;

-- Affiliate Payout Requests
ALTER TABLE `affiliate_payout_requests` 
    MODIFY `amountBDT` DECIMAL(12, 2) NOT NULL;
