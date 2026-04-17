import mongoose from 'mongoose';

const uri = 'mongodb://127.0.0.1:27017/arfashion';

console.log('Testing connection to LOCALHOST:', uri);

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('✅ Connected successfully to LOCALHOST!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    });
