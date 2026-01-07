const mongoose = require('mongoose')
require('dotenv').config()

/**
 * Script to remove redundant/unused indexes
 * This will reduce index size from ~1.2MB to ~400-500KB
 * 
 * Run: node scripts/removeRedundantIndexes.js
 */

const indexesToRemove = {
  users: [
    'role_1',           // Never query users by role alone
    'isActive_1',       // Never used in queries
    'createdAt_-1'      // Admin lists all users, no date filter
  ],
  products: [
    'createdBy_1_createdAt_-1',              // createdAt alone is sufficient
    'inStock_-1_stockQuantity_-1',           // Compound with category is better
    'category_1_name_1_description_1'        // Overlaps with text index + category
  ],
  reviews: [
    'product_1_createdAt_-1',   // product_1 alone is enough
    'user_1',                   // Never query reviews by user alone
    'product_1_user_1'          // Only used once for duplicate check (rare)
  ],
  orders: [
    'orderDate_-1',             // Covered by userId_1_orderDate_-1
    'products.productId_1'      // Never queried by productId
  ],
  profiles: [
    'completionStatus.isComplete_1',  // Never query by completion status
    'createdAt_-1'                    // Never sort profiles by date
  ],
  categories: [
    'isActive_1'    // Already filtering in code, small collection
  ],
  bundles: [
    'userId_1',         // Small collection, full scan is fine
    'purchaseDate_-1',  // Small collection
    'paymentStatus_1'   // Small collection
  ]
}

async function removeRedundantIndexes() {
  try {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(process.env.CONNECTION_STRING, {
      dbName: 'Ariuka'
    })
    
    const db = mongoose.connection.db
    console.log('✅ Connected!\n')

    // Get current stats
    const beforeStats = await db.stats()
    console.log(`📊 Before cleanup:`)
    console.log(`   Index Size: ${(beforeStats.indexSize / 1024).toFixed(2)} KB\n`)

    let totalRemoved = 0
    let totalFailed = 0

    for (const [collectionName, indexes] of Object.entries(indexesToRemove)) {
      console.log(`\n📁 ${collectionName}:`)
      
      for (const indexName of indexes) {
        try {
          await db.collection(collectionName).dropIndex(indexName)
          console.log(`   ✅ Removed: ${indexName}`)
          totalRemoved++
        } catch (error) {
          if (error.message.includes('index not found')) {
            console.log(`   ⏭️  Skipped: ${indexName} (doesn't exist)`)
          } else {
            console.log(`   ❌ Failed: ${indexName} - ${error.message}`)
            totalFailed++
          }
        }
      }
    }

    // Get updated stats
    const afterStats = await db.stats()
    const savedKB = (beforeStats.indexSize - afterStats.indexSize) / 1024

    console.log('\n' + '='.repeat(50))
    console.log('📈 SUMMARY')
    console.log('='.repeat(50))
    console.log(`   Indexes removed: ${totalRemoved}`)
    console.log(`   Failed: ${totalFailed}`)
    console.log(`   Index size before: ${(beforeStats.indexSize / 1024).toFixed(2)} KB`)
    console.log(`   Index size after:  ${(afterStats.indexSize / 1024).toFixed(2)} KB`)
    console.log(`   Space saved: ${savedKB.toFixed(2)} KB`)
    console.log('='.repeat(50))

    await mongoose.disconnect()
    console.log('\n✅ Done!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    await mongoose.disconnect()
    process.exit(1)
  }
}

removeRedundantIndexes()
