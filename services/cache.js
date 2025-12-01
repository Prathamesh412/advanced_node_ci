const mongoose = require('mongoose')
const redis = require('redis');
const keys = require('../config/keys');

const client = redis.createClient({
    url: keys.redisUrl
});

let isConnected = false;

client.on('error', err => {
    console.log('Error connecting to Redis', err);
    isConnected = false;
});

client.on('connect', () => {
    console.log('Redis client connecting...');
});

client.on('ready', () => {
    console.log('Redis client ready');
    isConnected = true;
});

client.on('end', () => {
    console.log('Redis client disconnected');
    isConnected = false;
});

// Connect to Redis
client.connect().catch(err => {
    console.log('Failed to connect to Redis:', err.message);
    console.log('Continuing without Redis cache...');
});

const exec = mongoose.Query.prototype.exec;

// cache middleware

mongoose.Query.prototype.cache = function(){
    this.useCache = true;
    //this.hashKey = JSON.stringify(options.key || '');
    return this;
}

// Override the exec function
mongoose.Query.prototype.exec = async function(){


    if(!this.useCache){
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify( Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    // See if we have a value for 'key' in redis
    let cachedValue = null;
    if (isConnected && client.isOpen) {
        try {
            cachedValue = await client.get(key);
        } catch (err) {
            console.log('Redis get error:', err.message);
        }
    }

    if(cachedValue){
        console.log('*** I am about to return a cached value for', cachedValue);
        const doc = JSON.parse(cachedValue);
        return Array.isArray(doc) 
            ? doc.map(d => new this.model(d))
            : new this.model(doc);
    }

   const result = await exec.apply(this, arguments);
   
   // Cache the result
   if (isConnected && client.isOpen && result) {
       try {
           const value = Array.isArray(result) 
               ? result.map(doc => doc.toObject ? doc.toObject() : doc)
               : (result.toObject ? result.toObject() : result);
           await client.setEx(key, 3600, JSON.stringify(value));
       } catch (err) {
           console.log('Redis set error:', err.message);
       }
   }

   return result;
}

// Function to clear cache by pattern
const clearHash = async (hashKey) => {
    if (isConnected && client.isOpen) {
        try {
            // Get all keys matching the pattern
            const keys = await client.keys('*');
            const matchingKeys = keys.filter(key => {
                try {
                    const parsed = JSON.parse(key);
                    return parsed.collection === hashKey;
                } catch (e) {
                    return false;
                }
            });
            
            if (matchingKeys.length > 0) {
                await client.del(matchingKeys);
                console.log(`Cleared ${matchingKeys.length} cache entries for collection: ${hashKey}`);
            }
        } catch (err) {
            console.log('Redis clearHash error:', err.message);
        }
    }
};

module.exports = {
    clearHash
};