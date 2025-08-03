import {connectDb , client} from '../common/utils.js'
import envVariables from "../common/envConfig.js";
const {MONGODB_COLLECTION_NAME , MONGODB_SEARCH_INDEX_NAME} = envVariables;

async function isSearchIndexExists(collectionName , indexName){
    const db = await connectDb();
    const collection = db.collection(collectionName)
    const existingIndex = await collection.listSearchIndexes().toArray();
    return existingIndex.some((idx)=>idx.name === indexName);
}

export default async function initSearch() {
    try {
        const db = await connectDb();
        const collection = db.collection(MONGODB_COLLECTION_NAME);
        const exist = await isSearchIndexExists(MONGODB_COLLECTION_NAME , MONGODB_SEARCH_INDEX_NAME);
        if(exist){
            console.log(`Search index ${MONGODB_SEARCH_INDEX_NAME} exists Good to Go >>`);
        }else{
          console.log(`Creating Search index With Name ${MONGODB_SEARCH_INDEX_NAME}`);
            const index = {
                name: MONGODB_SEARCH_INDEX_NAME,
                type: 'search',
                definition: {
                  mappings: {
                    dynamic: false,
                    fields: {
                      embeddingKey: {
                        type: 'knnVector',
                        dimensions: 768,
                        similarity: 'cosine'
                      },
                      textKey: {
                        type: 'string'
                      }
                    }
                  }
                }
            }
            await collection.createSearchIndex(index);
            console.log(`Search index '${MONGODB_SEARCH_INDEX_NAME}' created Good to Go >>`);
        }
    } catch (error) {
        console.error('Error while initializing search index:', error);
    }finally{
        await client.close();
    }    
}

