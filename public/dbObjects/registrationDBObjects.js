/*
 * Partition key:
 * Partition key is a simple but important design choice in Azure Cosmos DB. 
 * Once you select your partition key, it is not possible to change it in-place. 
 * If you need to change your partition key, you should move your data to a new container with your new desired partition key.
 * ref: https://docs.microsoft.com/en-us/azure/cosmos-db/partitioning-overview
 * 
 * Unique key:
 * You can't update an existing container to use a different unique key. 
 * In other words, after a container is created with a unique key policy, the policy can't be changed.
 * ref: https://docs.microsoft.com/en-us/azure/cosmos-db/unique-keys#define-a-unique-key
 */

/*
 *  Example of the basic container object:
 *  {
 *      id: "containername",
 *      partitionKey: "/partitionKey"
 *  }
 *
 *  Example of container with unique keys:
 *  {
 *      id: "containername",
 *      partitionKey: "/partitionKey",
 *      uniqueKeyPolicy: {
 *          uniqueKeys: [
 *              {
 *                  paths: [
 *                      '/uniqueKey1',
 *                      '/uniqueKey1',
 *                      '/uniqueKey3'
 *                  ]
 *              }
 *          ]
 *      }
 *  }
 *  
 *  Example of container with unique keys and stored procedures:
 *  {
 *      id: "containername",
 *      partitionKey: "/partitionKey",
 *      uniqueKeyPolicy: {
 *          uniqueKeys: [
 *              {
 *                  paths: [
 *                      '/uniqueKey1',
 *                      '/uniqueKey2'
 *                  ]
 *              }
 *          ]
 *      },
 *      storedProcedures: [
 *          'storedProcedure1',
 *          'storedProcedure2'
 *      ]
 *  }
 */

module.exports = Object.freeze({
    databaseName: "PrismDB",
    containers: [
        {
            id: "Registration",
            partitionKey: "/SkuNumber"
        }
    ]
});