const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function testMongoDBConnection() {
    console.log('\n=== MongoDB Connection ===\n');
    
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
        console.error('MONGODB_URI not found in .env file');
        process.exit(1);
    }

    console.log('MONGODB_URI:', mongoUri.substring(0, 50) + '...');
    console.log('Attempt connection...\n');

    try {

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: 5000,
            serverSelectionTimeoutMS: 5000
        });

        console.log('Successfully connected to MongoDB!\n');
        
        // Test operations
        const db = mongoose.connection;
        const collections = await db.db.listCollections().toArray();
        
        console.log('Database name:', db.name);
        console.log('Server:', db.host);
        console.log('Collections:', collections.length);
        collections.forEach(col => {
            console.log(' -', col.name);
        });

        console.log('\n✓ MongoDB is ready for use!\n');
        
        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('Connection failed!\n');
        console.error('Error:', error.message);
        process.exit(1);
    }
}

testMongoDBConnection();
